import { revalidateTag } from "next/cache";
import { CONTENT_TAG } from "@/lib/content";
import { validWebhookSignature } from "@/lib/mercadopago";
import { syncPayment } from "@/lib/orders";

// Mercado Pago notifications. Configure in the Mercado Pago panel:
// https://<domain>/api/mercadopago/webhook, event "Pagamentos".
export async function POST(request: Request) {
  const url = new URL(request.url);
  let body: { type?: string; action?: string; data?: { id?: string | number } } = {};
  try {
    body = await request.json();
  } catch {
    // Some notifications only carry query parameters.
  }

  const type = body.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
  const id = String(body.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? "");
  if (type !== "payment" || !id) return Response.json({ ok: true, ignored: true });

  if (!validWebhookSignature(request.headers, id)) {
    return Response.json({ ok: false, error: "invalid signature" }, { status: 401 });
  }

  try {
    const result = await syncPayment(id, { revalidate: false });
    if (result?.takeStock) revalidateTag(CONTENT_TAG, "max");
    return Response.json({ ok: true });
  } catch (err) {
    console.error("mercadopago webhook:", err);
    // 500 makes Mercado Pago retry later.
    return Response.json({ ok: false }, { status: 500 });
  }
}
