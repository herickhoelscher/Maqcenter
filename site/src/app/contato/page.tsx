import { CallButton, WhatsAppButton } from "@/components/Buttons";
import { ContactDetails } from "@/components/ContactDetails";
import { ContactForm } from "@/components/ContactForm";
import { PageHeader } from "@/components/PageHeader";
import { company, formatAddress } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contato e orçamento",
  description: `Peça orçamento para a ${company.name}: WhatsApp ${company.phone.display}, e-mail ${company.email}. ${formatAddress()}.`,
  path: "/contato",
});

const mapQuery = encodeURIComponent(`${formatAddress()}, Brasil`);

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contato"
        title="Peça seu orçamento"
        lead="Fale pelo WhatsApp, ligue ou envie o formulário."
        crumbs={[{ href: "/contato", label: "Contato" }]}
      >
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <WhatsAppButton />
          <CallButton tone="dark" />
        </div>
      </PageHeader>

      <div className="container-site grid gap-12 py-12 md:py-16 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
        <section aria-labelledby="formulario">
          <h2 id="formulario" className="font-display text-4xl">
            Formulário de contato
          </h2>
          <div className="mt-6">
            <ContactForm />
          </div>
        </section>
        <div className="flex flex-col gap-6">
          <ContactDetails />
          <div className="overflow-hidden rounded-md border-2 border-ink bg-concrete">
            <iframe
              title={`Mapa: ${company.name}, ${formatAddress()}`}
              src={`https://maps.google.com/maps?q=${mapQuery}&z=16&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="aspect-[4/3] w-full"
            />
          </div>
        </div>
      </div>
    </>
  );
}
