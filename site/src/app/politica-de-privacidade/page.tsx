import { LegalPage } from "@/components/LegalPage";
import { company, legal } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Política de privacidade",
  description: `Como o site da ${company.name} trata os dados enviados pelo formulário de contato.`,
  path: "/politica-de-privacidade",
});

export default function PrivacyPage() {
  return <LegalPage content={legal.privacy} path="/politica-de-privacidade" />;
}
