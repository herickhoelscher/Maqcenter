import type { ReactNode } from "react";

// Payment methods and trust seals drawn in code (no copied images), sized
// for the dark footer. Brand marks are simplified, recognisable versions.

function Card({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <li title={label} className={`grid h-7 w-11 place-items-center overflow-hidden rounded-[5px] ${className}`}>
      <span className="sr-only">{label}</span>
      <span aria-hidden className="flex items-center">
        {children}
      </span>
    </li>
  );
}

export function PaymentMethods() {
  return (
    <ul className="flex flex-wrap items-center gap-2">
      <Card label="Visa" className="bg-[#1a1f71]">
        <span className="text-[11px] font-extrabold tracking-tight text-white italic">VISA</span>
      </Card>
      <Card label="Mastercard" className="bg-[#252525]">
        <svg viewBox="0 0 32 20" className="h-4 w-7">
          <circle cx="12" cy="10" r="8" fill="#eb001b" />
          <circle cx="20" cy="10" r="8" fill="#f79e1b" />
          <path d="M16 3.8a8 8 0 0 1 0 12.4 8 8 0 0 1 0-12.4z" fill="#ff5f00" />
        </svg>
      </Card>
      <Card label="Elo" className="bg-black">
        <svg viewBox="0 0 40 20" className="h-4 w-9">
          <circle cx="6" cy="6" r="2.4" fill="#ffcb05" />
          <circle cx="6" cy="10" r="2.4" fill="#00a4e0" />
          <circle cx="6" cy="14" r="2.4" fill="#ef4123" />
          <text x="11" y="14.5" fill="#fff" fontSize="12" fontWeight="700" fontFamily="Arial, sans-serif">
            elo
          </text>
        </svg>
      </Card>
      <Card label="Hiper" className="bg-[#f37421]">
        <span className="text-[10px] font-bold text-white">Hiper</span>
      </Card>
      <Card label="Hipercard" className="bg-[#b3131b]">
        <span className="text-[8px] font-bold text-white italic">Hipercard</span>
      </Card>
      <Card label="American Express" className="bg-[#2e77bc]">
        <span className="text-[9px] font-extrabold tracking-tight text-white">AMEX</span>
      </Card>
      <Card label="Diners Club" className="bg-[#0079be]">
        <svg viewBox="0 0 20 20" className="size-4">
          <circle cx="10" cy="10" r="8.5" fill="none" stroke="#fff" strokeWidth="1.6" />
          <path d="M8 5.5v9a4.6 4.6 0 0 1 0-9zM12 5.5a4.6 4.6 0 0 1 0 9z" fill="#fff" />
        </svg>
      </Card>
      <Card label="Boleto" className="bg-white/10 ring-1 ring-white/25">
        <svg viewBox="0 0 24 16" className="h-3.5 w-6 text-white" fill="currentColor">
          {[0, 2.5, 4, 6.5, 9, 10.5, 13, 15.5, 17, 19.5, 22].map((x, i) => (
            <rect key={x} x={x} y="0" width={i % 3 === 0 ? 1.6 : 0.9} height="16" />
          ))}
        </svg>
      </Card>
      <Card label="PIX" className="bg-white/10 ring-1 ring-white/25">
        <svg viewBox="0 0 24 24" className="size-4">
          <path
            fill="#32bcad"
            d="M18.4 17.7a3 3 0 0 1-2.1-.9l-3-3a.6.6 0 0 0-.8 0l-3 3a3 3 0 0 1-2.2.9h-.6l3.8 3.8a3 3 0 0 0 4.3 0l3.8-3.8zM7.3 6.3a3 3 0 0 1 2.2.9l3 3c.2.2.6.2.8 0l3-3a3 3 0 0 1 2.1-.9h.4l-3.8-3.8a3 3 0 0 0-4.3 0L6.9 6.3zm13.9 3.5-2.3-2.3h-.5a2 2 0 0 0-1.5.6l-3 3a1.5 1.5 0 0 1-2.1 0l-3-3a2 2 0 0 0-1.5-.6H5.1L2.8 9.8a3 3 0 0 0 0 4.3l2.3 2.3h2.2a2 2 0 0 0 1.5-.6l3-3a1.5 1.5 0 0 1 2.1 0l3 3a2 2 0 0 0 1.5.6h.5l2.3-2.3a3 3 0 0 0 0-4.3z"
          />
        </svg>
        <span className="ml-0.5 text-[9px] font-bold text-white">pix</span>
      </Card>
    </ul>
  );
}

function Seal({ icon, title, text, href }: { icon: ReactNode; title: string; text: string; href?: string }) {
  const body = (
    <>
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-success">{icon}</span>
      <span className="leading-tight">
        <span className="block text-body-sm font-bold text-white">{title}</span>
        <span className="block text-[11px] text-on-dark">{text}</span>
      </span>
    </>
  );
  return (
    <li>
      {href ? (
        <a href={href} target="_blank" rel="noopener" className="flex items-center gap-2.5 rounded-[var(--radius-control)] hover:bg-white/5">
          {body}
        </a>
      ) : (
        <span className="flex items-center gap-2.5">{body}</span>
      )}
    </li>
  );
}

const icon = (d: string) => (
  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
);

export function TrustSeals({ host }: { host: string }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <Seal
        icon={icon("M6 10V7a6 6 0 0 1 12 0v3M5 10h14v11H5z M12 14v3")}
        title="Compra segura"
        text="Certificado SSL"
        href={`https://www.sslshopper.com/ssl-checker.html#hostname=${host}`}
      />
      <Seal
        icon={icon("M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z M8.5 12l2.5 2.5 4.5-5")}
        title="Site seguro"
        text="Google Safe Browsing"
        href={`https://transparencyreport.google.com/safe-browsing/search?url=${host}&hl=pt_BR`}
      />
      <Seal icon={icon("M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z M9 12h6")} title="Compra garantida" text="Pagamento via Mercado Pago" />
      <Seal icon={icon("M21 12a9 9 0 0 1-15.5 6.2M3 12a9 9 0 0 1 15.5-6.2M18 2v4h-4M6 22v-4h4")} title="Troca e devolução" text="grátis" />
    </ul>
  );
}
