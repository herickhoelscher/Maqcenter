import Image from "next/image";
import { ActionForm, Field } from "@/components/forms/Form";
import { db } from "@/lib/db";
import { addBrand, deleteBrand, moveBrand } from "../../_actions/site";
import { ActionButton, DeleteButton, ImageInput } from "../../_ui/client";
import { AdminPage, Panel } from "../../_ui/ui";

export const metadata = { title: "Marcas" };

export default async function BrandsAdmin() {
  const brands = await db.brand.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <AdminPage title="Marcas" description="Logos mostrados na home, em Sobre e em Venda de máquinas.">
      <div className="grid gap-6 lg:grid-cols-12">
        <Panel title="Marcas no site" className="lg:col-span-7">
          <ul className="divide-y divide-concrete-100">
            {brands.map((b, i) => (
              <li key={b.id} className="flex flex-wrap items-center gap-3 py-3">
                <span className="grid h-12 w-28 place-items-center rounded-[var(--radius-control)] border border-concrete-200 bg-white p-1">
                  <Image src={b.logoSrc} alt={b.name} width={b.logoW} height={b.logoH} className="max-h-10 w-auto object-contain" />
                </span>
                <span className="flex-1 font-semibold text-navy">{b.name}</span>
                <ActionButton action={moveBrand.bind(null, b.id, -1)}>↑</ActionButton>
                <ActionButton action={moveBrand.bind(null, b.id, 1)}>↓</ActionButton>
                <DeleteButton action={deleteBrand.bind(null, b.id)} label="Remover" confirmText={`Remover a marca ${b.name}?`} />
                <span className="sr-only">Posição {i + 1}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Adicionar marca" className="self-start lg:col-span-5">
          <ActionForm action={addBrand} encType="multipart/form-data" submitLabel="Adicionar">
            <Field label="Nome" name="name" required />
            <ImageInput name="logo" label="Logo" hint="PNG com fundo transparente fica melhor." />
          </ActionForm>
        </Panel>
      </div>
    </AdminPage>
  );
}
