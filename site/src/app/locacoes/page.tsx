import { CtaBand } from "@/components/CtaBand";
import { EquipmentCard } from "@/components/EquipmentCard";
import { PageHeader } from "@/components/PageHeader";
import { getEquipment, getService } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

const service = getService("locacoes");

export const metadata = pageMetadata({
  title: "Locação de equipamentos em Cascavel",
  description:
    "Locação de betoneira, compactador de solo, cortadeira de piso, lavador de pressão, rompedor de concreto, serra circular e vibrador de concreto em Cascavel - PR.",
  path: "/locacoes",
});

export default function RentalsPage() {
  const equipment = getEquipment();
  return (
    <>
      <PageHeader
        eyebrow="Locação"
        title="Equipamentos para locação"
        lead={service.description?.[0] ?? "Escolha o equipamento e peça o orçamento pelo WhatsApp."}
        crumbs={[{ href: "/locacoes", label: "Locações" }]}
      />
      <section aria-label="Lista de equipamentos" className="container-site py-12 md:py-16">
        <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {equipment.map((item) => (
            <li key={item.slug}>
              <EquipmentCard item={item} headingLevel="h2" />
            </li>
          ))}
        </ul>
      </section>
      <CtaBand title="Precisa de outro equipamento? Pergunte." message={service.whatsappMessage} />
    </>
  );
}
