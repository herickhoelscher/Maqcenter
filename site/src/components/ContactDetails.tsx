import type { ReactNode } from "react";
import { company, formatAddress, formatHours } from "@/lib/content";
import { ClockIcon, InstagramIcon, MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "./icons";

export function mapsUrl() {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${company.name}, ${formatAddress()}`)}`;
}

function Row({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3 border-b border-concrete-100 py-3 last:border-b-0">
      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-[var(--radius-control)] bg-concrete-100 text-blue-accent">{icon}</span>
      <div>
        <p className="text-badge tracking-wider text-outline uppercase">{label}</p>
        <div className="mt-0.5 text-body text-charcoal">{children}</div>
      </div>
    </li>
  );
}

const link = "font-semibold text-navy underline-offset-4 hover:text-blue-accent hover:underline";

export function ContactDetails({ className = "", title = "Atendimento" }: { className?: string; title?: string }) {
  const a = company.address;
  return (
    <section aria-label={title} className={`card p-5 ${className}`}>
      <h2 className="border-b border-concrete-100 pb-3 text-title text-navy">{title}</h2>
      <ul>
        <Row icon={<PinIcon className="size-5" />} label="Endereço">
          <a href={mapsUrl()} target="_blank" rel="noopener" className={link}>
            {formatAddress()}
          </a>
          {a.postalCode && <span className="block text-body-sm text-slate-text">CEP {a.postalCode}</span>}
        </Row>
        <Row icon={<WhatsAppIcon className="size-5" />} label="WhatsApp e celular">
          <a href={`tel:${company.phone.e164}`} className={link}>
            {company.phone.display}
          </a>
        </Row>
        {company.landline && (
          <Row icon={<PhoneIcon className="size-5" />} label="Telefone fixo">
            <a href={`tel:${company.landline.e164}`} className={link}>
              {company.landline.display}
            </a>
          </Row>
        )}
        <Row icon={<MailIcon className="size-5" />} label="E-mail">
          <a href={`mailto:${company.email}`} className={`${link} block break-all py-1`}>
            {company.email}
          </a>
          <a href={`mailto:${company.emailSite}`} className={`${link} block break-all py-1`}>
            {company.emailSite}
          </a>
        </Row>
        <Row icon={<ClockIcon className="size-5" />} label="Horário">
          {formatHours().map((h) => (
            <span key={h} className="block">
              {h}
            </span>
          ))}
        </Row>
        <Row icon={<InstagramIcon className="size-5" />} label="Instagram">
          <a href={company.social.instagram.url} target="_blank" rel="noopener" className={link}>
            {company.social.instagram.handle}
          </a>
        </Row>
      </ul>
    </section>
  );
}
