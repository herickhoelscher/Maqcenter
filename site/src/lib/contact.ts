// Shared between the form (client) and the API route (server).

export const HONEYPOT_FIELD = "website";

export const serviceOptions = [
  "Locação de equipamentos",
  "Assistência técnica",
  "Venda de máquinas e acessórios",
  "Perfuração em concreto",
  "Troca ou devolução",
  "Outro assunto",
] as const;

export type ContactInput = {
  name: string;
  phone: string;
  email: string;
  service: string;
  message: string;
};

export type FieldErrors = Partial<Record<keyof ContactInput, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(raw: Record<string, unknown>): { data: ContactInput; errors: FieldErrors } {
  const str = (k: string, max: number) => String(raw[k] ?? "").trim().slice(0, max);
  const data: ContactInput = {
    name: str("name", 120),
    phone: str("phone", 30),
    email: str("email", 160),
    service: str("service", 60),
    message: str("message", 3000),
  };
  const errors: FieldErrors = {};
  if (data.name.length < 2) errors.name = "Informe seu nome.";
  if (data.phone.replace(/\D/g, "").length < 10) errors.phone = "Informe um telefone com DDD.";
  if (data.email && !EMAIL_RE.test(data.email)) errors.email = "Confira o e-mail ou deixe em branco.";
  if (!serviceOptions.includes(data.service as (typeof serviceOptions)[number])) errors.service = "Escolha um assunto.";
  if (data.message.length < 5) errors.message = "Escreva o que você precisa.";
  return { data, errors };
}

// ?assunto= values used by links (e.g. "Solicitar devolução" in the footer).
export const subjectParams: Record<string, (typeof serviceOptions)[number]> = {
  locacao: "Locação de equipamentos",
  assistencia: "Assistência técnica",
  venda: "Venda de máquinas e acessórios",
  perfuracao: "Perfuração em concreto",
  "troca-devolucao": "Troca ou devolução",
};
