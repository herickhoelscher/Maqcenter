import Link from "next/link";
import { WhatsAppButton } from "@/components/Buttons";

export default function NotFound() {
  return (
    <div className="container-site py-20 md:py-28">
      <p className="label-mono text-blue">Erro 404</p>
      <h1 className="font-display mt-3 text-5xl md:text-7xl">Página não encontrada</h1>
      <p className="mt-5 max-w-xl text-lg text-steel">
        O endereço pode ter mudado com o site novo. Veja os equipamentos para locação ou fale com a equipe.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/locacoes"
          className="inline-flex min-h-12 items-center justify-center rounded-md border-2 border-ink px-5 font-semibold hover:bg-ink hover:text-white"
        >
          Ver equipamentos
        </Link>
        <WhatsAppButton />
      </div>
    </div>
  );
}
