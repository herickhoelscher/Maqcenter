import Link from "next/link";
import { company } from "@/lib/content";
import { whatsappUrl } from "@/lib/whatsapp";
import { ArrowIcon, PhoneIcon, WhatsAppIcon } from "./icons";

const base =
  "inline-flex min-h-12 items-center justify-center gap-2.5 rounded-md px-5 text-base font-semibold transition-colors";

export function WhatsAppButton({
  message,
  children = "Pedir orçamento no WhatsApp",
  tone = "signal",
  className = "",
}: {
  message?: string;
  children?: React.ReactNode;
  tone?: "signal" | "blue";
  className?: string;
}) {
  const tones = {
    signal: "bg-signal text-ink hover:bg-signal-deep",
    blue: "bg-blue text-white hover:bg-blue-deep",
  };
  return (
    <a href={whatsappUrl(message)} target="_blank" rel="noopener" className={`${base} ${tones[tone]} ${className}`}>
      <WhatsAppIcon />
      {children}
      <span className="sr-only">(abre o WhatsApp)</span>
    </a>
  );
}

export function CallButton({ tone = "light", className = "" }: { tone?: "light" | "dark"; className?: string }) {
  const tones = {
    light: "border-2 border-ink text-ink hover:bg-ink hover:text-white",
    dark: "border-2 border-ink-soft/60 text-white hover:border-white hover:bg-white/10",
  };
  return (
    <a href={`tel:${company.phone.e164}`} className={`${base} ${tones[tone]} ${className}`}>
      <PhoneIcon />
      Ligar {company.phone.display}
    </a>
  );
}

export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-2 font-semibold text-blue underline-offset-4 hover:underline">
      {children}
      <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
