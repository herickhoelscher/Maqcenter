import Link from "next/link";
import { formatCents } from "@/lib/content";
import { db } from "@/lib/db";
import { DELIVERY_LABEL, ORDER_STATUS_LABEL } from "@/lib/orders";
import { AdminPage, Pill, Table } from "../../_ui/ui";

export const metadata = { title: "Pedidos" };

const tone = (s: string) => (s === "paid" ? "ok" : s === "canceled" ? "bad" : s === "fulfilled" ? "info" : "warn") as "ok" | "bad" | "info" | "warn";

export default async function OrdersAdmin({ searchParams }: PageProps<"/admin/pedidos">) {
  const status = (await searchParams).status as string | undefined;
  const filter = status && ORDER_STATUS_LABEL[status] ? status : undefined;
  const orders = await db.order.findMany({
    where: filter ? { status: filter } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { customer: { select: { name: true, phone: true } }, _count: { select: { items: true } } },
  });
  const tabs = [{ value: undefined, label: "Todos" }, ...Object.entries(ORDER_STATUS_LABEL).map(([value, label]) => ({ value, label }))];

  return (
    <AdminPage title="Pedidos" description="Compras feitas pelo site. Pedidos pagos aguardam separação: marque como entregue quando o cliente receber.">
      <nav aria-label="Filtrar pedidos" className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t.label}
            href={t.value ? `/admin/pedidos?status=${t.value}` : "/admin/pedidos"}
            aria-current={filter === t.value ? "page" : undefined}
            className={`btn min-h-0 px-3 py-1.5 ${filter === t.value ? "bg-navy text-white" : "btn-muted"}`}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      <Table head={["Pedido", "Cliente", "Entrega", "Situação", "Total", "Data"]} empty={orders.length === 0 ? "Nenhum pedido." : undefined}>
        {orders.map((o) => (
          <tr key={o.id} className="hover:bg-concrete-50">
            <td className="px-4 py-3">
              <Link href={`/admin/pedidos/${o.id}`} className="font-semibold text-blue-accent hover:underline">
                #{o.number}
              </Link>
              <span className="block text-body-sm text-outline">{o._count.items} itens</span>
            </td>
            <td className="px-4 py-3">
              {o.customer.name}
              <span className="block text-body-sm text-outline">{o.customer.phone}</span>
            </td>
            <td className="px-4 py-3">{DELIVERY_LABEL[o.deliveryMethod]}</td>
            <td className="px-4 py-3">
              <Pill tone={tone(o.status)}>{ORDER_STATUS_LABEL[o.status]}</Pill>
            </td>
            <td className="px-4 py-3 font-semibold">{formatCents(o.totalCents)}</td>
            <td className="px-4 py-3 text-body-sm">{o.createdAt.toLocaleString("pt-BR")}</td>
          </tr>
        ))}
      </Table>
    </AdminPage>
  );
}
