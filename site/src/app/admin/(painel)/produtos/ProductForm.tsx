import Image from "next/image";
import { ActionForm, Checkbox, Field, TextArea } from "@/components/forms/Form";
import { centsToInput } from "@/lib/validators";
import { deleteProductImage, saveProduct } from "../../_actions/catalog";
import { DeleteButton, ImageInput } from "../../_ui/client";
import { Panel, Select } from "../../_ui/ui";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  group: string;
  brand: string | null;
  description: string | null;
  priceCents: number | null;
  stock: number;
  active: boolean;
  featured: boolean;
  sortOrder: number;
  images: { id: string; src: string; alt: string }[];
};

export function ProductForm({ product }: { product?: ProductRow }) {
  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <Panel className="lg:col-span-8">
        <ActionForm action={saveProduct} encType="multipart/form-data" submitLabel={product ? "Salvar produto" : "Criar produto"}>
          <input type="hidden" name="id" value={product?.id ?? ""} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nome" name="name" defaultValue={product?.name} required />
            <Field label="Endereço (slug)" name="slug" defaultValue={product?.slug} hint="Deixe vazio para gerar a partir do nome." />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Select
              label="Grupo"
              name="group"
              defaultValue={product?.group ?? "Máquinas"}
              options={[
                { value: "Máquinas", label: "Máquinas" },
                { value: "Acessórios e peças", label: "Acessórios e peças" },
              ]}
            />
            <Field label="Marca" name="brand" defaultValue={product?.brand ?? ""} placeholder="Ex.: Bosch" />
          </div>
          <TextArea label="Descrição" name="description" defaultValue={product?.description ?? ""} rows={5} hint="Separe parágrafos com uma linha em branco." />
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Preço (R$)" name="price" defaultValue={centsToInput(product?.priceCents ?? null)} inputMode="decimal" placeholder="Ex.: 899,90" hint="Vazio = sob consulta (não vende online)." />
            <Field label="Estoque" name="stock" type="number" min={0} defaultValue={product?.stock ?? 0} />
            <Field label="Ordem" name="sortOrder" type="number" defaultValue={product?.sortOrder ?? 0} hint="Menor aparece primeiro." />
          </div>
          <div className="flex flex-wrap gap-6">
            <Checkbox label="Ativo no site" name="active" defaultChecked={product?.active ?? true} />
            <Checkbox label="Destaque" name="featured" defaultChecked={product?.featured ?? false} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <ImageInput name="image" label="Adicionar foto" />
            <Field label="Texto alternativo da foto" name="imageAlt" placeholder="Descreva a foto (acessibilidade)" />
          </div>
        </ActionForm>
      </Panel>
      {product && (
        <Panel title="Fotos" className="self-start lg:col-span-4">
          {product.images.length === 0 ? (
            <p className="text-body text-outline">Sem fotos. O site mostra um ícone no lugar.</p>
          ) : (
            <ul className="space-y-3">
              {product.images.map((img, i) => (
                <li key={img.id} className="flex items-center gap-3">
                  <Image src={img.src} alt={img.alt} width={64} height={64} className="size-16 rounded-[var(--radius-control)] border border-concrete-200 object-cover" />
                  <span className="flex-1 text-body-sm text-slate-text">{i === 0 ? "Foto principal" : `Foto ${i + 1}`}</span>
                  <DeleteButton action={deleteProductImage.bind(null, img.id)} label="Remover" confirmText="Remover esta foto?" />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}
    </div>
  );
}
