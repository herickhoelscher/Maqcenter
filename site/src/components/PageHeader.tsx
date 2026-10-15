import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";

export function PageHeader({
  eyebrow,
  title,
  lead,
  crumbs,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  crumbs: Crumb[];
  children?: ReactNode;
}) {
  return (
    <div className="on-dark bg-ink text-white">
      <div className="container-site pt-6 pb-12 md:pb-16">
        <Breadcrumbs items={crumbs} />
        {eyebrow && <p className="label-mono mt-8 text-signal">{eyebrow}</p>}
        <h1 className={`font-display max-w-4xl text-[2.75rem] sm:text-6xl lg:text-7xl ${eyebrow ? "mt-3" : "mt-8"}`}>{title}</h1>
        {lead && <p className="mt-5 max-w-2xl text-lg text-ink-soft">{lead}</p>}
        {children}
      </div>
    </div>
  );
}
