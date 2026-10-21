"use server";

import { placeOrder, type PlaceOrderInput, type PlaceOrderResult } from "@/lib/orders";

/**
 * Server Action used by the checkout flow.
 *
 * Keeping the write on the server means the order is built from database
 * prices rather than from whatever the browser happened to send. It also keeps
 * the Prisma client out of the client bundle.
 */
export async function submitOrder(
  input: PlaceOrderInput
): Promise<PlaceOrderResult> {
  return placeOrder(input);
}
