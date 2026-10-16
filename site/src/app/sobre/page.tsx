import Image from "next/image";
import Link from "next/link";
import { BrandGrid } from "@/components/BrandGrid";
import { ContactDetails } from "@/components/ContactDetails";
import { CtaBand } from "@/components/CtaBand";
import { PageHeader } from "@/components/PageHeader";
import { company, getServices, servicePaths } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: `Sobre a ${company.name}`,
  description: `Há mais de 35 anos ao lado de quem constrói. ${company.tagline} na Rua Erechim, 745, Centro, Cascavel - PR.`,
  path: "/sobre",
  image: company.aboutImage?.src,
});

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="Sobre" title={company.slogan} lead={`${company.tagline}, em ${company.address.city} - ${company.address.state}.`} crumbs={[{ href: "/sobre", label: "Sobre" }]} />

      <div className="container-site grid gap-12 py-12 md:py-16 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <div className="flex flex-col gap-10">
          {company.about && (
            <div className="max-w-2xl space-y-4 text-lg">
              {company.about.map((p, i) => (
                <p key={p} className={i === 0 ? "font-display text-3xl md:text-4xl" : undefined}>
                  {p}
                </p>
              ))}
            </div>
          )}
          {company.aboutImage && (
            <figure>
              <Image
                src={company.aboutImage.src}
                alt={company.aboutImage.alt}
                width={company.aboutImage.width}
                height={company.aboutImage.height}
                sizes="(min-width: 1024px) 40rem, 92vw"
                priority
                className="w-full rounded-md border-2 border-ink"
              />
              <figcaption className="label-mono mt-3 text-steel">Equipe {company.name}</figcaption>
            </figure>
          )}
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
        <ContactDetails className="self-start lg:sticky lg:top-28" />
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
