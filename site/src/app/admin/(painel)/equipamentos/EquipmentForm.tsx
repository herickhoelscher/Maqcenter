import Image from "next/image";
import { ActionForm, Checkbox, Field, TextArea } from "@/components/forms/Form";
import { centsToInput } from "@/lib/validators";
import { deleteEquipmentImage, moveEquipmentImageFirst, saveEquipment } from "../../_actions/catalog";
import { ActionButton, DeleteButton, ImageInput } from "../../_ui/client";
import { Panel, Select } from "../../_ui/ui";

type EquipmentRow = {
  id: string;
  name: string;
  slug: string;
  category: string;
  brand: string | null;
  availability: string | null;
  priceDailyCents: number | null;
  description: string | null;
  specs: string;
  featured: boolean;
  published: boolean;
  sortOrder: number;
  previousSlugs: string | null;
  images: { id: string; src: string; alt: string; fit: string }[];
};

function specsToText(json: string) {
  try {
    return (JSON.parse(json) as { name: string; value: string }[]).map((s) => `${s.name}: ${s.value}`).join("\n");
  } catch {
    return "";
  }
}

export function EquipmentForm({ item, categories }: { item?: EquipmentRow; categories: string[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <Panel className="lg:col-span-8">
        <ActionForm action={saveEquipment} encType="multipart/form-data" submitLabel={item ? "Salvar equipamento" : "Criar equipamento"}>
          <input type="hidden" name="id" value={item?.id ?? ""} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nome" name="name" defaultValue={item?.name} required />
            <Field
              label="Endereço (slug)"
              name="slug"
              defaultValue={item?.slug}
              hint={item?.previousSlugs ? `Endereços antigos redirecionam para cá: ${item.previousSlugs.split("\n").join(", ")}` : "Deixe vazio para gerar a partir do nome."}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Categoria" name="category" defaultValue={item?.category} list="categorias" required placeholder="Ex.: Concretagem" />
            <datalist id="categorias">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <Field label="Marca" name="brand" defaultValue={item?.brand ?? ""} placeholder="Ex.: Makita" />
            <Field label="Selo de disponibilidade" name="availability" defaultValue={item?.availability ?? ""} placeholder="Ex.: Disponível" hint="Vazio = sem selo." />
          </div>
          <TextArea label="Descrição" name="description" defaultValue={item?.description ?? ""} rows={5} hint="Separe parágrafos com uma linha em branco." />
          <TextArea label="Especificações" name="specs" defaultValue={item ? specsToText(item.specs) : ""} rows={4} hint="Uma por linha, no formato Nome: valor. Ex.: Potência: 1500 W" />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Diária (R$)" name="priceDaily" defaultValue={centsToInput(item?.priceDailyCents ?? null)} inputMode="decimal" placeholder="Ex.: 150,00" hint="Vazio = 'valor sob consulta'." />
            <Field label="Ordem" name="sortOrder" type="number" defaultValue={item?.sortOrder ?? 0} hint="Menor aparece primeiro." />
          </div>
          <div className="flex flex-wrap gap-6">
            <Checkbox label="Publicado no site" name="published" defaultChecked={item?.published ?? true} />
            <Checkbox label="Destaque na home" name="featured" defaultChecked={item?.featured ?? false} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <ImageInput name="images" label="Adicionar fotos" multiple />
            <div className="space-y-5">
              <Field label="Texto alternativo das fotos" name="imageAlt" placeholder="Descreva a foto (acessibilidade)" />
              <Select
                label="Enquadramento"
                name="imageFit"
                defaultValue="cover"
                options={[
                  { value: "cover", label: "Foto de cena (preenche o quadro)" },
                  { value: "contain", label: "Produto recortado (fundo branco)" },
                ]}
              />
            </div>
          </div>
        </ActionForm>
      </Panel>
      {item && (
        <Panel title="Fotos" className="self-start lg:col-span-4">
          {item.images.length === 0 ? (
            <p className="text-body text-outline">Sem fotos. O site mostra &quot;Foto em breve&quot;.</p>
          ) : (
            <ul className="space-y-3">
              {item.images.map((img, i) => (
                <li key={img.id} className="flex items-center gap-3">
                  <Image src={img.src} alt={img.alt} width={64} height={64} className="size-16 rounded-[var(--radius-control)] border border-concrete-200 bg-white object-contain" />
                  <span className="flex-1 text-body-sm text-slate-text">{i === 0 ? "Foto principal" : `Foto ${i + 1}`}</span>
                  {i > 0 && <ActionButton action={moveEquipmentImageFirst.bind(null, img.id)}>Tornar principal</ActionButton>}
                  <DeleteButton action={deleteEquipmentImage.bind(null, img.id)} label="Remover" confirmText="Remover esta foto?" />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}
    </div>
  );
}
