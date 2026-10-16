"use client";

import { startTransition, useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";

export type FormState = { ok?: boolean; message?: string; error?: string; fieldErrors?: Record<string, string> } | undefined;

export type FormAction = (state: FormState, formData: FormData) => Promise<FormState>;

/**
 * Form bound to a Server Action with useActionState. Shows the action's
 * success or error message and passes field errors down through
 * `children(state)` when a render function is given.
 */
export function ActionForm({
  action,
  children,
  submitLabel = "Salvar",
  pendingLabel = "Salvando...",
  className = "",
  encType,
  footer,
}: {
  action: FormAction;
  children: ReactNode | ((state: FormState) => ReactNode);
  submitLabel?: string;
  pendingLabel?: string;
  className?: string;
  encType?: "multipart/form-data";
  footer?: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    // Submitting through onSubmit (instead of the action prop) keeps what was
    // typed when the action returns an error; React resets action forms.
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
      className={`space-y-5 ${className}`}
      encType={encType}
      noValidate
    >
      {typeof children === "function" ? children(state) : children}
      <div className="flex flex-wrap items-center gap-4 pt-1">
        <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-70">
          {pending ? pendingLabel : submitLabel}
        </button>
        {footer}
        <p role="status" aria-live="polite" className="text-body">
          {state?.error && <span className="font-semibold text-crimson">{state.error}</span>}
          {state?.ok && state.message && <span className="font-semibold text-success-strong">{state.message}</span>}
        </p>
      </div>
    </form>
  );
}

export function SubmitButton({ label, pendingLabel, className = "btn btn-primary" }: { label: string; pendingLabel?: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${className} disabled:opacity-70`}>
      {pending ? (pendingLabel ?? "Enviando...") : label}
    </button>
  );
}

export function Field({
  label,
  name,
  error,
  hint,
  className = "",
  children,
  ...input
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  className?: string;
  children?: ReactNode;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name">) {
  const id = `f-${name}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="text-body font-semibold text-navy">
        {label}
      </label>
      {children ?? (
        <input
          id={id}
          name={name}
          className="field mt-1.5"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          {...input}
        />
      )}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-body-sm text-outline">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-body-sm font-semibold text-crimson">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextArea({
  label,
  name,
  error,
  hint,
  className = "",
  ...rest
}: { label: string; name: string; error?: string; hint?: string; className?: string } & Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "name"
>) {
  const id = `f-${name}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="text-body font-semibold text-navy">
        {label}
      </label>
      <textarea id={id} name={name} className="field mt-1.5" aria-invalid={error ? true : undefined} rows={4} {...rest} />
      {hint && !error && <p className="mt-1 text-body-sm text-outline">{hint}</p>}
      {error && <p className="mt-1.5 text-body-sm font-semibold text-crimson">{error}</p>}
    </div>
  );
}

export function Checkbox({ label, name, defaultChecked, hint }: { label: string; name: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex items-start gap-3 text-body text-charcoal">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-1 size-4 accent-blue-accent" />
      <span>
        <span className="font-semibold text-navy">{label}</span>
        {hint && <span className="block text-body-sm text-outline">{hint}</span>}
      </span>
    </label>
  );
}
