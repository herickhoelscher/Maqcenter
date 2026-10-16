import Link from "next/link";
import type { ReactNode } from "react";
import { getCompany } from "@/lib/content";
import { whatsappUrl } from "@/lib/whatsapp";
import { ArrowIcon, PhoneIcon, WhatsAppIcon } from "./icons";

export async function WhatsAppButton({
  message,
  children = "Pedir orçamento no WhatsApp",
  tone = "primary",
  className = "",
}: {
  message?: string;
  children?: ReactNode;
  tone?: "primary" | "whatsapp";
  className?: string;
}) {
  const company = await getCompany();
  return (
    <a
      href={whatsappUrl(company.whatsapp, message)}
      target="_blank"
      rel="noopener"
      className={`btn ${tone === "primary" ? "btn-primary" : "btn-whatsapp"} ${className}`}
    >
      <WhatsAppIcon className="size-5" />
      {children}
      <span className="sr-only">(abre o WhatsApp)</span>
    </a>
  );
}

export async function CallButton({ tone = "light", className = "" }: { tone?: "light" | "dark"; className?: string }) {
  const company = await getCompany();
  return (
    <a href={`tel:${company.phone.e164}`} className={`btn ${tone === "light" ? "btn-secondary" : "btn-ghost-dark"} ${className}`}>
      <PhoneIcon className="size-5" />
      {company.phone.display}
    </a>
  );
}

export function TextLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={`group inline-flex items-center gap-1.5 text-btn font-bold text-blue-accent hover:underline ${className}`}>
      {children}
      <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
