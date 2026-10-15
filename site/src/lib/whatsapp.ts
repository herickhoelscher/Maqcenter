import { company } from "./content";

export const DEFAULT_WHATSAPP_MESSAGE = "Olá! Vim pelo site e quero um orçamento.";

export function whatsappUrl(message: string = DEFAULT_WHATSAPP_MESSAGE): string {
  return `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function equipmentMessage(name: string): string {
  return `Olá! Quero um orçamento de locação: ${name}.`;
}
