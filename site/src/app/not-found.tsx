import Link from "next/link";
import { WhatsAppButton } from "@/components/Buttons";
import { SiteChrome } from "@/components/SiteChrome";

export default function NotFound() {
  return (
    <SiteChrome>
    <div className="container-site py-20 md:py-28">
      <div className="card max-w-2xl space-y-4 p-8">
        <span className="badge bg-navy text-amber">Erro 404</span>
        <h1 className="text-headline-m text-navy md:text-headline">Página não encontrada</h1>
        <p className="text-body-lg text-slate-text">
          O endereço pode ter mudado com o site novo. Veja os equipamentos para locação ou fale com a equipe.
        </p>
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <Link href="/locacoes" className="btn btn-secondary">
            Ver equipamentos
          </Link>
          <WhatsAppButton />
        </div>
      </div>
    </div>
    </SiteChrome>
  );
}
