import { LegalPage } from "@/components/LegalPage";
import { company, legal } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Termos e condições",
  description: `Termos e condições de uso do site da ${company.name}.`,
  path: "/termos-e-condicoes",
  // Hidden from search until the text exists.
  noindex: legal.terms.sections.length === 0,
});

export default function TermsPage() {
  return <LegalPage content={legal.terms} path="/termos-e-condicoes" />;
}
