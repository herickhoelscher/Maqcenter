import { LegalPage } from "@/components/LegalPage";
import { legal } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Política de entrega",
  description: `Política de entrega e retirada de equipamentos da MAQCENTER.`,
  path: "/politica-de-entrega",
  // Hidden from search until the text exists.
  noindex: legal.delivery.sections.length === 0,
});

export default function DeliveryPolicyPage() {
  return <LegalPage content={legal.delivery} path="/politica-de-entrega" />;
}
