import Link from "next/link";
import { company, formatAddress } from "@/lib/content";
import { whatsappUrl } from "@/lib/whatsapp";
import { InstagramIcon, MailIcon, PhoneIcon, PinIcon, SearchIcon, SupportIcon, WhatsAppIcon } from "./icons";
import { Logo } from "./Logo";
import { NavBar } from "./NavBar";
import { QuoteHeaderLink } from "./quote/QuoteControls";

export function Header() {
  return (
    <header className="z-50 shadow-[0_1px_8px_rgba(0,0,0,0.06)] lg:sticky lg:top-0">
      <div className="on-dark bg-navy-deep py-2 text-on-dark">
        <div className="container-site flex flex-wrap items-center justify-between gap-2 text-body-sm">
          <div className="flex flex-wrap items-center gap-4">
            <a href={`tel:${company.phone.e164}`} className="flex items-center gap-1.5 hover:text-amber">
              <PhoneIcon className="size-4 text-amber" />
              {company.phone.display}
            </a>
            {company.landline && (
              <a href={`tel:${company.landline.e164}`} className="hidden items-center gap-1.5 hover:text-amber md:flex">
                <PhoneIcon className="size-4 text-amber" />
                {company.landline.display}
              </a>
            )}
            <a href={`mailto:${company.email}`} className="hidden items-center gap-1.5 hover:text-amber sm:flex">
              <MailIcon className="size-4 text-amber" />
              {company.email}
            </a>
            <span className="hidden items-center gap-1.5 text-outline-variant xl:flex">
              <PinIcon className="size-4 text-amber" />
              {formatAddress()}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <a
              href={company.social.instagram.url}
              target="_blank"
              rel="noopener"
              aria-label={`Instagram ${company.social.instagram.handle}`}
              className="hidden size-6 place-items-center rounded-[var(--radius-control)] hover:text-amber md:grid"
            >
              <InstagramIcon className="size-4" />
            </a>
            <a href={whatsappUrl()} target="_blank" rel="noopener" className="badge bg-success-strong text-white hover:bg-[#065f46]">
              <WhatsAppIcon className="size-3.5" />
              WhatsApp
              <span className="sr-only">(abre o WhatsApp)</span>
            </a>
          </div>
        </div>
      </div>

      <div className="border-b border-concrete-200 bg-white py-3">
        <div className="container-site flex items-center justify-between gap-4">
          <Logo />
          <form action="/locacoes" role="search" className="hidden max-w-2xl flex-1 md:flex">
            <label htmlFor="busca-topo" className="sr-only">
              Buscar equipamentos
            </label>
            <input
              id="busca-topo"
              name="q"
              type="search"
              placeholder="Buscar betoneira, rompedor, compactador..."
              className="w-full rounded-l-[var(--radius-control)] border border-concrete-200 bg-concrete-50 px-4 py-2.5 text-body text-charcoal focus:border-blue-accent focus:bg-white focus:outline-none"
            />
            <button type="submit" className="btn btn-primary rounded-l-none px-6">
              <SearchIcon className="size-5" />
              <span className="hidden lg:inline">Buscar</span>
            </button>
          </form>
          <div className="flex items-center gap-3 lg:gap-5">
            <Link href="/contato" className="hidden flex-col items-end text-right sm:flex">
              <span className="text-badge text-outline uppercase">Precisa de ajuda?</span>
              <span className="flex items-center gap-1 text-spec font-bold text-navy">
                <SupportIcon className="size-4 text-blue-accent" />
                Atendimento
              </span>
            </Link>
            <QuoteHeaderLink />
          </div>
        </div>
      </div>

      <NavBar />
    </header>
  );
}
