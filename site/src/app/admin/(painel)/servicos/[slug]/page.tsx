import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm, Checkbox, Field, TextArea } from "@/components/forms/Form";
import { servicePaths } from "@/lib/content";
import { db } from "@/lib/db";
import { saveService } from "../../../_actions/site";
import { ImageInput } from "../../../_ui/client";
import { AdminPage, Panel } from "../../../_ui/ui";

export const metadata = { title: "Editar serviço" };

export default async function EditService({ params }: PageProps<"/admin/servicos/[slug]">) {
  const { slug } = await params;
  const s = await db.service.findUnique({ where: { slug } });
  if (!s) notFound();
  return (
    <AdminPage
      title={s.name}
      back={{ href: "/admin/servicos", label: "Serviços" }}
      actions={
        <Link href={servicePaths[s.slug] ?? "/"} target="_blank" className="btn btn-muted">
          Ver no site
        </Link>
      }
    >
      <Panel>
        <ActionForm action={saveService} encType="multipart/form-data">
          <input type="hidden" name="slug" value={s.slug} />
          <Field label="Nome" name="name" defaultValue={s.name} required />
          <TextArea label="Resumo" name="summary" defaultValue={s.summary} rows={2} hint="Aparece no topo da página e nos cards da home." />
          <TextArea label="Descrição" name="description" defaultValue={s.description ?? ""} rows={6} hint="Separe parágrafos com uma linha em branco." />
          <Field label="Mensagem pronta do WhatsApp" name="whatsappMessage" defaultValue={s.whatsappMessage} />
          <div className="grid gap-5 md:grid-cols-2">
            <TextArea label="Sinais / tópicos (opcional)" name="symptoms" defaultValue={s.symptoms ?? ""} rows={5} hint="Um por linha. Na assistência: sinais de que a máquina precisa de avaliação." />
            <TextArea label="Marcas atendidas (opcional)" name="brandsServed" defaultValue={s.brandsServed ?? ""} rows={5} hint="Uma por linha." />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <ImageInput name="image" label="Foto da página" current={s.imageSrc} />
            <div className="space-y-4">
              <Field label="Texto alternativo da foto" name="imageAlt" defaultValue={s.imageAlt ?? ""} />
              {s.imageSrc && <Checkbox label="Remover a foto atual" name="removeImage" hint="A página passa a usar o layout só com texto." />}
            </div>
          </div>
        </ActionForm>
      </Panel>
    </AdminPage>
  );
}
