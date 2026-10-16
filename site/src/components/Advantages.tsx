import type { ReactNode } from "react";
import { DrillIcon, MedalIcon, VerifiedIcon, WrenchIcon } from "./icons";

// Each point comes from the company's own material (see content/SOURCES.md).
const items: { icon: ReactNode; tone: string; title: string; text: string }[] = [
  {
    icon: <MedalIcon className="size-6" />,
    tone: "bg-navy text-amber",
    title: "Mais de 35 anos de mercado",
    text: "Experiência, estrutura e compromisso ao lado de quem constrói, reforma e trabalha com obra.",
  },
  {
    icon: <WrenchIcon className="size-6" />,
    tone: "bg-amber text-charcoal",
    title: "Assistência técnica própria",
    text: "Avaliação de cabo, chave, rolamentos, escovas e parte elétrica, com diagnóstico antes do reparo.",
  },
  {
    icon: <DrillIcon className="size-6" />,
    tone: "bg-navy text-amber",
    title: "Perfuração no local da obra",
    text: "Perfuratriz diamantada, com a estrutura e o profissional indo até o local do serviço.",
  },
  {
    icon: <VerifiedIcon className="size-6" />,
    tone: "bg-blue-accent text-white",
    title: "Marcas que você conhece",
    text: "Bosch, DeWalt, Makita, Milwaukee, Black+Decker, Mirka, Skil e Stanley.",
  },
];

export function Advantages({ title = "Por que escolher a Maqcenter" }: { title?: string }) {
  return (
    <section aria-labelledby="vantagens" className="bg-surface-mid py-16">
      <div className="container-site space-y-12">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <span className="badge bg-blue-accent/10 text-blue-accent">Confiança na obra</span>
          <h2 id="vantagens" className="text-headline-m text-navy md:text-headline">
            {title}
          </h2>
        </div>
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {items.map((a) => (
            <li key={a.title} className="card space-y-4 p-6 transition-shadow hover:shadow-level2">
              <span className={`grid size-12 place-items-center rounded-[var(--radius-card)] ${a.tone}`}>{a.icon}</span>
              <h3 className="text-title text-navy">{a.title}</h3>
              <p className="text-body-sm text-slate-text">{a.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
