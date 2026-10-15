import Link from "next/link";
import { BrandGrid } from "@/components/BrandGrid";
import { ContactDetails } from "@/components/ContactDetails";
import { CtaBand } from "@/components/CtaBand";
import { PageHeader } from "@/components/PageHeader";
import { company, getServices, servicePaths } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: `Sobre a ${company.name}`,
  description: `${company.name}: ${company.tagline.toLowerCase()} em Cascavel - PR. Rua Erechim, 745, Centro.`,
  path: "/sobre",
});

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="Sobre" title={`Sobre a ${company.name}`} lead={`${company.tagline}, em ${company.address.city} - ${company.address.state}.`} crumbs={[{ href: "/sobre", label: "Sobre" }]} />

      <div className="container-site grid gap-12 py-12 md:py-16 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <div className="flex flex-col gap-10">
          {company.about && <p className="max-w-2xl text-lg">{company.about}</p>}
          <section aria-labelledby="servicos">
            <h2 id="servicos" className="font-display text-4xl">
              Serviços
            </h2>
            <ul className="mt-6">
              {getServices().map((s) => (
                <li key={s.slug} className="border-t-2 border-ink py-4">
                  <Link href={servicePaths[s.slug]} className="font-display text-2xl hover:text-blue">
                    {s.name}
                  </Link>
                  <p className="mt-1 text-steel">{s.summary}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <ContactDetails className="self-start" />
      </div>

      <section aria-labelledby="marcas" className="container-site pb-16">
        <h2 id="marcas" className="font-display text-4xl">
          Marcas que atendemos
        </h2>
        <div className="mt-6">
          <BrandGrid />
        </div>
      </section>

      <CtaBand title="Fale com a equipe" />
    </>
  );
}
