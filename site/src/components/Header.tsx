import Image from "next/image";
import Link from "next/link";
import { company, formatAddress } from "@/lib/content";
import { whatsappUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "./icons";
import { MobileMenu } from "./MobileMenu";
import { mainNav } from "./nav";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b-2 border-ink bg-white">
      <div className="hidden bg-ink text-ink-soft lg:block">
        <div className="container-site label-mono flex h-8 items-center justify-between text-[0.6875rem]">
          <span>{formatAddress()}</span>
          <span className="flex gap-5">
            <a href={`tel:${company.landline.e164}`} className="text-white hover:text-signal">
              {company.landline.display}
            </a>
            <a href={`tel:${company.phone.e164}`} className="text-white hover:text-signal">
              WhatsApp {company.phone.display}
            </a>
          </span>
        </div>
      </div>
      <div className="container-site flex h-16 items-center justify-between gap-4 lg:h-[4.5rem]">
        <Link href="/" className="shrink-0" aria-label="MAQCENTER, página inicial">
          <Image
            src="/images/logo-maqcenter.webp"
            alt="MAQCENTER Ferramentas Elétricas"
            width={836}
            height={200}
            sizes="12rem"
            priority
            className="h-9 w-auto lg:h-10"
          />
        </Link>
        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-6 text-[0.9375rem] font-medium">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="py-2 hover:text-blue hover:underline hover:underline-offset-8">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noopener"
            className="hidden min-h-11 items-center gap-2 rounded-md bg-signal px-4 text-sm font-semibold text-ink hover:bg-signal-deep sm:inline-flex"
          >
            <WhatsAppIcon />
            Orçamento
            <span className="sr-only">(abre o WhatsApp)</span>
          </a>
          <MobileMenu items={mainNav} />
        </div>
      </div>
    </header>
  );
}
