import Link from "next/link";
import { company, formatHours, getEquipment } from "@/lib/content";
import { whatsappUrl } from "@/lib/whatsapp";
import { ClockIcon, MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "./icons";
import { Logo } from "./Logo";

export function Footer() {
  const a = company.address;
  return (
    <footer className="on-dark bg-navy-deep pt-16 pb-24 text-on-dark md:pb-6">
      <div className="container-site">
        <div className="grid gap-10 border-b border-white/15 pb-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
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
          <FooterList
            title="Institucional"
            links={[
              { href: "/sobre", label: "Sobre a Maqcenter" },
              { href: "/assistencia-tecnica", label: "Assistência Técnica" },
              { href: "/perfuracao-em-concreto", label: "Perfuração em Concreto" },
              { href: "/venda-de-maquinas", label: "Venda de Máquinas" },
              { href: "/politica-de-privacidade", label: "Política de Privacidade" },
              { href: "/termos-e-condicoes", label: "Termos e Condições" },
            ]}
          />
          <div>
            <h2 className="mb-4 text-body font-bold tracking-wider text-amber uppercase">Unidade {a.city}</h2>
            <address className="space-y-3 text-body-sm not-italic">
              <p className="flex items-start gap-2">
                <PinIcon className="mt-0.5 size-4 shrink-0 text-amber" />
                <span>
                  {a.street}
                  <br />
                  {a.district} - {a.city} - {a.state}
                  {a.postalCode && (
                    <>
                      <br />
                      CEP {a.postalCode}
                    </>
                  )}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <PhoneIcon className="size-4 shrink-0 text-amber" />
                <a href={`tel:${company.phone.e164}`} className="hover:text-white">
                  {company.phone.display} (WhatsApp)
                </a>
              </p>
              {company.landline && (
                <p className="flex items-center gap-2">
                  <PhoneIcon className="size-4 shrink-0 text-amber" />
                  <a href={`tel:${company.landline.e164}`} className="hover:text-white">
                    {company.landline.display}
                  </a>
                </p>
              )}
              <p className="flex items-center gap-2">
                <MailIcon className="size-4 shrink-0 text-amber" />
                <a href={`mailto:${company.email}`} className="break-all hover:text-white">
                  {company.email}
                </a>
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
            <Link href="/contato" className="hover:text-white">
              Contato
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
            <Link href={l.href} className="hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
