import Link from "next/link";
import { BrandGrid } from "@/components/BrandGrid";
import { CallButton, TextLink, WhatsAppButton } from "@/components/Buttons";
import { ContactDetails, mapsUrl } from "@/components/ContactDetails";
import { EquipmentCard } from "@/components/EquipmentCard";
import { ArrowIcon, PinIcon } from "@/components/icons";
import { JsonLd } from "@/components/JsonLd";
import { Plate } from "@/components/Plate";
import { company, getEquipment, getFeaturedEquipment, getServices, getTestimonials, servicePaths } from "@/lib/content";
import { localBusinessJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: `${company.name} Cascavel | ${company.tagline}`,
  description:
    "Locação de equipamentos para construção, assistência técnica de ferramentas elétricas, venda de máquinas e perfuração em concreto em Cascavel - PR. Orçamento pelo WhatsApp.",
  path: "/",
});

export default function Home() {
  const equipment = getEquipment();
  const featured = getFeaturedEquipment();
  const testimonials = getTestimonials();

  return (
    <>
      <JsonLd data={localBusinessJsonLd()} />

      <section className="on-dark bg-ink text-white">
        <div className="container-site grid gap-10 pt-10 pb-14 lg:grid-cols-[1.35fr_1fr] lg:items-end lg:gap-16 lg:pt-20 lg:pb-20">
          <div>
            <p className="label-mono flex items-center gap-2 text-signal">
              <PinIcon className="size-4" />
              {company.address.city} · {company.address.state}
            </p>
            <h1 className="font-display mt-4 text-[3.25rem] sm:text-7xl lg:text-[5.5rem]">
              Locação de máquinas e ferramentas elétricas.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-soft">
              Locação de equipamentos, assistência técnica, venda de máquinas e perfuração em concreto. Peça seu orçamento
              pelo WhatsApp.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <WhatsAppButton />
              <CallButton tone="dark" />
            </div>
          </div>

          <Plate as="aside" label="Equipamentos para locação" aside={`${equipment.length} itens`} className="text-ink">
            <ul className="mt-1">
              {equipment.map((item) => (
                <li key={item.slug} className="border-b border-dashed border-line last:border-b-0">
                  <Link
                    href={`/locacoes/${item.slug}`}
                    className="group flex min-h-12 items-center justify-between gap-3 px-3 font-semibold hover:text-blue"
                  >
                    {item.name}
                    <ArrowIcon className="size-4 text-steel transition-transform group-hover:translate-x-1 group-hover:text-blue" />
                  </Link>
                </li>
              ))}
            </ul>
          </Plate>
        </div>
      </section>

      <section aria-labelledby="servicos" className="container-site py-16 md:py-24">
        <h2 id="servicos" className="font-display text-4xl md:text-6xl">
          O que a {company.name} faz
        </h2>
        <ul className="mt-10 grid gap-x-10 gap-y-2 md:grid-cols-2">
          {getServices().map((s) => (
            <li key={s.slug} className="border-t-4 border-ink">
              <Link href={servicePaths[s.slug]} className="group flex h-full flex-col gap-3 py-6 pr-2">
                <span className="font-display flex items-center justify-between gap-4 text-3xl group-hover:text-blue md:text-4xl">
                  {s.name}
                  <ArrowIcon className="size-7 shrink-0 transition-transform group-hover:translate-x-1" />
                </span>
                <span className="max-w-md text-steel">{s.summary}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {featured.length > 0 && (
        <section aria-labelledby="destaques" className="border-y-2 border-ink bg-concrete">
          <div className="container-site py-16 md:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="destaques" className="font-display text-4xl md:text-6xl">
                Equipamentos em destaque
              </h2>
              <TextLink href="/locacoes">Ver todos os equipamentos</TextLink>
            </div>
            <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
              {featured.map((item) => (
                <li key={item.slug}>
                  <EquipmentCard item={item} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section aria-labelledby="marcas" className="container-site py-16 md:py-24">
        <p className="label-mono text-blue">Marcas</p>
        <h2 id="marcas" className="font-display mt-3 max-w-3xl text-4xl md:text-6xl">
          Atendemos as melhores marcas do mercado
        </h2>
        <div className="mt-10">
          <BrandGrid />
        </div>

        {testimonials.length > 0 && (
          <ul className="mt-14 grid gap-5 md:grid-cols-2">
            {testimonials.map((t) => (
              <li key={t.author}>
                <figure className="h-full border-l-4 border-blue bg-white p-6">
                  <blockquote className="text-lg">{t.text}</blockquote>
                  <figcaption className="label-mono mt-4 text-steel">
                    {t.author}
                    {t.source && ` · ${t.source}`}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-12 flex flex-col gap-4 border-2 border-ink bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-lg">
            Acompanhe a {company.name} no Instagram: <strong>{company.social.instagram.handle}</strong>
          </p>
          <a
            href={company.social.instagram.url}
            target="_blank"
            rel="noopener"
            className="inline-flex min-h-12 items-center justify-center rounded-md border-2 border-ink px-5 font-semibold hover:bg-ink hover:text-white"
          >
            Abrir Instagram
          </a>
        </div>
      </section>

      <section aria-labelledby="contato" className="on-dark bg-ink text-white">
        <div className="container-site grid gap-10 py-16 md:py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 id="contato" className="font-display text-4xl md:text-6xl">
              Peça seu orçamento
            </h2>
            <p className="mt-5 max-w-md text-lg text-ink-soft">
              Fale pelo WhatsApp, ligue ou mande uma mensagem pelo formulário.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <WhatsAppButton />
              <CallButton tone="dark" />
            </div>
            <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              <Link href="/contato" className="font-semibold text-white underline underline-offset-4 hover:text-signal">
                Enviar pelo formulário
              </Link>
              <a
                href={mapsUrl()}
                target="_blank"
                rel="noopener"
                className="font-semibold text-white underline underline-offset-4 hover:text-signal"
              >
                Ver no mapa
              </a>
            </p>
          </div>
          <ContactDetails className="text-ink" />
        </div>
      </section>
    </>
  );
}
