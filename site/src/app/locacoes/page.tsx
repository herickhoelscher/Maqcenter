import { Suspense } from "react";
import { Advantages } from "@/components/Advantages";
import { WhatsAppButton } from "@/components/Buttons";
import { Catalog } from "@/components/Catalog";
import { CatalogAside } from "@/components/CatalogAside";
import { CtaBand } from "@/components/CtaBand";
import { EquipmentCard } from "@/components/EquipmentCard";
import { PageHeader } from "@/components/PageHeader";
import { getCategories, getEquipment, getService } from "@/lib/content";
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
  const cards = Object.fromEntries(equipment.map((e) => [e.slug, <EquipmentCard key={e.slug} item={e} headingLevel="h2" />]));
  const catalogProps = { items: equipment, cards, categories: getCategories(), aside: <CatalogAside /> };

  return (
    <>
      <PageHeader
        badge="Cascavel e região"
        badgeNote="Orçamento pelo WhatsApp"
        title="Catálogo de Locação de Equipamentos"
        lead={service.description?.[0] ?? "Escolha os equipamentos, monte sua lista de orçamento ou cote direto pelo WhatsApp."}
        crumbs={[{ href: "/locacoes", label: "Locações de Equipamentos" }]}
        actions={<WhatsAppButton tone="whatsapp" message={service.whatsappMessage}>Falar sobre locação</WhatsAppButton>}
      >
        {/* The catalog reads ?q= and ?categoria=, so it renders on the client;
            the fallback shows every card while that loads. */}
        <Suspense fallback={<CatalogFallback {...catalogProps} />}>
          <Catalog {...catalogProps} />
        </Suspense>
      </PageHeader>
      <Advantages title="Por que alugar com a Maqcenter" />
      <CtaBand title="Vai começar uma obra?" text="Monte sua lista com vários equipamentos e envie o pedido de orçamento de uma vez pelo WhatsApp ou por e-mail." />
    </>
  );
}

function CatalogFallback({ items, cards }: { items: ReturnType<typeof getEquipment>; cards: Record<string, React.ReactNode> }) {
  return (
    <ul className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {items.map((e) => (
        <li key={e.slug}>{cards[e.slug]}</li>
      ))}
    </ul>
  );
}
