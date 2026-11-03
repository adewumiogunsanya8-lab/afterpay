import "server-only";

import crypto from "crypto";

/**
 * Flutterwave payment gateway client.
 *
 * Server-side only: uses the secret key. Never import from client components.
 *
 * Docs: https://developer.flutterwave.com/reference/checkout
 */

export const FLUTTERWAVE_API_URL = (
  process.env.FLUTTERWAVE_API_URL ?? "https://api.flutterwave.com/v3"
).replace(/\/+$/, "");

export const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY ?? "";
export const FLUTTERWAVE_PUBLIC_KEY = process.env.FLUTTERWAVE_PUBLIC_KEY ?? "";
export const FLUTTERWAVE_WEBHOOK_SECRET =
  process.env.FLUTTERWAVE_WEBHOOK_SECRET ?? "";

export type FlutterwavePaymentData = {
  link: string;
};

export type FlutterwaveTransaction = {
  id: number | string;
  tx_ref: string;
  flw_ref?: string;
  status: string;
  amount: number;
  currency: string;
};

export async function createFlutterwavePayment(params: {
  amount: number;
  currency: string;
  txRef: string;
  customer: { name: string; email: string; phone?: string };
  redirectUrl: string;
  meta?: Record<string, unknown>;
}): Promise<FlutterwavePaymentData> {
  const response = await fetch(`${FLUTTERWAVE_API_URL}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: params.amount,
      tx_ref: params.txRef,
      currency: params.currency,
      redirect_url: params.redirectUrl,
      customer: {
        email: params.customer.email,
        name: params.customer.name,
        phone_number: params.customer.phone,
      },
      customizations: {
        title: "Easyvend Payment",
        description: "Complete your order payment",
      },
      meta: params.meta,
      payment_options: "card, banktransfer, ussd, mobilemoney",
    }),
  });

  const json = (await response.json().catch(() => ({}))) as {
    status?: string;
    message?: string;
    data?: FlutterwavePaymentData;
    error?: string;
  };

  if (!response.ok || json.status !== "success" || !json.data) {
    throw new Error(
      json.message || json.error || `Flutterwave request failed (${response.status})`,
    );
  }

  return json.data;
}

/**
 * Verify a Flutterwave webhook signature.
 *
 * Flutterwave sends the HMAC-SHA256 hex digest of the raw request body in the
 * `x-hash` header, computed with the secret hash configured in the dashboard.
 * We compare in constant time.
 */
export function verifyFlutterwaveSignature(
  rawBody: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature || !secret) return false;
  let expected: string;
  try {
    expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  } catch {
    return false;
  }
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expected, "hex"),
    );
  } catch {
    return false;
  }
}

/**
 * Verify a Flutterwave transaction by re-querying the API.
 * Used by the webhook handler to confirm the transaction before fulfilling.
 */
export async function verifyFlutterwaveTransaction(
  transactionId: string | number,
): Promise<{ status: string; data?: FlutterwaveTransaction }> {
  const response = await fetch(
    `${FLUTTERWAVE_API_URL}/transactions/${transactionId}/verify`,
    {
      headers: {
        Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
      },
    },
  );
  return (await response.json().catch(() => ({}))) as {
    status: string;
    data?: FlutterwaveTransaction;
  };
}