import { PageHeader } from "@/components/PageHeader";
import { QuoteBuilder } from "@/components/quote/QuoteBuilder";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Lista de orçamento",
  description: "Monte uma lista com os equipamentos que você precisa e envie o pedido de orçamento pelo WhatsApp ou por e-mail.",
  path: "/orcamento",
  // The list lives in the visitor's browser; nothing here to index.
  noindex: true,
});

export default function QuotePage() {
  return (
    <>
      <PageHeader
        badge="Orçamento rápido"
        badgeNote="Sem compromisso"
        title="Lista de orçamento"
        lead="Junte os equipamentos que você precisa, informe o período e envie tudo de uma vez."
        crumbs={[{ href: "/orcamento", label: "Orçamento Rápido" }]}
      />
      <div className="container-site py-10 lg:py-16">
        <QuoteBuilder />
      </div>
    </>
  );
}
