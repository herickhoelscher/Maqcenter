import Image from "next/image";
import Link from "next/link";
import { Advantages } from "@/components/Advantages";
import { BrandGrid } from "@/components/BrandGrid";
import { ContactDetails } from "@/components/ContactDetails";
import { CtaBand } from "@/components/CtaBand";
import { InstagramGallery } from "@/components/InstagramGallery";
import { ArrowIcon } from "@/components/icons";
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
      <PageHeader
        badge="Sobre"
        badgeNote={company.slogan ?? undefined}
        title={`Sobre a ${company.name}`}
        lead={`${company.tagline}, em ${company.address.city} - ${company.address.state}.`}
        crumbs={[{ href: "/sobre", label: "Sobre" }]}
      />

      <div className="container-site grid gap-8 py-10 lg:grid-cols-12 lg:py-16">
        <div className="space-y-8 lg:col-span-7">
          {company.about && (
            <div className="card space-y-4 p-6 md:p-8">
              {company.about.map((p, i) =>
                i === 0 ? (
                  <h2 key={p} className="text-headline-m text-navy">
                    {p}
                  </h2>
                ) : (
                  <p key={p} className="text-body-lg text-slate-text">
                    {p}
                  </p>
                ),
              )}
            </div>
          )}
          {company.aboutImage && (
            <figure className="card overflow-hidden">
              <Image
                src={company.aboutImage.src}
                alt={company.aboutImage.alt}
                width={company.aboutImage.width}
                height={company.aboutImage.height}
                sizes="(min-width: 1024px) 44rem, 92vw"
                preload
                className="w-full"
              />
              <figcaption className="px-5 py-3 text-body-sm text-outline">Equipe {company.name}</figcaption>
            </figure>
          )}
          <section aria-labelledby="servicos" className="space-y-4">
            <h2 id="servicos" className="text-headline-m text-navy">
              Serviços
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {getServices().map((s) => (
                <li key={s.slug}>
                  <Link href={servicePaths[s.slug]} className="card group flex h-full flex-col gap-2 p-5 transition-shadow hover:shadow-level2">
                    <span className="flex items-center justify-between gap-3 text-title text-navy group-hover:text-blue-accent">
                      {s.name}
                      <ArrowIcon className="size-5 shrink-0" />
                    </span>
                    <span className="text-body-sm text-slate-text">{s.summary}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <ContactDetails className="self-start lg:sticky lg:top-40 lg:col-span-5" />
      </div>

      <Advantages />

      <InstagramGallery limit={5} />

      <section aria-labelledby="marcas" className="bg-white py-16">
        <div className="container-site space-y-6">
          <h2 id="marcas" className="text-headline-m text-navy">
            Marcas que atendemos
          </h2>
          <BrandGrid />
        </div>
      </section>

      <CtaBand title="Fale com a equipe" text="WhatsApp, telefone ou lista de orçamento com vários equipamentos." />
    </>
  );
}
