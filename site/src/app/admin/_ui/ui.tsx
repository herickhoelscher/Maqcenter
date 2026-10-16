import Link from "next/link";
import type { ReactNode } from "react";

export function AdminPage({
  title,
  description,
  actions,
  back,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  back?: { href: string; label: string };
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          {back && (
            <Link href={back.href} className="text-body-sm font-semibold text-blue-accent hover:underline">
              ← {back.label}
            </Link>
          )}
          <h1 className="text-headline-m text-navy">{title}</h1>
          {description && <p className="max-w-2xl text-body text-slate-text">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

export function Panel({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`card p-5 md:p-6 ${className}`}>
      {title && <h2 className="mb-4 text-title text-navy">{title}</h2>}
      {children}
    </section>
  );
}

export function Table({ head, children, empty }: { head: string[]; children: ReactNode; empty?: string }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-body">
        <thead className="bg-concrete-50 text-body-sm text-outline">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="px-4 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-concrete-100">{children}</tbody>
      </table>
      {empty && <p className="px-4 py-8 text-center text-body text-outline">{empty}</p>}
    </div>
  );
}

export function Pill({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "ok" | "warn" | "bad" | "info" }) {
  const tones = {
    muted: "bg-concrete-100 text-slate-text",
    ok: "bg-success/15 text-success-strong",
    warn: "bg-amber/20 text-[#8a5300]",
    bad: "bg-crimson/10 text-crimson",
    info: "bg-blue-accent/10 text-blue-accent",
  };
  return <span className={`badge normal-case tracking-normal ${tones[tone]}`}>{children}</span>;
}

export function Select({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label htmlFor={`f-${name}`} className="text-body font-semibold text-navy">
        {label}
      </label>
      <select id={`f-${name}`} name={name} defaultValue={defaultValue} className="field mt-1.5">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
