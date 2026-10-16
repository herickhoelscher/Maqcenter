import type { ReactNode } from "react";
import { company } from "@/lib/content";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";
import { ClockIcon } from "./icons";

// Breadcrumb strip + title command bar, as in the catalog design.
export function PageHeader({
  badge,
  badgeNote,
  title,
  lead,
  crumbs,
  actions,
  children,
}: {
  badge?: string;
  badgeNote?: string;
  title: string;
  lead?: string;
  crumbs: Crumb[];
  actions?: ReactNode;
  children?: ReactNode;
}) {
  const hours = company.hours[0];
  return (
    <>
      <section className="bg-surface-low py-5">
        <div className="container-site flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <Breadcrumbs items={crumbs} />
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-spec text-success-strong">
              <span aria-hidden className="size-2 rounded-full bg-success" />
              Há mais de 35 anos ao lado de quem constrói
            </span>
            {hours && (
              <span className="hidden items-center gap-1.5 text-body-sm text-slate-text lg:flex">
                <ClockIcon className="size-4 text-amber" />
                {hours.days}, {hours.ranges[0][0]} às {hours.ranges[hours.ranges.length - 1][1]}
              </span>
            )}
          </div>
        </div>
      </section>
      <section className="bg-white py-8 shadow-sm">
        <div className="container-site">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl space-y-2">
              {badge && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge bg-navy text-amber">{badge}</span>
                  {badgeNote && <span className="text-body-sm text-outline">{badgeNote}</span>}
                </div>
              )}
              <h1 className="text-headline-m tracking-tight text-navy md:text-headline">{title}</h1>
              {lead && <p className="text-body-lg text-slate-text">{lead}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
          </div>
          {children}
        </div>
      </section>
    </>
  );
}
