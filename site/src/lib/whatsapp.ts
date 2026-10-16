export const DEFAULT_WHATSAPP_MESSAGE = "Olá! Vim pelo site e quero um orçamento.";

/** `number` is the company WhatsApp in international digits (5545...). */
export function whatsappUrl(number: string, message: string = DEFAULT_WHATSAPP_MESSAGE): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function equipmentMessage(name: string): string {
  return `Olá! Quero um orçamento de locação: ${name}.`;
}

export function productMessage(name: string): string {
  return `Olá! Quero um orçamento de compra: ${name}.`;
}
