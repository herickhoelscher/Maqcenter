import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { requireCustomer } from "@/lib/auth";
import { formatCents } from "@/lib/content";
import { db } from "@/lib/db";
import { DELIVERY_LABEL, ORDER_STATUS_LABEL } from "@/lib/orders";
import { pageMetadata } from "@/lib/seo";
import { StatusBadge } from "./StatusBadge";

export const metadata = pageMetadata({ title: "Histórico de pedidos", description: "Seus pedidos na MAQCENTER.", path: "/conta/pedidos", noindex: true });

export default function OrdersPage() {
  return (
    <>
      <PageHeader
        title="Histórico de pedidos"
        crumbs={[
          { href: "/conta", label: "Minha conta" },
          { href: "/conta/pedidos", label: "Pedidos" },
        ]}
      />
      <div className="container-site py-10 lg:py-16">
        <Suspense fallback={<div className="card h-64 animate-pulse" aria-hidden />}>
          <Orders />
        </Suspense>
      </div>
    </>
  );
}

async function Orders() {
  const customer = await requireCustomer("/conta/pedidos");
  const orders = await db.order.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  });
  if (orders.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-title text-navy">Nenhum pedido ainda.</p>
        <Link href="/venda-de-maquinas" className="btn btn-primary mt-5">
          Ver produtos
        </Link>
      </div>
    );
  }
  return (
    <ul className="space-y-4">
      {orders.map((o) => (
        <li key={o.id}>
          <Link href={`/conta/pedidos/${o.id}`} className="card flex flex-wrap items-center justify-between gap-4 p-5 transition hover:shadow-level2">
            <span>
              <span className="block text-title text-navy">Pedido #{o.number}</span>
              <span className="text-body-sm text-outline">
                {o.createdAt.toLocaleDateString("pt-BR")} · {o._count.items} {o._count.items === 1 ? "item" : "itens"} · {DELIVERY_LABEL[o.deliveryMethod]}
              </span>
            </span>
            <span className="flex items-center gap-4">
              <StatusBadge status={o.status} label={ORDER_STATUS_LABEL[o.status] ?? o.status} />
              <span className="text-title font-extrabold text-navy">{formatCents(o.totalCents)}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
