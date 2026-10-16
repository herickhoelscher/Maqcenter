import Link from "next/link";
import { formatCents } from "@/lib/content";
import { db } from "@/lib/db";
import { paymentsConfigured } from "@/lib/mercadopago";
import { ORDER_STATUS_LABEL } from "@/lib/orders";
import { AdminPage, Panel, Pill } from "../_ui/ui";

export default async function AdminHome() {
  const [newMessages, pendingOrders, paidOrders, products, sellable, equipment, messages, orders] = await Promise.all([
    db.contactMessage.count({ where: { status: "new" } }),
    db.order.count({ where: { status: "pending" } }),
    db.order.count({ where: { status: "paid" } }),
    db.product.count(),
    db.product.count({ where: { active: true, priceCents: { not: null } } }),
    db.equipment.count(),
    db.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { customer: { select: { name: true } } } }),
  ]);

  const setup = [
    { ok: paymentsConfigured(), text: "Mercado Pago (MERCADOPAGO_ACCESS_TOKEN): sem ele a loja não recebe pagamentos." },
    { ok: Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_FROM_EMAIL), text: "Resend (RESEND_API_KEY e CONTACT_FROM_EMAIL): sem ele as mensagens do site só aparecem aqui, sem e-mail." },
    { ok: Boolean(process.env.BLOB_READ_WRITE_TOKEN) || process.env.NODE_ENV !== "production", text: "Vercel Blob (BLOB_READ_WRITE_TOKEN): necessário em produção para enviar imagens." },
  ].filter((s) => !s.ok);

  const stats = [
    { label: "Pedidos pagos para separar", value: paidOrders, href: "/admin/pedidos?status=paid", tone: paidOrders ? "text-success-strong" : "text-navy" },
    { label: "Aguardando pagamento", value: pendingOrders, href: "/admin/pedidos?status=pending", tone: "text-navy" },
    { label: "Mensagens novas", value: newMessages, href: "/admin/mensagens", tone: newMessages ? "text-crimson" : "text-navy" },
    { label: `Produtos (${sellable} à venda online)`, value: products, href: "/admin/produtos", tone: "text-navy" },
    { label: "Equipamentos de locação", value: equipment, href: "/admin/equipamentos", tone: "text-navy" },
  ];

  return (
    <AdminPage title="Início" description="Resumo do site e da loja.">
      {setup.length > 0 && (
        <div className="card border-amber/60 bg-amber/10 p-5">
          <h2 className="text-title text-navy">Configuração pendente</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-body text-slate-text">
            {setup.map((s) => (
              <li key={s.text}>{s.text}</li>
            ))}
          </ul>
        </div>
      )}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <li key={s.label}>
            <Link href={s.href} className="card block h-full p-5 transition hover:shadow-level2">
              <span className={`block text-headline-m font-extrabold ${s.tone}`}>{s.value}</span>
              <span className="text-body-sm text-slate-text">{s.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Últimos pedidos">
          {orders.length === 0 ? (
            <p className="text-body text-outline">Nenhum pedido ainda.</p>
          ) : (
            <ul className="divide-y divide-concrete-100">
              {orders.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/pedidos/${o.id}`} className="flex items-center justify-between gap-3 py-3 hover:text-blue-accent">
                    <span>
                      <span className="block font-semibold text-navy">
                        #{o.number} · {o.customer.name}
                      </span>
                      <span className="text-body-sm text-outline">{o.createdAt.toLocaleString("pt-BR")}</span>
                    </span>
                    <span className="flex items-center gap-3">
                      <Pill tone={o.status === "paid" ? "ok" : o.status === "canceled" ? "bad" : o.status === "fulfilled" ? "info" : "warn"}>{ORDER_STATUS_LABEL[o.status]}</Pill>
                      <span className="font-semibold">{formatCents(o.totalCents)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Últimas mensagens">
          {messages.length === 0 ? (
            <p className="text-body text-outline">Nenhuma mensagem ainda.</p>
          ) : (
            <ul className="divide-y divide-concrete-100">
              {messages.map((m) => (
                <li key={m.id} className="py-3">
                  <Link href="/admin/mensagens" className="block hover:text-blue-accent">
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-navy">{m.name}</span>
                      {m.status === "new" && <Pill tone="bad">Nova</Pill>}
                    </span>
                    <span className="line-clamp-1 text-body-sm text-slate-text">
                      {m.service}: {m.message}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </AdminPage>
  );
}
