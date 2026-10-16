const tones: Record<string, string> = {
  pending: "bg-amber/20 text-[#8a5300]",
  paid: "bg-success/15 text-success-strong",
  fulfilled: "bg-blue-accent/10 text-blue-accent",
  canceled: "bg-crimson/10 text-crimson",
};

export function StatusBadge({ status, label }: { status: string; label: string }) {
  return <span className={`badge normal-case tracking-normal ${tones[status] ?? "bg-concrete-100 text-slate-text"}`}>{label}</span>;
}
