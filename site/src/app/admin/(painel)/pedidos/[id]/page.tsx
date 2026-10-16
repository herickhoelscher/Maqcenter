import { notFound } from "next/navigation";
import { formatCents } from "@/lib/content";
import { db } from "@/lib/db";
import { DELIVERY_LABEL, ORDER_STATUS_LABEL } from "@/lib/orders";
import { formatDocument } from "@/lib/validators";
import { setOrderStatus } from "../../../_actions/ops";
import { ActionButton } from "../../../_ui/client";
import { AdminPage, Panel, Pill } from "../../../_ui/ui";

export const metadata = { title: "Pedido" };

export default async function OrderAdmin({ params }: PageProps<"/admin/pedidos/[id]">) {
  const { id } = await params;
  const order = await db.order.findUnique({ where: { id }, include: { items: true, customer: true } });
  if (!order) notFound();
  const c = order.customer;
  const whats = `https://wa.me/55${c.phone.replace(/\D/g, "").replace(/^55/, "")}`;

  return (
    <AdminPage title={`Pedido #${order.number}`} back={{ href: "/admin/pedidos", label: "Pedidos" }}>
      <div className="grid gap-6 lg:grid-cols-12">
        <Panel title="Itens" className="lg:col-span-7">
          <ul className="divide-y divide-concrete-100">
            {order.items.map((i) => (
              <li key={i.id} className="flex justify-between gap-3 py-3">
                <span>
                  <span className="block font-semibold text-navy">{i.name}</span>
                  <span className="text-body-sm text-outline">
                    {i.qty} × {formatCents(i.unitCents)}
                  </span>
                </span>
                <span className="font-semibold">{formatCents(i.qty * i.unitCents)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex justify-between border-t border-concrete-200 pt-3 text-title text-navy">
            <span>Total</span>
            <span>{formatCents(order.totalCents)}</span>
          </p>
        </Panel>
        <div className="space-y-6 lg:col-span-5">
          <Panel title="Situação">
            <div className="space-y-3 text-body">
              <Pill tone={order.status === "paid" ? "ok" : order.status === "canceled" ? "bad" : order.status === "fulfilled" ? "info" : "warn"}>
                {ORDER_STATUS_LABEL[order.status]}
              </Pill>
              <p className="text-slate-text">
                Mercado Pago: {order.paymentStatus ?? "sem pagamento ainda"}
                {order.paymentMethod && ` (${order.paymentMethod})`}
                {order.mpPaymentId && ` · pagamento ${order.mpPaymentId}`}
              </p>
              <div className="flex flex-wrap gap-2">
                {order.status === "paid" && (
                  <ActionButton action={setOrderStatus.bind(null, order.id, "fulfilled")} className="btn btn-primary min-h-0 px-3 py-2">
                    Marcar como entregue
                  </ActionButton>
                )}
                {order.status === "pending" && (
                  <ActionButton action={setOrderStatus.bind(null, order.id, "paid")}>Marcar como pago (recebido fora do site)</ActionButton>
                )}
                {order.status !== "canceled" && order.status !== "fulfilled" && (
                  <ActionButton action={setOrderStatus.bind(null, order.id, "canceled")} className="btn btn-muted min-h-0 px-3 py-1.5 text-crimson">
                    Cancelar pedido
                  </ActionButton>
                )}
              </div>
              {order.stockApplied && <p className="text-body-sm text-outline">O estoque destes itens já foi baixado.</p>}
            </div>
          </Panel>
          <Panel title="Cliente">
            <dl className="space-y-1 text-body">
              <dt className="sr-only">Nome</dt>
              <dd className="font-semibold text-navy">{c.name}</dd>
              <dt className="sr-only">Documento</dt>
              <dd>{formatDocument(c.document)}</dd>
              <dt className="sr-only">Contato</dt>
              <dd>
                <a href={`mailto:${c.email}`} className="text-blue-accent underline">
                  {c.email}
                </a>
              </dd>
              <dd>
                <a href={whats} target="_blank" rel="noopener" className="text-blue-accent underline">
                  {c.phone} (WhatsApp)
                </a>
              </dd>
            </dl>
          </Panel>
          <Panel title="Entrega">
            <p className="font-semibold">{DELIVERY_LABEL[order.deliveryMethod]}</p>
            {order.deliveryAddress && <p className="text-body text-slate-text">{order.deliveryAddress}</p>}
            {order.notes && <p className="mt-2 text-body-sm text-outline">Observações: {order.notes}</p>}
            <p className="mt-2 text-body-sm text-outline">Feito em {order.createdAt.toLocaleString("pt-BR")}</p>
          </Panel>
        </div>
      </div>
    </AdminPage>
  );
}
