import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Backdrop } from "@/components/Backdrop";
import { BrandGrid } from "@/components/BrandGrid";
import { CallButton, TextLink, WhatsAppButton } from "@/components/Buttons";
import { ContactDetails } from "@/components/ContactDetails";
import { CtaBand } from "@/components/CtaBand";
import { EquipmentCard } from "@/components/EquipmentCard";
import { ArrowIcon, DrillIcon, ListIcon, PinIcon, SearchIcon, VerifiedIcon, WrenchIcon } from "@/components/icons";
import { JsonLd } from "@/components/JsonLd";
import { company, getEquipment, getFeaturedEquipment, getServices, getTestimonials, servicePaths } from "@/lib/content";
import { localBusinessJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: `${company.name} Cascavel | ${company.tagline}`,
  description:
    "Locação de equipamentos para construção, assistência técnica de ferramentas elétricas, venda de máquinas e perfuração em concreto em Cascavel - PR. Orçamento pelo WhatsApp.",
  path: "/",
});

const serviceIcons: Record<string, ReactNode> = {
  locacoes: <ListIcon className="size-6" />,
  "assistencia-tecnica": <WrenchIcon className="size-6" />,
  "venda-de-maquinas": <VerifiedIcon className="size-6" />,
  "perfuracao-em-concreto": <DrillIcon className="size-6" />,
};

