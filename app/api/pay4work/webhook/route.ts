import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { OrderStatus } from "@/lib/generated/prisma/enums";
import {
  PAY4WORK_WEBHOOK_SECRET,
  verifyPay4WorkSignature,
} from "@/lib/pay4work";

export const runtime = "nodejs";

type WebhookPayload = {
  event?: string;
  orderId?: string;
  transactionId?: string;
  externalOrderId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  metadata?: Record<string, unknown>;
};

const EVENT_TO_STATUS: Record<string, string> = {
  "payment.success": "paid",
  "payment.failed": "failed",
  "payment.expired": "failed",
  "payment.cancelled": "cancelled",
  "refund.processed": "refunded",
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-p4w-signature");

  if (!verifyPay4WorkSignature(rawBody, signature, PAY4WORK_WEBHOOK_SECRET)) {
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

  const reference = payload.externalOrderId;
  if (!reference) {
    return NextResponse.json({ received: true });
  }

  try {
    await prisma.order.updateMany({
      where: { reference },
      data: { status: nextStatus as OrderStatus },
    });
  } catch (error) {
    console.error("Pay4Work webhook update failed", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}