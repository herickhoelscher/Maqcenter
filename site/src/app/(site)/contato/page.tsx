import { CallButton, WhatsAppButton } from "@/components/Buttons";
import { ContactDetails, mapsUrl } from "@/components/ContactDetails";
import { MapEmbed } from "@/components/MapEmbed";
import { Suspense } from "react";
import { ContactForm, ContactFormFromParams } from "@/components/ContactForm";
import { PageHeader } from "@/components/PageHeader";
import { formatAddress, getCompany } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const company = await getCompany();
  return pageMetadata({
  title: "Contato e orçamento",
  description: `Peça orçamento para a ${company.name}: WhatsApp ${company.phone.display}, e-mail ${company.email}. ${formatAddress(company)}.`,
  path: "/contato",
  });
}

export default async function ContactPage() {
  const company = await getCompany();
  return (
    <>
      <PageHeader
        badge="Fale conosco"
        badgeNote={`${company.address.city} - ${company.address.state}`}
        title="Contato e orçamento"
        lead="Fale pelo WhatsApp, ligue ou envie o formulário."
        crumbs={[{ href: "/contato", label: "Fale Conosco" }]}
        actions={
          <>
            <WhatsAppButton tone="whatsapp">WhatsApp</WhatsAppButton>
            <CallButton />
          </>
        }
      />

      <div className="container-site grid gap-8 py-10 lg:grid-cols-12 lg:py-16">
        <section aria-labelledby="formulario" className="card p-6 md:p-8 lg:col-span-7">
          <h2 id="formulario" className="text-headline-m text-navy">
            Formulário de contato
          </h2>
          <div className="mt-6">
            {/* Reads ?assunto= to preselect the subject. */}
            <Suspense fallback={<ContactForm />}>
              <ContactFormFromParams />
            </Suspense>
          </div>
        </section>
        <div className="space-y-6 lg:col-span-5">
          <ContactDetails />
          <div className="card overflow-hidden">
            <MapEmbed
              query={`${formatAddress(company)}, Brasil`}
              title={`Mapa: ${company.name}, ${formatAddress(company)}`}
              address={formatAddress(company)}
              mapsUrl={mapsUrl(company)}
            />
          </div>
        </div>
      </div>
    </>
  );
}
