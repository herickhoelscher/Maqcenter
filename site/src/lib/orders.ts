import { updateTag } from "next/cache";
import { CONTENT_TAG } from "./content";
import { db } from "./db";
import { getPayment, orderStatusFor } from "./mercadopago";

export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "Aguardando pagamento",
  paid: "Pago",
  fulfilled: "Entregue",
  canceled: "Cancelado",
};

export const DELIVERY_LABEL: Record<string, string> = {
  retirada: "Retirada na loja",
  entrega: "Entrega a combinar",
};

/**
 * Reads a payment from Mercado Pago and applies it to its order. Called by
 * the webhook and when the buyer comes back from the checkout. Idempotent:
 * stock is taken out only once, and a delivered order is never reopened.
 */
export async function syncPayment(paymentId: string, opts: { revalidate?: boolean } = {}) {
  const payment = await getPayment(paymentId);
  if (!payment.external_reference) return null;
  const order = await db.order.findUnique({ where: { id: payment.external_reference }, include: { items: true } });
  if (!order) return null;

  let status = orderStatusFor(payment.status);
  // Never accept less than the order total.
  if (status === "paid" && Math.round(payment.transaction_amount * 100) < order.totalCents) status = "pending";
  const nextStatus = order.status === "fulfilled" ? "fulfilled" : status;
  const takeStock = nextStatus === "paid" && !order.stockApplied;

  await db.$transaction([
    db.order.update({
      where: { id: order.id },
      data: {
        status: nextStatus,
        paymentStatus: payment.status,
        mpPaymentId: String(payment.id),
        paymentMethod: payment.payment_type_id ?? payment.payment_method_id,
        ...(takeStock && { stockApplied: true }),
      },
    }),
    ...(takeStock
      ? order.items
          .filter((i) => i.productId)
          .map((i) => db.product.update({ where: { id: i.productId! }, data: { stock: { decrement: i.qty } } }))
      : []),
  ]);

  // Stock shows on the public site.
  if (takeStock && opts.revalidate !== false) {
    try {
      updateTag(CONTENT_TAG);
    } catch {
      // updateTag only works inside Server Actions; route handlers use revalidateTag.
    }
  }
  return { orderId: order.id, status: nextStatus, takeStock };
}

export async function nextOrderNumber(): Promise<number> {
  const last = await db.order.findFirst({ orderBy: { number: "desc" }, select: { number: true } });
  return (last?.number ?? 1000) + 1;
}
