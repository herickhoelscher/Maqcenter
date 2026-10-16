import { company, formatAddress, formatHours } from "@/lib/content";
import { Plate, PlateRow } from "./Plate";

export function mapsUrl() {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${company.name}, ${formatAddress()}`)}`;
}

export function ContactDetails({ className = "" }: { className?: string }) {
  return (
    <Plate label={company.name} aside="Atendimento" className={className}>
      <dl className="mt-1">
        <PlateRow name="Endereço">
          <a href={mapsUrl()} target="_blank" rel="noopener" className="underline underline-offset-4 hover:text-blue">
            {formatAddress()}
          </a>
        </PlateRow>
        <PlateRow name="WhatsApp">
          <a href={`tel:${company.phone.e164}`} className="underline underline-offset-4 hover:text-blue">
            {company.phone.display}
          </a>{" "}
          <span className="text-steel">(também ligação)</span>
        </PlateRow>
        <PlateRow name="Telefone fixo">
          <a href={`tel:${company.landline.e164}`} className="underline underline-offset-4 hover:text-blue">
            {company.landline.display}
          </a>
        </PlateRow>
        <PlateRow name="E-mail">
          <a href={`mailto:${company.email}`} className="break-all underline underline-offset-4 hover:text-blue">
            {company.email}
          </a>
        </PlateRow>
        <PlateRow name="Horário">
          {formatHours().map((h) => (
            <span key={h} className="block">
              {h}
            </span>
          ))}
        </PlateRow>
        <PlateRow name="Instagram">
          <a href={company.social.instagram.url} target="_blank" rel="noopener" className="underline underline-offset-4 hover:text-blue">
            {company.social.instagram.handle}
          </a>
        </PlateRow>
      </dl>
    </Plate>
  );
}
