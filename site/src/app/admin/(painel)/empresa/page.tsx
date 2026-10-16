import { ActionForm, Field, TextArea } from "@/components/forms/Form";
import type { Hours } from "@/lib/content";
import { db } from "@/lib/db";
import { saveCompany } from "../../_actions/site";
import { ImageInput } from "../../_ui/client";
import { AdminPage, Panel } from "../../_ui/ui";

export const metadata = { title: "Dados da empresa" };

const DAYS = [
  ["Mo", "Seg"],
  ["Tu", "Ter"],
  ["We", "Qua"],
  ["Th", "Qui"],
  ["Fr", "Sex"],
  ["Sa", "Sáb"],
  ["Su", "Dom"],
] as const;

export default async function CompanyAdmin() {
  const c = await db.company.findUniqueOrThrow({ where: { id: 1 } });
  let hours: Hours[] = [];
  try {
    hours = JSON.parse(c.hours);
  } catch {}

  return (
    <AdminPage title="Dados da empresa" description="Telefones, endereço, horários e textos usados em todo o site.">
      <ActionForm action={saveCompany} encType="multipart/form-data" className="space-y-6">
        <Panel title="Identidade">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Nome" name="name" defaultValue={c.name} />
            <Field label="Frase do logo" name="tagline" defaultValue={c.tagline} />
            <Field label="Slogan" name="slogan" defaultValue={c.slogan ?? ""} />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Razão social" name="legalName" defaultValue={c.legalName ?? ""} />
              <Field label="CNPJ" name="cnpj" defaultValue={c.cnpj ?? ""} />
            </div>
          </div>
        </Panel>
        <Panel title="Contato">
          <div className="grid gap-5 md:grid-cols-3">
            <Field label="Celular (exibido)" name="phoneDisplay" defaultValue={c.phoneDisplay} placeholder="(45) 99805-2928" />
            <Field label="WhatsApp (só números, com 55)" name="whatsapp" defaultValue={c.whatsapp} inputMode="numeric" />
            <Field label="Telefone fixo" name="landlineDisplay" defaultValue={c.landlineDisplay ?? ""} placeholder="(45) 3223-0801" />
            <Field label="E-mail de pedidos" name="email" type="email" defaultValue={c.email} hint="Recebe as mensagens do formulário." />
            <Field label="E-mail do site" name="emailSite" type="email" defaultValue={c.emailSite ?? ""} />
          </div>
        </Panel>
        <Panel title="Endereço">
          <div className="grid gap-5 md:grid-cols-6">
            <Field label="Rua e número" name="street" defaultValue={c.street} className="md:col-span-3" />
            <Field label="Bairro" name="district" defaultValue={c.district} className="md:col-span-3" />
            <Field label="Cidade" name="city" defaultValue={c.city} className="md:col-span-3" />
            <Field label="UF" name="state" defaultValue={c.state} maxLength={2} className="md:col-span-1" />
            <Field label="CEP" name="postalCode" defaultValue={c.postalCode ?? ""} className="md:col-span-2" />
          </div>
        </Panel>
        <Panel title="Horário de atendimento">
          <div className="space-y-6">
            {[1, 2].map((row) => {
              const h = hours[row - 1];
              return (
                <fieldset key={row} className="grid gap-4 md:grid-cols-[1fr_1fr]">
                  <legend className="sr-only">Horário {row}</legend>
                  <Field label={`Dias (texto) ${row === 2 ? "(opcional)" : ""}`} name={`hoursDays${row}`} defaultValue={h?.days ?? ""} placeholder="Segunda a sexta" />
                  <Field label="Faixas de horário" name={`hoursRanges${row}`} defaultValue={h?.ranges.map((r) => r.join("-")).join(", ") ?? ""} placeholder="07:30-12:00, 13:30-18:00" />
                  <div className="flex flex-wrap gap-4 md:col-span-2">
                    {DAYS.map(([code, label]) => (
                      <label key={code} className="flex items-center gap-2 text-body">
                        <input type="checkbox" name={`hoursCode${row}-${code}`} defaultChecked={h?.dayCodes.includes(code)} className="size-4 accent-blue-accent" />
                        {label}
                      </label>
                    ))}
                  </div>
                </fieldset>
              );
            })}
          </div>
        </Panel>
        <Panel title="Redes sociais">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Instagram (@)" name="instagramHandle" defaultValue={c.instagramHandle ?? ""} />
            <Field label="Link do Instagram" name="instagramUrl" defaultValue={c.instagramUrl ?? ""} />
            <Field label="Facebook (nome)" name="facebookName" defaultValue={c.facebookName ?? ""} />
            <Field label="Link do Facebook" name="facebookUrl" defaultValue={c.facebookUrl ?? ""} />
          </div>
        </Panel>
        <Panel title="Sobre a empresa">
          <div className="grid gap-5 md:grid-cols-2">
            <TextArea label="Texto" name="about" defaultValue={c.about ?? ""} rows={8} hint="O primeiro parágrafo vira o título da seção. Separe parágrafos com uma linha em branco." />
            <div className="space-y-4">
              <ImageInput name="aboutImage" label="Foto (equipe, loja)" current={c.aboutImageSrc} />
              <Field label="Texto alternativo da foto" name="aboutImageAlt" defaultValue={c.aboutImageAlt ?? ""} />
            </div>
          </div>
        </Panel>
      </ActionForm>
    </AdminPage>
  );
}
