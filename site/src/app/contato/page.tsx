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
            <ContactForm />
          </div>
        </section>
        <div className="space-y-6 lg:col-span-5">
          <ContactDetails />
          <div className="card overflow-hidden">
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
