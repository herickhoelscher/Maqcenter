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
      <Image
        src={src}
        alt=""
        fill
        preload={priority}
        fetchPriority={priority ? "high" : "auto"}
        loading={priority ? "eager" : "lazy"}
        // Under a dark overlay, so a lower quality is not visible.
        quality={50}
        sizes="100vw"
        className={priority ? "object-cover" : "anim-settle object-cover"}
        style={{ objectPosition: position }}
      />
      <div aria-hidden className={`absolute inset-0 ${overlay}`} />
    </>
  );
}
