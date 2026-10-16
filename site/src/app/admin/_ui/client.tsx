"use client";

import Image from "next/image";
import { useState, useTransition } from "react";

/** Button that asks for confirmation before calling a Server Action. */
export function DeleteButton({
  action,
  label = "Excluir",
  confirmText = "Tem certeza? Esta ação não pode ser desfeita.",
  className = "btn btn-muted min-h-0 px-3 py-1.5 text-crimson",
}: {
  action: () => Promise<unknown>;
  label?: string;
  confirmText?: string;
  className?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm(confirmText)) start(async () => void (await action()));
      }}
      className={`${className} disabled:opacity-60`}
    >
      {pending ? "..." : label}
    </button>
  );
}

/** Button that calls a Server Action right away (status changes etc). */
export function ActionButton({ action, children, className = "btn btn-muted min-h-0 px-3 py-1.5" }: { action: () => Promise<unknown>; children: React.ReactNode; className?: string }) {
  const [pending, start] = useTransition();
  return (
    <button type="button" disabled={pending} onClick={() => start(async () => void (await action()))} className={`${className} disabled:opacity-60`}>
      {children}
    </button>
  );
}

/** File input with a preview of the chosen (or current) image. */
export function ImageInput({
  name,
  label,
  current,
  multiple = false,
  hint = "JPG, PNG ou WebP até 10 MB. É convertida para WebP automaticamente.",
}: {
  name: string;
  label: string;
  current?: string | null;
  multiple?: boolean;
  hint?: string;
}) {
  const [previews, setPreviews] = useState<string[]>([]);
  const shown = previews.length ? previews : current ? [current] : [];
  return (
    <div>
      <label htmlFor={`f-${name}`} className="text-body font-semibold text-navy">
        {label}
      </label>
      {shown.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {shown.map((src) => (
            <div key={src} className="grid size-24 place-items-center overflow-hidden rounded-[var(--radius-control)] border border-concrete-200 bg-concrete-50">
              {src.startsWith("blob:") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt="" className="max-h-full max-w-full object-contain" />
              ) : (
                <Image src={src} alt="" width={96} height={96} className="max-h-full max-w-full object-contain" />
              )}
            </div>
          ))}
        </div>
      )}
      <input
        id={`f-${name}`}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple={multiple}
        onChange={(e) => setPreviews([...(e.target.files ?? [])].map((f) => URL.createObjectURL(f)))}
        className="mt-2 block w-full text-body-sm file:mr-3 file:rounded-[var(--radius-control)] file:border-0 file:bg-concrete-100 file:px-4 file:py-2 file:font-semibold file:text-navy hover:file:bg-concrete-200"
      />
      <p className="mt-1 text-body-sm text-outline">{hint}</p>
    </div>
  );
}
