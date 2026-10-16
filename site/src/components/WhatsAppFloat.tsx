import { getCompany } from "@/lib/content";
import { whatsappUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "./icons";

export async function WhatsAppFloat() {
  const company = await getCompany();
  return (
    <a
      href={whatsappUrl(company.whatsapp)}
      target="_blank"
      rel="noopener"
      aria-label="Conversar com a MAQCENTER no WhatsApp"
      className="anim-pulse fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 grid size-14 place-items-center rounded-full bg-success-strong text-white shadow-level3 transition-transform hover:scale-105 md:right-6 md:bottom-6"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
