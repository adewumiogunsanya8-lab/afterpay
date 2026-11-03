import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { OrderStatus } from "@/lib/generated/prisma/enums";
import {
  FLUTTERWAVE_WEBHOOK_SECRET,
  verifyFlutterwaveSignature,
  verifyFlutterwaveTransaction,
} from "@/lib/flutterwave";

export const runtime = "nodejs";

type WebhookPayload = {
  event?: string;
  data?: {
    id?: string | number;
    tx_ref?: string;
    flw_ref?: string;
    status?: string;
    amount?: number;
    currency?: string;
  };
};

const EVENT_TO_STATUS: Record<string, string> = {
  "charge.completed": "paid",
  "charge.failed": "failed",
  "charge.cancelled": "cancelled",
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hash");

  if (!verifyFlutterwaveSignature(rawBody, signature, FLUTTERWAVE_WEBHOOK_SECRET)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = payload.event ?? "";
  const nextStatus = EVENT_TO_STATUS[event];

  // Nothing to do for events we don't track.
  if (!nextStatus) {
    return NextResponse.json({ received: true });
  }

  const reference = payload.data?.tx_ref;
  if (!reference) {
    return NextResponse.json({ received: true });
  }

  // Re-verify the transaction with Flutterwave before fulfilling the order.
  const txId = payload.data?.id;
  if (txId) {
    try {
      const verification = await verifyFlutterwaveTransaction(txId);
      if (
        verification.status !== "success" ||
        verification.data?.status !== "successful"
      ) {
        return NextResponse.json({ received: true });
      }
    } catch {
      return NextResponse.json({ received: true });
    }
  }

  try {
    await prisma.order.updateMany({
      where: { reference },
      data: { status: nextStatus as OrderStatus },
    });
  } catch (error) {
    console.error("Flutterwave webhook update failed", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}