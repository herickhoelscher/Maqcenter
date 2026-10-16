import Link from "next/link";
import { ActionForm, Checkbox, Field, TextArea } from "@/components/forms/Form";
import { db } from "@/lib/db";
import { deleteTestimonial, saveTestimonial } from "../../_actions/site";
import { DeleteButton } from "../../_ui/client";
import { AdminPage, Panel, Pill } from "../../_ui/ui";

export const metadata = { title: "Depoimentos" };

export default async function TestimonialsAdmin({ searchParams }: PageProps<"/admin/depoimentos">) {
  const editId = (await searchParams).editar as string | undefined;
  const [items, editing] = await Promise.all([
    db.testimonial.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }),
    editId ? db.testimonial.findUnique({ where: { id: editId } }) : null,
  ]);
  return (
    <AdminPage title="Depoimentos" description="Aparecem na home quando houver pelo menos um publicado. Use só depoimentos reais, com autorização do cliente.">
      <div className="grid gap-6 lg:grid-cols-12">
        <Panel title="Depoimentos" className="lg:col-span-7">
          {items.length === 0 ? (
            <p className="text-body text-outline">Nenhum depoimento ainda.</p>
          ) : (
            <ul className="divide-y divide-concrete-100">
              {items.map((t) => (
                <li key={t.id} className="space-y-2 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-navy">
                      {t.author}
                      {t.source && <span className="font-normal text-outline"> · {t.source}</span>}
                    </span>
                    {t.published ? <Pill tone="ok">Publicado</Pill> : <Pill>Rascunho</Pill>}
                  </div>
                  <p className="text-body text-slate-text">{t.text}</p>
                  <div className="flex gap-2">
                    <Link href={`/admin/depoimentos?editar=${t.id}`} className="btn btn-muted min-h-0 px-3 py-1.5">
                      Editar
                    </Link>
                    <DeleteButton action={deleteTestimonial.bind(null, t.id)} confirmText="Excluir este depoimento?" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title={editing ? "Editar depoimento" : "Novo depoimento"} className="self-start lg:col-span-5">
          <ActionForm key={editing?.id ?? "novo"} action={saveTestimonial} submitLabel={editing ? "Salvar" : "Adicionar"}>
            <input type="hidden" name="id" value={editing?.id ?? ""} />
            <Field label="Nome do cliente" name="author" defaultValue={editing?.author} required />
            <Field label="Empresa ou cidade (opcional)" name="source" defaultValue={editing?.source ?? ""} />
            <TextArea label="Depoimento" name="text" defaultValue={editing?.text} rows={5} required />
            <Checkbox label="Publicar no site" name="published" defaultChecked={editing?.published ?? true} />
          </ActionForm>
          {editing && (
            <Link href="/admin/depoimentos" className="mt-3 inline-block text-body-sm text-blue-accent underline">
              Cancelar edição
            </Link>
          )}
        </Panel>
      </div>
    </AdminPage>
  );
}
