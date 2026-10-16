import Image from "next/image";

// Decorative photo behind dark sections, under a navy overlay that keeps
// white text at AA contrast. The parent must be `relative`.
export function Backdrop({
  src,
  priority = false,
  position = "center",
  overlay = "bg-navy-deep/85",
}: {
  src: string;
  priority?: boolean;
  position?: string;
  overlay?: string;
}) {
  return (
    <>
      <Image src={src} alt="" fill priority={priority} sizes="100vw" className="object-cover" style={{ objectPosition: position }} />
      <div aria-hidden className={`absolute inset-0 ${overlay}`} />
    </>
  );
}
