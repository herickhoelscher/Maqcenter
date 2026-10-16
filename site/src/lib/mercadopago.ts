import { createHmac, timingSafeEqual } from "node:crypto";

// Mercado Pago Checkout Pro through the REST API (no SDK).
// Docs: https://www.mercadopago.com.br/developers/pt/docs/checkout-pro

const API = "https://api.mercadopago.com";

export class PaymentNotConfiguredError extends Error {}

function token() {
  const value = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!value) throw new PaymentNotConfiguredError("MERCADOPAGO_ACCESS_TOKEN is missing");
  return value;
}

export function paymentsConfigured(): boolean {
  return Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);
}

export type PreferenceInput = {
  orderId: string;
  orderNumber: number;
  items: { id: string; title: string; quantity: number; unitCents: number }[];
  payer: { name: string; email: string };
  baseUrl: string;
};

/** Creates a Checkout Pro preference and returns the URL to send the buyer to. */
export async function createPreference(input: PreferenceInput): Promise<{ id: string; url: string }> {
  const back = `${input.baseUrl}/conta/pedidos/${input.orderId}`;
  const isPublic = input.baseUrl.startsWith("https://");
  const res = await fetch(`${API}/checkout/preferences`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": `order-${input.orderId}`,
    },
    body: JSON.stringify({
      items: input.items.map((i) => ({
        id: i.id,
        title: i.title,
        quantity: i.quantity,
        unit_price: i.unitCents / 100,
        currency_id: "BRL",
      })),
      payer: { name: input.payer.name, email: input.payer.email },
      external_reference: input.orderId,
      statement_descriptor: "MAQCENTER",
      back_urls: { success: back, pending: back, failure: back },
      // Mercado Pago only accepts these for public HTTPS addresses.
      ...(isPublic && { auto_return: "approved", notification_url: `${input.baseUrl}/api/mercadopago/webhook` }),
      metadata: { order_number: input.orderNumber },
    }),
  });
  if (!res.ok) throw new Error(`Mercado Pago preference ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { id: string; init_point: string; sandbox_init_point?: string };
  const sandbox = token().startsWith("TEST-");
  return { id: data.id, url: sandbox && data.sandbox_init_point ? data.sandbox_init_point : data.init_point };
}

export type MpPayment = {
  id: number;
  status: string;
  status_detail: string;
  external_reference: string | null;
  payment_method_id: string | null;
  payment_type_id: string | null;
  transaction_amount: number;
};

export async function getPayment(id: string): Promise<MpPayment> {
  const res = await fetch(`${API}/v1/payments/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${token()}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Mercado Pago payment ${res.status}: ${await res.text()}`);
  return (await res.json()) as MpPayment;
}

/**
 * Validates the x-signature header of a webhook call.
 * Without MERCADOPAGO_WEBHOOK_SECRET nothing is checked, but the payment is
 * always read back from the API, so a forged call cannot mark an order paid.
 */
export function validWebhookSignature(headers: Headers, dataId: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return true;
  const signature = headers.get("x-signature") ?? "";
  const requestId = headers.get("x-request-id") ?? "";
  const parts = Object.fromEntries(signature.split(",").map((p) => p.trim().split("=") as [string, string]));
  if (!parts.ts || !parts.v1) return false;
  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${parts.ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(parts.v1);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Maps a Mercado Pago payment status to our order status. */
export function orderStatusFor(paymentStatus: string): "paid" | "pending" | "canceled" {
  if (paymentStatus === "approved") return "paid";
  if (["rejected", "cancelled", "refunded", "charged_back"].includes(paymentStatus)) return "canceled";
  return "pending";
}
