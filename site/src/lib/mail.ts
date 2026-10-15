import { company } from "./content";
import type { ContactInput } from "./contact";

export class MailNotConfiguredError extends Error {}

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

// Sends the contact form through the Resend REST API (no SDK needed).
export async function sendContactEmail(input: ContactInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !from) throw new MailNotConfiguredError("RESEND_API_KEY or CONTACT_FROM_EMAIL is missing");

  const to = process.env.CONTACT_TO_EMAIL || company.email;
  const rows: [string, string][] = [
    ["Nome", input.name],
    ["Telefone", input.phone],
    ["E-mail", input.email || "-"],
    ["Assunto", input.service],
  ];
  const text = [...rows.map(([k, v]) => `${k}: ${v}`), "", input.message].join("\n");
  const html = `${rows.map(([k, v]) => `<p><strong>${k}:</strong> ${escape(v)}</p>`).join("")}<p>${escape(input.message).replace(/\n/g, "<br>")}</p>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `Site: ${input.service} - ${input.name}`,
      text,
      html,
      ...(input.email && { reply_to: input.email }),
    }),
  });
  if (!res.ok) {
    throw new Error(`Resend responded ${res.status}: ${await res.text()}`);
  }
}
