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

export function ServicePage({ service, children }: { service: Service; children?: ReactNode }) {
  const others = getServices().filter((s) => s.slug !== service.slug);
  return (
    <>
      <PageHeader eyebrow="Serviço" title={service.name} lead={service.summary} crumbs={[{ href: servicePaths[service.slug], label: service.name }]}>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <WhatsAppButton message={service.whatsappMessage} />
          <CallButton tone="dark" />
        </div>
      </PageHeader>

      <div className="container-site grid gap-10 py-12 md:py-16 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <div className="flex flex-col gap-10">
          {service.description && <p className="max-w-2xl text-lg">{service.description}</p>}
          {children}
          <ContactDetails />
        </div>
        {service.image && (
          <div className="relative self-start overflow-hidden rounded-md border-2 border-ink lg:sticky lg:top-28">
            <Image
              src={service.image.src}
              alt={service.image.alt}
              width={service.image.width}
              height={service.image.height}
              sizes="(min-width: 1024px) 26rem, 90vw"
              priority
              className="aspect-[4/3] w-full object-cover lg:aspect-[4/5]"
            />
          </div>
        )}
      </div>

      <section aria-labelledby="outros-servicos" className="border-t-2 border-ink bg-concrete">
        <div className="container-site py-14">
          <h2 id="outros-servicos" className="font-display text-4xl">
            Outros serviços
          </h2>
          <ul className="mt-8 grid gap-x-8 md:grid-cols-3">
            {others.map((s) => (
              <li key={s.slug} className="border-t-4 border-ink">
                <Link href={servicePaths[s.slug]} className="group flex items-center justify-between gap-4 py-5">
                  <span className="font-display text-2xl group-hover:text-blue">{s.name}</span>
                  <ArrowIcon className="size-6 shrink-0 transition-transform group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand title="Peça seu orçamento" message={service.whatsappMessage} />
    </>
  );
}
