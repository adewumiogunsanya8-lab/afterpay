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

/** Customer details sent to Flutterwave Checkout. */
export type FlutterwaveCustomer = {
  name: string;
  email: string;
  phone?: string;
};

/** Checkout page branding displayed to the customer. */
export type FlutterwaveCustomizations = {
  title: string;
  description?: string;
  logo?: string;
};

/** Checkout session behaviour. */
export type FlutterwaveConfiguration = {
  /** Session duration in minutes. */
  sessionDuration?: number;
  /** Maximum number of payment retry attempts. */
  maxRetryAttempt?: number;
};

/** Arguments for creating a Flutterwave Checkout payment. */
export type CreateFlutterwavePaymentParams = {
  amount: number;
  currency: string;
  txRef: string;
  customer: FlutterwaveCustomer;
  redirectUrl: string;
  customizations?: FlutterwaveCustomizations;
  configuration?: FlutterwaveConfiguration;
  paymentPlan?: string | number;
  paymentOptions?: string;
  linkExpiration?: string; // ISO 8601, e.g. "2026-12-14T12:20:00"
  meta?: Record<string, unknown>;
};

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

export async function createFlutterwavePayment(
  params: CreateFlutterwavePaymentParams,
): Promise<FlutterwavePaymentData> {
  const {
    amount,
    currency,
    txRef,
    customer,
    redirectUrl,
    customizations,
    configuration,
    paymentPlan,
    paymentOptions,
    linkExpiration,
    meta,
  } = params;

  const body = {
    amount,
    tx_ref: txRef,
    currency,
    redirect_url: redirectUrl,
    customer: {
      email: customer.email,
      phone_number: customer.phone,
      name: customer.name,
    },
    customizations: {
      title: customizations?.title ?? "Easyvend Payment",
      description:
        customizations?.description ?? "Complete your order payment",
      ...(customizations?.logo !== undefined && {
        logo: customizations.logo,
      }),
    },
    ...(configuration !== undefined && {
      configuration: {
        session_duration: configuration.sessionDuration,
        max_retry_attempt: configuration.maxRetryAttempt,
      },
    }),
    ...(paymentPlan !== undefined && { payment_plan: paymentPlan }),
    payment_options:
      paymentOptions ?? "card, banktransfer, ussd",
    ...(linkExpiration !== undefined && { link_expiration: linkExpiration }),
    meta,
  };

  console.log("Flutterwave checkout request", body);

  const response = await fetch(`${FLUTTERWAVE_API_URL}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = (await response.json().catch(() => ({}))) as {
    status?: string;
    message?: string;
    data?: FlutterwavePaymentData;
    error?: string;
  };

  if (!response.ok || json.status !== "success" || !json.data) {
    console.error(
      "Flutterwave API error",
      {
        status: response.status,
        body: json,
        request: body,
      },
    );
    const flutterwaveMessage =
      json.message || json.error || JSON.stringify(json) || `Flutterwave request failed (${response.status})`;
    throw new Error(flutterwaveMessage);
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