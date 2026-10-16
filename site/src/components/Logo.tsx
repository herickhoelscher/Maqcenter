import Image from "next/image";
import Link from "next/link";
import { company } from "@/lib/content";

export function Logo({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5">
      <Image
        src="/images/logo-mark.webp"
        alt=""
        width={80}
        height={80}
        loading={tone === "light" ? "eager" : "lazy"}
        className="size-10 rounded-[var(--radius-control)]"
      />
      <span className="flex flex-col">
        <span className={`text-headline-sm leading-none font-bold tracking-tight ${tone === "light" ? "text-navy" : "text-white"}`}>
          {company.name}
        </span>
        <span className={`text-badge tracking-widest uppercase ${tone === "light" ? "text-outline" : "text-on-dark"}`}>
          Ferramentas elétricas
        </span>
      </span>
      <span className="sr-only">, página inicial</span>
    </Link>
  );
}
