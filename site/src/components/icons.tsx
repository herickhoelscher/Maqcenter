type IconProps = { className?: string };

const base = { "aria-hidden": true, focusable: false } as const;

export function WhatsAppIcon({ className = "size-5" }: IconProps) {
  return (
    <svg {...base} className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.27.49 1.7.63.72.23 1.37.2 1.88.12.58-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.2-3.58.93.96-3.49-.23-.36a9.43 9.43 0 0 1-1.45-5.03c0-5.22 4.25-9.47 9.48-9.47a9.4 9.4 0 0 1 6.7 2.78 9.4 9.4 0 0 1 2.77 6.7c0 5.22-4.25 9.46-9.47 9.46m8.06-17.53A11.33 11.33 0 0 0 12.05.63C5.77.63.66 5.73.66 12.01c0 2 .52 3.96 1.52 5.69L.57 23.6l6.04-1.58a11.4 11.4 0 0 0 5.44 1.38h.01c6.28 0 11.39-5.1 11.39-11.38 0-3.04-1.18-5.9-3.34-8.05" />
    </svg>
  );
}

export function PhoneIcon({ className = "size-5" }: IconProps) {
  return (
    <svg {...base} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function ArrowIcon({ className = "size-5" }: IconProps) {
  return (
    <svg {...base} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="square">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function MenuIcon({ className = "size-6" }: IconProps) {
  return (
    <svg {...base} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="square">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

export function CloseIcon({ className = "size-6" }: IconProps) {
  return (
    <svg {...base} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="square">
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  );
}

export function PinIcon({ className = "size-5" }: IconProps) {
  return (
    <svg {...base} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s7-6.1 7-12a7 7 0 0 0-14 0c0 5.9 7 12 7 12z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

type StrokeIconProps = IconProps & { d: string | string[] };

function Stroke({ className = "size-5", d }: StrokeIconProps) {
  const paths = Array.isArray(d) ? d : [d];
  return (
    <svg {...base} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {paths.map((p) => (
        <path key={p} d={p} />
      ))}
    </svg>
  );
}

export const SearchIcon = (p: IconProps) => <Stroke {...p} d={["M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z", "M21 21l-4.35-4.35"]} />;
export const MailIcon = (p: IconProps) => <Stroke {...p} d={["M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z", "M22 6l-10 7L2 6"]} />;
export const ClockIcon = (p: IconProps) => <Stroke {...p} d={["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M12 6v6l4 2"]} />;
export const HomeIcon = (p: IconProps) => <Stroke {...p} d={["M3 10.5L12 3l9 7.5", "M5 9.5V21h14V9.5"]} />;
export const ChevronRightIcon = (p: IconProps) => <Stroke {...p} d="M9 6l6 6-6 6" />;
export const ListIcon = (p: IconProps) => <Stroke {...p} d={["M9 6h12", "M9 12h12", "M9 18h12", "M4 6h.01", "M4 12h.01", "M4 18h.01"]} />;
export const PlusIcon = (p: IconProps) => <Stroke {...p} d={["M12 5v14", "M5 12h14"]} />;
export const MinusIcon = (p: IconProps) => <Stroke {...p} d="M5 12h14" />;
export const CheckIcon = (p: IconProps) => <Stroke {...p} d="M5 13l4 4L19 7" />;
export const TrashIcon = (p: IconProps) => <Stroke {...p} d={["M3 6h18", "M8 6V4h8v2", "M19 6l-1 14H6L5 6"]} />;
export const TuneIcon = (p: IconProps) => <Stroke {...p} d={["M4 6h10", "M18 6h2", "M16 4v4", "M4 12h4", "M12 12h8", "M10 10v4", "M4 18h12", "M20 18h0", "M18 16v4"]} />;
export const SupportIcon = (p: IconProps) => <Stroke {...p} d={["M3 13v-1a9 9 0 0 1 18 0v1", "M21 14v2a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2z", "M3 14v2a2 2 0 0 0 2 2h1v-6H5a2 2 0 0 0-2 2z", "M18 18c0 2-2 3-6 3"]} />;
export const VerifiedIcon = (p: IconProps) => <Stroke {...p} d={["M12 2l2.4 1.8 3-.2.9 2.9 2.5 1.7-.9 2.8.9 2.8-2.5 1.7-.9 2.9-3-.2L12 22l-2.4-1.8-3 .2-.9-2.9-2.5-1.7.9-2.8-.9-2.8 2.5-1.7.9-2.9 3 .2z", "M8.5 12l2.5 2.5 4.5-5"]} />;
export const WrenchIcon = (p: IconProps) => <Stroke {...p} d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z" />;
export const DrillIcon = (p: IconProps) => <Stroke {...p} d={["M3 8h11v6H3z", "M14 10h4", "M18 9v4", "M18 11h3", "M6 14v6h4l1-6"]} />;
export const CalendarIcon = (p: IconProps) => <Stroke {...p} d={["M3 5h18v16H3z", "M16 3v4", "M8 3v4", "M3 10h18"]} />;
export const MedalIcon = (p: IconProps) => <Stroke {...p} d={["M12 22a7 7 0 1 0 0-14 7 7 0 0 0 0 14z", "M8.2 9.3L5 2h4l3 6", "M15.8 9.3L19 2h-4l-3 6", "M12 12.5l1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.4z"]} />;
export const InstagramIcon = (p: IconProps) => <Stroke {...p} d={["M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z", "M16 11.4A4 4 0 1 1 12.6 8a4 4 0 0 1 3.4 3.4z", "M17.5 6.5h.01"]} />;
export const FacebookIcon = (p: IconProps) => <Stroke {...p} d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />;
