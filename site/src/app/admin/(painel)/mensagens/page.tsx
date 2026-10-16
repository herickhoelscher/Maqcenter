import Link from "next/link";
import { db } from "@/lib/db";
import { deleteMessage, setMessageStatus } from "../../_actions/ops";
import { ActionButton, DeleteButton } from "../../_ui/client";
import { AdminPage, Pill } from "../../_ui/ui";

export const metadata = { title: "Mensagens" };

const FILTERS = [
  { value: "new", label: "Novas" },
  { value: "read", label: "Lidas" },
  { value: "archived", label: "Arquivadas" },
] as const;

export default async function MessagesAdmin({ searchParams }: PageProps<"/admin/mensagens">) {
  const raw = (await searchParams).status as string | undefined;
  const status = FILTERS.some((f) => f.value === raw) ? raw! : undefined;
  const messages = await db.contactMessage.findMany({
    where: status ? { status } : { status: { not: "archived" } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <AdminPage title="Mensagens" description="Pedidos de orçamento e contatos enviados pelo formulário e pela lista de orçamento do site.">
      <nav aria-label="Filtrar mensagens" className="flex flex-wrap gap-2">
        <Link href="/admin/mensagens" className={`btn min-h-0 px-3 py-1.5 ${!status ? "bg-navy text-white" : "btn-muted"}`}>
          Abertas
        </Link>
        {FILTERS.map((f) => (
          <Link key={f.value} href={`/admin/mensagens?status=${f.value}`} className={`btn min-h-0 px-3 py-1.5 ${status === f.value ? "bg-navy text-white" : "btn-muted"}`}>
            {f.label}
          </Link>
        ))}
      </nav>
      {messages.length === 0 ? (
        <div className="card p-8 text-center text-body text-outline">Nenhuma mensagem aqui.</div>
      ) : (
        <ul className="space-y-4">
          {messages.map((m) => {
            const phone = m.phone.replace(/\D/g, "");
            return (
              <li key={m.id} className={`card space-y-3 p-5 ${m.status === "new" ? "border-l-4 border-l-amber" : ""}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-navy">
                      {m.name} <span className="font-normal text-outline">· {m.service}</span>
                    </p>
                    <p className="text-body-sm text-outline">
                      {m.createdAt.toLocaleString("pt-BR")} · {m.emailSent ? "e-mail enviado" : "sem e-mail"}
                    </p>
                  </div>
                  {m.status === "new" ? <Pill tone="bad">Nova</Pill> : m.status === "archived" ? <Pill>Arquivada</Pill> : <Pill tone="info">Lida</Pill>}
                </div>
                <p className="whitespace-pre-line text-body text-charcoal">{m.message}</p>
                <div className="flex flex-wrap items-center gap-2 text-body-sm">
                  <a href={`https://wa.me/${phone.startsWith("55") ? phone : `55${phone}`}`} target="_blank" rel="noopener" className="btn btn-whatsapp min-h-0 px-3 py-1.5">
                    WhatsApp {m.phone}
                  </a>
                  {m.email && (
                    <a href={`mailto:${m.email}`} className="btn btn-muted min-h-0 px-3 py-1.5">
                      {m.email}
                    </a>
                  )}
                  {m.status !== "read" && <ActionButton action={setMessageStatus.bind(null, m.id, "read")}>Marcar como lida</ActionButton>}
                  {m.status !== "archived" && <ActionButton action={setMessageStatus.bind(null, m.id, "archived")}>Arquivar</ActionButton>}
                  <DeleteButton action={deleteMessage.bind(null, m.id)} confirmText="Excluir esta mensagem?" />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AdminPage>
  );
}
