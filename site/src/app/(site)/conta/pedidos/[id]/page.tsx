import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { WhatsAppButton } from "@/components/Buttons";
import { PageHeader } from "@/components/PageHeader";
import { requireCustomer } from "@/lib/auth";
import { formatCents, formatAddress, getCompany } from "@/lib/content";
import { db } from "@/lib/db";
import { DELIVERY_LABEL, ORDER_STATUS_LABEL } from "@/lib/orders";
import { pageMetadata } from "@/lib/seo";
import { StatusBadge } from "../StatusBadge";
import { PaymentSync, PayNowButton } from "./PaymentClient";

export const metadata = pageMetadata({ title: "Pedido", description: "Detalhes do pedido.", path: "/conta/pedidos", noindex: true });

export default function OrderPage({ params }: PageProps<"/conta/pedidos/[id]">) {
  return (
    <>
      <PageHeader
        title="Detalhes do pedido"
        crumbs={[
          { href: "/conta", label: "Minha conta" },
          { href: "/conta/pedidos", label: "Pedidos" },
        ]}
      />
      <div className="container-site py-10 lg:py-16">
        <Suspense fallback={<div className="card h-96 animate-pulse" aria-hidden />}>
          <Order params={params} />
        </Suspense>
      </div>
    </>
  );
}

async function Order({ params }: { params: PageProps<"/conta/pedidos/[id]">["params"] }) {
  const { id } = await params;
  const customer = await requireCustomer(`/conta/pedidos/${id}`);
  const [order, company] = await Promise.all([
    db.order.findFirst({ where: { id, customerId: customer.id }, include: { items: true } }),
    getCompany(),
  ]);
  if (!order) notFound();

  const statusText: Record<string, string> = {
    pending: "Assim que o Mercado Pago confirmar o pagamento, o status muda aqui. PIX costuma ser na hora; boleto, até 3 dias úteis.",
    paid: order.deliveryMethod === "retirada" ? "Pagamento confirmado. A equipe separa o pedido e avisa quando estiver pronto para retirada." : "Pagamento confirmado. A equipe entra em contato para combinar a entrega.",
    fulfilled: "Pedido entregue.",
    canceled: "Pedido cancelado. Se o pagamento foi recusado, você pode fazer um novo pedido.",
  };

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <Suspense>
        <PaymentSync orderId={order.id} pending={order.status === "pending"} />
      </Suspense>
      <section aria-labelledby="itens" className="card overflow-hidden lg:col-span-7">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-concrete-200 bg-concrete-50 px-5 py-4">
          <h2 id="itens" className="text-title text-navy">
            Pedido #{order.number}
          </h2>
          <StatusBadge status={order.status} label={ORDER_STATUS_LABEL[order.status] ?? order.status} />
        </div>
        <ul className="divide-y divide-concrete-100">
          {order.items.map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-4 px-5 py-4">
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
        <div className="flex items-center justify-between border-t border-concrete-200 px-5 py-4">
          <span className="text-body font-semibold text-slate-text">Total</span>
          <span className="text-headline-sm font-extrabold text-navy">{formatCents(order.totalCents)}</span>
        </div>
      </section>
      <aside className="space-y-6 lg:col-span-5">
        <div className="card space-y-3 p-5">
          <h2 className="text-title text-navy">Situação</h2>
          <p className="text-body text-slate-text">{statusText[order.status]}</p>
          {order.status === "pending" && <PayNowButton orderId={order.id} />}
        </div>
        <div className="card space-y-2 p-5 text-body">
          <h2 className="text-title text-navy">Entrega</h2>
          <p className="font-semibold">{DELIVERY_LABEL[order.deliveryMethod]}</p>
          {order.deliveryMethod === "retirada" ? (
            <p className="text-slate-text">{formatAddress(company)}</p>
          ) : (
            <p className="text-slate-text">{order.deliveryAddress}</p>
          )}
          {order.notes && <p className="text-body-sm text-outline">Observações: {order.notes}</p>}
          <p className="text-body-sm text-outline">Feito em {order.createdAt.toLocaleString("pt-BR")}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <WhatsAppButton tone="whatsapp" message={`Olá! Sobre o pedido #${order.number}.`}>
            Falar sobre o pedido
          </WhatsAppButton>
          <Link href="/conta/pedidos" className="btn btn-muted">
            Todos os pedidos
          </Link>
        </div>
      </aside>
    </div>
  );
}
