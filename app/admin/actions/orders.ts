"use server";

import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/index";
import type { OrderStatus } from "@/lib/generated/prisma/enums";

/** Server Action: list orders for the admin dashboard. */
export async function adminListOrders() {
  await requireAdmin();
  return prisma.order.findMany({
    include: { items: true },
    orderBy: { placedAt: "desc" },
  });
}

/** Server Action: get a single order with its items. */
export async function adminGetOrder(id: string) {
  await requireAdmin();
  return prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
}

/** Server Action: update an order's status. */
export async function adminUpdateOrderStatus(
  id: string,
  status: string,
) {
  await requireAdmin();
  const allowedStatuses: OrderStatus[] = ["pending", "paid", "failed", "cancelled", "refunded"];
  if (!allowedStatuses.includes(status as OrderStatus)) {
    throw new Error("Choose a valid order status.");
  }
  return prisma.order.update({
    where: { id },
    data: { status: status as OrderStatus },
  });
}