export default function Home() {
  const equipment = getEquipment();
  const featured = getFeaturedEquipment();
  const testimonials = getTestimonials();

  return (
    <>
      <JsonLd data={localBusinessJsonLd()} />

      <section className="on-dark relative overflow-hidden bg-navy-deep text-white">
        <Backdrop src="/images/fundos/hero-canteiro.webp" priority position="center 60%" overlay="bg-gradient-to-r from-navy-deep via-navy-deep/85 to-navy-deep/40" />
        <div className="container-site relative grid gap-10 py-12 lg:grid-cols-12 lg:items-center lg:py-24">
          <div className="space-y-6 lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge bg-amber text-charcoal">
                <PinIcon className="size-3.5" />
                {company.address.city} - {company.address.state}
              </span>
              <span className="text-spec text-on-dark">Há mais de 35 anos ao lado de quem constrói</span>
            </div>
            <h1 className="text-display-m md:text-display">Locação de máquinas e ferramentas elétricas</h1>
            <p className="max-w-xl text-body-lg text-on-dark">
              Locação de equipamentos, assistência técnica, venda de máquinas e perfuração em concreto. Peça seu orçamento pelo WhatsApp.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <WhatsAppButton />
              <CallButton tone="dark" />
            </div>
            <form action="/locacoes" role="search" className="flex max-w-xl md:hidden">
              <label htmlFor="busca-home" className="sr-only">
                Buscar equipamentos
              </label>
              <input
                id="busca-home"
                name="q"
                type="search"
                placeholder="Buscar equipamento"
                className="w-full rounded-l-[var(--radius-control)] border-0 bg-white px-4 py-3 text-body text-charcoal focus:outline-none"
              />
              <button type="submit" className="btn btn-primary rounded-l-none" aria-label="Buscar">
                <SearchIcon className="size-5" />
              </button>
            </form>
          </div>

          <aside aria-labelledby="lista-locacao" className="card overflow-hidden text-charcoal lg:col-span-5">
            <div className="flex items-center justify-between border-b border-concrete-200 bg-concrete-50 px-5 py-3">
              <h2 id="lista-locacao" className="text-title text-navy">
                Equipamentos para locação
              </h2>
              <span className="rounded-full bg-concrete-200 px-2 py-0.5 text-[11px] font-bold text-outline">{equipment.length}</span>
            </div>
            <ul>
              {equipment.map((item) => (
                <li key={item.slug} className="border-b border-concrete-100 last:border-b-0">
                  <Link href={`/locacoes/${item.slug}`} className="group flex min-h-12 items-center justify-between gap-3 px-5 py-2.5 hover:bg-concrete-50">
                    <span>
                      <span className="block text-body font-semibold text-navy group-hover:text-blue-accent">{item.name}</span>
                      <span className="text-body-sm text-outline">{item.category}</span>
                    </span>
                    <ArrowIcon className="size-4 text-outline transition-transform group-hover:translate-x-1 group-hover:text-blue-accent" />
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section aria-labelledby="servicos" className="py-16">
        <div className="container-site">
          <div className="mx-auto max-w-2xl space-y-3 text-center">
            <span className="badge bg-blue-accent/10 text-blue-accent">Serviços</span>
            <h2 id="servicos" className="text-headline-m text-navy md:text-headline">
              O que a {company.name} faz
            </h2>
          </div>
          <ul className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {getServices().map((s, i) => (
              <li key={s.slug}>
                <Link href={servicePaths[s.slug]} className="card group flex h-full flex-col gap-4 p-6 transition-shadow hover:shadow-level2">
                  <span className={`grid size-12 place-items-center rounded-[var(--radius-card)] ${i % 2 ? "bg-amber text-charcoal" : "bg-navy text-amber"}`}>
                    {serviceIcons[s.slug]}
                  </span>
                  <span className="text-title text-navy group-hover:text-blue-accent">{s.name}</span>
                  <span className="flex-1 text-body-sm text-slate-text">{s.summary}</span>
                  <span className="inline-flex items-center gap-1.5 text-btn font-bold text-blue-accent">
                    Saiba mais
                    <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {featured.length > 0 && (
        <section aria-labelledby="destaques" className="bg-surface-mid py-16">
          <div className="container-site">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-2">
                <span className="badge bg-navy text-amber">Locação</span>
                <h2 id="destaques" className="text-headline-m text-navy md:text-headline">
                  Equipamentos em destaque
                </h2>
              </div>
              <TextLink href="/locacoes">Ver catálogo completo</TextLink>
            </div>
            <ul className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {featured.map((item) => (
                <li key={item.slug}>
                  <EquipmentCard item={item} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {company.about && (
        <section aria-labelledby="sobre" className="py-16">
          <div className="container-site grid gap-8 lg:grid-cols-12 lg:items-center">
            {company.aboutImage && (
              <Image
                src={company.aboutImage.src}
                alt={company.aboutImage.alt}
                width={company.aboutImage.width}
                height={company.aboutImage.height}
                sizes="(min-width: 1024px) 36rem, 92vw"
                className="w-full rounded-[var(--radius-card)] border border-concrete-200 shadow-level1 lg:col-span-6"
              />
            )}
            <div className="space-y-4 lg:col-span-6">
              <span className="badge bg-blue-accent/10 text-blue-accent">{company.slogan}</span>
              <h2 id="sobre" className="text-headline-m text-navy md:text-headline">
                {company.about[0]}
              </h2>
              {company.about.slice(1).map((p) => (
                <p key={p} className="text-body-lg text-slate-text">
                  {p}
                </p>
              ))}
              <TextLink href="/sobre">Conheça a {company.name}</TextLink>
            </div>
          </div>
        </section>
      )}

      <section aria-labelledby="marcas" className="bg-white py-16">
        <div className="container-site space-y-8">
          <div className="mx-auto max-w-2xl space-y-3 text-center">
            <span className="badge bg-blue-accent/10 text-blue-accent">Marcas</span>
            <h2 id="marcas" className="text-headline-m text-navy md:text-headline">
              Atendemos as melhores marcas do mercado
            </h2>
          </div>
          <BrandGrid />
          {testimonials.length > 0 && (
            <ul className="grid gap-6 md:grid-cols-2">
              {testimonials.map((t) => (
                <li key={t.author}>
                  <figure className="card h-full p-6">
                    <blockquote className="text-body-lg text-slate-text">{t.text}</blockquote>
                    <figcaption className="mt-4 text-spec text-navy">
                      {t.author}
                      {t.source && <span className="text-outline"> · {t.source}</span>}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section aria-labelledby="onde" className="bg-surface-low py-16">
        <div className="container-site grid gap-8 lg:grid-cols-12 lg:items-start">
          <div className="space-y-4 lg:col-span-5">
            <span className="badge bg-navy text-amber">Unidade {company.address.city}</span>
            <h2 id="onde" className="text-headline-m text-navy md:text-headline">
              Fale com a equipe
            </h2>
            <p className="text-body-lg text-slate-text">WhatsApp, telefone, e-mail ou formulário. Escolha o que for mais prático.</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <WhatsAppButton tone="whatsapp">WhatsApp</WhatsAppButton>
              <Link href="/contato" className="btn btn-secondary">
                Enviar mensagem
              </Link>
            </div>
          </div>
          <ContactDetails className="lg:col-span-7" />
        </div>
      </section>

      <CtaBand title="Vai começar uma obra?" text="Monte sua lista com vários equipamentos e envie o pedido de orçamento de uma vez pelo WhatsApp ou por e-mail." />
    </>
  );
}
