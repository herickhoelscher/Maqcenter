import Link from "next/link";
import { company, formatAddress, formatHours } from "@/lib/content";
import { mainNav } from "./nav";

export function Footer() {
  return (
    <footer className="on-dark bg-ink pb-24 text-ink-soft md:pb-10">
      <div className="container-site grid gap-10 py-14 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <p className="font-display text-4xl text-white">MAQCENTER</p>
          <p className="mt-2 max-w-xs">{company.tagline}.</p>
          <ul className="mt-6 flex gap-4 text-sm">
            <li>
              <a href={company.social.instagram.url} target="_blank" rel="noopener" className="text-white underline-offset-4 hover:underline">
                Instagram {company.social.instagram.handle}
              </a>
            </li>
            <li>
              <a href={company.social.facebook.url} target="_blank" rel="noopener" className="text-white underline-offset-4 hover:underline">
                Facebook
              </a>
            </li>
          </ul>
        </div>
        <nav aria-label="Rodapé">
          <h2 className="label-mono text-signal">Páginas</h2>
          <ul className="mt-4 space-y-2.5">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-white underline-offset-4 hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="label-mono text-signal">Contato</h2>
          <address className="mt-4 space-y-2.5 not-italic">
            <p>{formatAddress()}</p>
            <p>
              <a href={`tel:${company.phone.e164}`} className="text-white underline-offset-4 hover:underline">
                {company.phone.display}
              </a>
            </p>
            <p>
              <a href={`mailto:${company.email}`} className="text-white underline-offset-4 hover:underline">
                {company.email}
              </a>
            </p>
            {formatHours().map((h) => (
              <p key={h}>{h}</p>
            ))}
          </address>
        </div>
      </div>
      <div className="container-site flex flex-col gap-3 border-t border-white/15 pt-6 text-sm sm:flex-row sm:justify-between">
        <p>
          © {process.env.BUILD_YEAR} {company.name}
          {company.cnpj && ` · CNPJ ${company.cnpj}`}
        </p>
        <ul className="flex gap-5">
          <li>
            <Link href="/politica-de-privacidade" className="underline-offset-4 hover:text-white hover:underline">
              Política de privacidade
            </Link>
          </li>
          <li>
            <Link href="/termos-e-condicoes" className="underline-offset-4 hover:text-white hover:underline">
              Termos e condições
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
