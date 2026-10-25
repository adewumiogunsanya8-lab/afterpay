import "server-only";

import crypto from "crypto";

/**
 * Pay4Work payment gateway client.
 *
 * Server-side only: uses the secret key. Never import from client components.
 */

export const PAY4WORK_API_URL = (
  process.env.PAY4WORK_API_URL ?? "https://api.pay4.work/api/v1"
).replace(/\/+$/, "");

export const PAY4WORK_PUBLIC_KEY = process.env.PAY4WORK_PUBLIC_KEY ?? "";
export const PAY4WORK_SECRET_KEY = process.env.PAY4WORK_SECRET_KEY ?? "";
export const PAY4WORK_WEBHOOK_SECRET =
  process.env.PAY4WORK_WEBHOOK_SECRET ?? process.env.PAY4WORK_SECRET_KEY ?? "";

export type Pay4WorkOrderData = {
  order: {
    orderId: string;
    transactionId: string;
    amount: number;
    currency: string;
    status: string;
    expiresAt: string;
  };
  duplicate: boolean;
  paymentPageUrl: string;
  accessToken: string;
  availablePaymentMethods: string[];
};

export async function createPay4WorkOrder(params: {
  amount: number;
  currency: string;
  externalOrderId: string;
  customer: { name: string; email: string; phone?: string };
  successUrl: string;
  failureUrl: string;
  metadata?: Record<string, unknown>;
}): Promise<Pay4WorkOrderData> {
  const response = await fetch(`${PAY4WORK_API_URL}/orders`, {
    method: "POST",
    headers: {
      "X-API-Key": PAY4WORK_PUBLIC_KEY,
      "X-API-Secret": PAY4WORK_SECRET_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency,
      externalOrderId: params.externalOrderId,
      customer: params.customer,
      successUrl: params.successUrl,
      failureUrl: params.failureUrl,
      metadata: params.metadata,
    }),
  });

  const json = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    data?: Pay4WorkOrderData;
    error?: string;
    message?: string;
  };

  if (!response.ok || !json.success || !json.data) {
    throw new Error(
      json.message || json.error || `Pay4Work request failed (${response.status})`,
    );
  }

  return json.data;
}

/**
 * Verify a Pay4Work webhook signature.
 *
 * Pay4Work sends the HMAC-SHA256 hex digest of the raw request body in the
 * `X-P4W-Signature` header. We compare in constant time.
 */
export function verifyPay4WorkSignature(
  rawBody: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature) return false;
  const provided = signature.startsWith("sha256=")
    ? signature.slice("sha256=".length)
    : signature;
  let expected: string;
  try {
    expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  } catch {
    return false;
  }
  try {
    return crypto.timingSafeEqual(
      Buffer.from(provided, "hex"),
      Buffer.from(expected, "hex"),
    );
  } catch {
    return false;
  }
}