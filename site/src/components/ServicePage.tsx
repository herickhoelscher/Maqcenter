import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Service } from "@/lib/content";
import { getServices, servicePaths } from "@/lib/content";
import { CallButton, WhatsAppButton } from "./Buttons";
import { ContactDetails } from "./ContactDetails";
import { CtaBand } from "./CtaBand";
import { ArrowIcon } from "./icons";
import { PageHeader } from "./PageHeader";

export async function ServicePage({ service, children, wide }: { service: Service; children?: ReactNode; wide?: ReactNode }) {
  const others = (await getServices()).filter((s) => s.slug !== service.slug);
  return (
    <>
      <PageHeader
        badge="Serviço"
        badgeNote="Cascavel e região"
        title={service.name}
        lead={service.summary}
        crumbs={[{ href: servicePaths[service.slug], label: service.name }]}
        actions={
          <>
            <WhatsAppButton message={service.whatsappMessage} />
            <CallButton />
          </>
        }
      />

      {wide}

      {service.image || children ? (
        <div className="container-site grid gap-8 py-10 lg:grid-cols-12 lg:py-16">
          <div className="space-y-8 lg:col-span-7">
            {service.description && <Description service={service} />}
            {children}
          </div>
          <div className="space-y-6 lg:col-span-5">
            {service.image && (
              <Image
                src={service.image.src}
                alt={service.image.alt}
                width={service.image.width}
                height={service.image.height}
                sizes="(min-width: 1024px) 30rem, 92vw"
                preload
                className="aspect-[4/3] w-full rounded-[var(--radius-card)] border border-concrete-200 object-cover object-left-top lg:aspect-auto"
              />
            )}
            <ContactDetails />
          </div>
        </div>
      ) : (
        // Text only: full-width text with the actions, contact card laid out
        // in columns below, so no column is left with empty space.
        <div className="container-site space-y-8 py-10 lg:py-16">
          {service.description && <Description service={service} withActions />}
          <ContactDetails layout="wide" />
        </div>
      )}

      <section aria-labelledby="outros-servicos" className="bg-surface-low py-14">
        <div className="container-site">
          <h2 id="outros-servicos" className="text-headline-m text-navy">
            Outros serviços
          </h2>
          <ul className="mt-6 grid gap-6 md:grid-cols-3">
            {others.map((s, i) => (
              <li key={s.slug} data-reveal style={{ "--reveal-delay": `${i * 80}ms` } as React.CSSProperties}>
                <Link href={servicePaths[s.slug]} className="card group flex h-full flex-col gap-2 p-5 transition duration-300 hover:-translate-y-1 hover:shadow-level2">
                  <span className="flex items-center justify-between gap-3 text-title text-navy group-hover:text-blue-accent">
                    {s.name}
                    <ArrowIcon className="size-5 shrink-0 transition-transform group-hover:translate-x-1" />
                  </span>
                  <span className="text-body-sm text-slate-text">{s.summary}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand title="Peça seu orçamento" text="Fale pelo WhatsApp, ligue ou monte uma lista com tudo que você precisa." />
    </>
  );
}

function Description({ service, withActions = false }: { service: Service; withActions?: boolean }) {
  return (
    <div className="card space-y-4 p-6 text-body-lg text-slate-text md:p-8">
      <div className="max-w-3xl space-y-4">
        {service.description?.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
      {withActions && (
        <div className="flex flex-col gap-3 border-t border-concrete-100 pt-5 sm:flex-row sm:flex-wrap">
          <WhatsAppButton message={service.whatsappMessage} />
          <Link href="/contato" className="btn btn-secondary">
            Enviar mensagem
          </Link>
        </div>
      )}
    </div>
  );
}

export function InfoList({ title, items, id }: { title: string; items: string[]; id: string }) {
  return (
    <section aria-labelledby={id} className="card p-6">
      <h2 id={id} className="text-headline-sm text-navy">
        {title}
      </h2>
      <ul className="mt-4 flex flex-wrap gap-2">
        {items.map((i) => (
          <li key={i} className="rounded-[var(--radius-control)] bg-concrete-100 px-3 py-1.5 text-spec text-slate-text">
            {i}
          </li>
        ))}
      </ul>
    </section>
  );
}
