import type { ReactNode } from "react";

// Riveted machine nameplate. The header strip carries a short mono label,
// like the maker line stamped on a real plate.
export function Plate({
  label,
  aside,
  children,
  className = "",
  as: Tag = "div",
}: {
  label: string;
  aside?: string;
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "section" | "aside";
}) {
  return (
    <Tag className={`plate flex flex-col p-1.5 ${className}`}>
      <Rivets />
      <div className="label-mono flex items-center justify-between gap-3 rounded-sm bg-ink px-3 py-1.5 text-[0.6875rem] text-ink-soft">
        <span className="truncate">{label}</span>
        {aside && <span className="shrink-0 text-signal">{aside}</span>}
      </div>
      <div className="flex flex-1 flex-col">{children}</div>
    </Tag>
  );
}

function Rivets() {
  const rivet = "absolute size-1.5 rounded-full bg-line ring-1 ring-steel/40";
  return (
    <>
      <span aria-hidden className={`${rivet} bottom-1.5 left-1.5`} />
      <span aria-hidden className={`${rivet} right-1.5 bottom-1.5`} />
    </>
  );
}

export function PlateRow({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-3 border-b border-dashed border-line px-3 py-2.5 last:border-b-0 sm:grid-cols-[10rem_1fr]">
      <dt className="label-mono pt-0.5 text-steel">{name}</dt>
      <dd className="text-[0.9375rem]">{children}</dd>
    </div>
  );
}
