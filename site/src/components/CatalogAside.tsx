import Link from "next/link";
import { whatsappUrl } from "@/lib/whatsapp";
import { SupportIcon, VerifiedIcon, WhatsAppIcon } from "./icons";

export function CatalogAside() {
  return (
    <>
      <div className="on-dark relative space-y-4 overflow-hidden rounded-[var(--radius-card)] bg-navy p-5 text-white shadow-sm">
        <span className="grid size-10 place-items-center rounded-[var(--radius-control)] bg-amber text-charcoal">
          <SupportIcon className="size-6" />
        </span>
        <div>
          <h2 className="text-title">Não sabe qual máquina usar?</h2>
          <p className="mt-1 text-body-sm text-on-dark">Conte o serviço que vai fazer e a equipe indica o equipamento.</p>
        </div>
        <a
          href={whatsappUrl("Olá! Preciso de ajuda para escolher o equipamento certo para minha obra.")}
          target="_blank"
          rel="noopener"
          className="btn btn-primary w-full"
        >
          <WhatsAppIcon className="size-5" />
          Falar com a equipe
          <span className="sr-only">(abre o WhatsApp)</span>
        </a>
      </div>
      <div className="flex items-start gap-3 rounded-[var(--radius-card)] bg-concrete-100 p-4 text-slate-text">
        <VerifiedIcon className="size-6 shrink-0 text-success-strong" />
        <div>
          <h2 className="text-spec font-bold text-navy">Assistência técnica própria</h2>
          <p className="mt-0.5 text-body-sm">
            Avaliação e reparo de ferramentas elétricas.{" "}
            <Link href="/assistencia-tecnica" className="font-semibold text-blue-accent underline">
              Saiba mais
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
