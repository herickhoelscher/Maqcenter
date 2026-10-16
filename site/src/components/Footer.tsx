import Link from "next/link";
import { company, formatHours, getEquipment } from "@/lib/content";
import { whatsappUrl } from "@/lib/whatsapp";
import { ClockIcon, MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "./icons";
import { Logo } from "./Logo";
import { PaymentMethods, TrustSeals } from "./PaymentBadges";


export function Footer() {
  const a = company.address;
  return (
    <footer className="on-dark bg-navy-deep pt-16 pb-24 text-on-dark md:pb-6">
      <div className="container-site">
        <div className="grid gap-10 border-b border-white/15 pb-10 sm:grid-cols-2 lg:grid-cols-6">
          <div className="space-y-4 sm:col-span-2">
            <Logo tone="dark" />
            <p className="max-w-sm text-body">
              {company.tagline} em {a.city} - {a.state}. {company.slogan}
            </p>
            <a href={whatsappUrl()} target="_blank" rel="noopener" className="btn btn-whatsapp">
              <WhatsAppIcon className="size-5" />
              WhatsApp Direto
              <span className="sr-only">(abre o WhatsApp)</span>
            </a>
          </div>
          <FooterList title="Equipamentos" links={getEquipment().map((e) => ({ href: `/locacoes/${e.slug}`, label: e.name }))} />
          <div className="space-y-8">
            <FooterList
              title="Informações"
              links={[
                { href: "/sobre", label: "Sobre a loja" },
                { href: "/politica-de-entrega", label: "Política de entrega" },
                { href: "/politica-de-privacidade", label: "Política de privacidade" },
                { href: "/termos-e-condicoes", label: "Termos e condições" },
              ]}
            />
          </div>
          <FooterList
            title="Serviços ao cliente"
            links={[
              { href: "/contato", label: "Entre em contato" },
              { href: "/contato?assunto=troca-devolucao", label: "Solicitar devolução" },
              { href: "/orcamento", label: "Lista de orçamento" },
              { href: "/mapa-do-site", label: "Mapa do site" },
            ]}
          />
          <div>
            <h2 className="mb-4 text-body font-bold tracking-wider text-amber uppercase">Atendimento</h2>
            <address className="space-y-3 text-body-sm not-italic">
              <p className="flex items-start gap-2">
                <PhoneIcon className="mt-0.5 size-4 shrink-0 text-amber" />
                <span>
                  <a href={`tel:${company.phone.e164}`} className="block py-1 hover:text-white">
                    {company.phone.display}
                  </a>
                  {company.landline && (
                    <a href={`tel:${company.landline.e164}`} className="block py-1 hover:text-white">
                      {company.landline.display}
                    </a>
                  )}
                </span>
              </p>
              <p className="flex items-start gap-2">
                <PinIcon className="mt-0.5 size-4 shrink-0 text-amber" />
                <span>
                  {a.street} - {a.district}
                  <br />
                  {a.city} - {a.state}
                  {a.postalCode && <> · CEP {a.postalCode}</>}
                </span>
              </p>
              <p className="flex items-start gap-2">
                <MailIcon className="mt-0.5 size-4 shrink-0 text-amber" />
                <span className="break-all">
                  <a href={`mailto:${company.emailSite}`} className="block py-1 hover:text-white">
                    {company.emailSite}
                  </a>
                  <a href={`mailto:${company.email}`} className="block py-1 hover:text-white">
                    {company.email}
                  </a>
                </span>
              </p>
              {formatHours().map((h) => (
                <p key={h} className="flex items-start gap-2">
                  <ClockIcon className="mt-0.5 size-4 shrink-0 text-amber" />
                  {h}
                </p>
              ))}
            </address>
          </div>
        </div>

        <div className="grid items-center gap-6 border-b border-white/10 py-6 lg:grid-cols-[auto_1fr]">
          <div className="space-y-3">
            <span className="block text-badge tracking-wider uppercase">Formas de pagamento</span>
            <PaymentMethods />
          </div>
          <div className="lg:justify-self-end">
            <TrustSeals host={new URL(company.siteUrl).host} />
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-6 text-body-sm text-outline-variant md:flex-row">
          <p>
            © {process.env.BUILD_YEAR} {company.legalName ?? company.name}
            {company.cnpj && `. CNPJ ${company.cnpj}`}. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/politica-de-privacidade" className="hover:text-white">
              Privacidade
            </Link>
            <Link href="/termos-e-condicoes" className="hover:text-white">
              Termos
            </Link>
            <Link href="/mapa-do-site" className="hover:text-white">
              Mapa do site
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterList({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <nav aria-label={title}>
      <h2 className="mb-4 text-body font-bold tracking-wider text-amber uppercase">{title}</h2>
      <ul className="space-y-2 text-body-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="transition-colors hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
