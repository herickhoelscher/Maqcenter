"use server";

import { updateTag } from "next/cache";
import type { FormState } from "@/components/forms/Form";
import { requireAdmin } from "@/lib/auth";
import { CONTENT_TAG } from "@/lib/content";
import { db } from "@/lib/db";
import { pickedFile, saveImage, UploadError } from "@/lib/storage";
import { isEmail, onlyDigits } from "@/lib/validators";

const text = (fd: FormData, key: string, max = 5000) => String(fd.get(key) ?? "").trim().slice(0, max);
const orNull = (v: string) => v || null;

const DAY_CODES = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

/** "07:30-12:00, 13:30-18:00" -> [["07:30","12:00"],["13:30","18:00"]] */
function parseRanges(value: string): [string, string][] | null {
  if (!value.trim()) return [];
  const ranges = value.split(",").map((r) => r.trim().split("-").map((t) => t.trim()));
  const ok = ranges.every((r) => r.length === 2 && r.every((t) => /^\d{2}:\d{2}$/.test(t)));
  return ok ? (ranges as [string, string][]) : null;
}

/* ----------------------------------------------------------------- Company */

export async function saveCompany(_state: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const email = text(fd, "email", 160);
  if (!isEmail(email)) return { error: "E-mail de pedidos inválido." };
  const whatsapp = onlyDigits(text(fd, "whatsapp", 20));
  if (whatsapp.length < 12) return { error: "WhatsApp deve ter DDI + DDD + número, ex.: 5545998052928." };

  const hours = [];
  for (const row of [1, 2]) {
    const days = text(fd, `hoursDays${row}`, 60);
    if (!days) continue;
    const ranges = parseRanges(text(fd, `hoursRanges${row}`, 80));
    if (!ranges) return { error: `Horário ${row}: use o formato 07:30-12:00, 13:30-18:00.` };
    const dayCodes = DAY_CODES.filter((d) => fd.get(`hoursCode${row}-${d}`) === "on");
    hours.push({ days, dayCodes, ranges });
  }

  const file = pickedFile(fd.get("aboutImage"));
  let aboutImage = null;
  if (file) {
    try {
      aboutImage = await saveImage(file, "empresa");
    } catch (err) {
      return { error: err instanceof UploadError ? err.message : "Não foi possível salvar a imagem." };
    }
  }

  const phoneDisplay = text(fd, "phoneDisplay", 30);
  const landlineDisplay = text(fd, "landlineDisplay", 30);
  await db.company.update({
    where: { id: 1 },
    data: {
      name: text(fd, "name", 80) || "MAQCENTER",
      tagline: text(fd, "tagline", 160),
      slogan: orNull(text(fd, "slogan", 160)),
      legalName: orNull(text(fd, "legalName", 160)),
      cnpj: orNull(text(fd, "cnpj", 30)),
      phoneDisplay,
      phoneE164: `+${onlyDigits(phoneDisplay).length === 11 ? "55" : ""}${onlyDigits(phoneDisplay)}`,
      whatsapp,
      landlineDisplay: orNull(landlineDisplay),
      landlineE164: landlineDisplay ? `+55${onlyDigits(landlineDisplay)}` : null,
      email,
      emailSite: orNull(text(fd, "emailSite", 160)),
      street: text(fd, "street", 160),
      district: text(fd, "district", 80),
      city: text(fd, "city", 80),
      state: text(fd, "state", 2).toUpperCase(),
      postalCode: orNull(text(fd, "postalCode", 10)),
      hours: JSON.stringify(hours),
      instagramHandle: orNull(text(fd, "instagramHandle", 60)),
      instagramUrl: orNull(text(fd, "instagramUrl", 200)),
      facebookName: orNull(text(fd, "facebookName", 120)),
      facebookUrl: orNull(text(fd, "facebookUrl", 300)),
      about: orNull(text(fd, "about")),
      ...(aboutImage && {
        aboutImageSrc: aboutImage.src,
        aboutImageW: aboutImage.width,
        aboutImageH: aboutImage.height,
      }),
      aboutImageAlt: orNull(text(fd, "aboutImageAlt", 200)),
    },
  });
  updateTag(CONTENT_TAG);
  return { ok: true, message: "Dados da empresa salvos." };
}

/* ---------------------------------------------------------------- Services */

export async function saveService(_state: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const slug = text(fd, "slug", 80);
  const name = text(fd, "name", 120);
  if (!name) return { error: "Informe o nome do serviço." };

  const file = pickedFile(fd.get("image"));
  let image = null;
  if (file) {
    try {
      image = await saveImage(file, "servicos");
    } catch (err) {
      return { error: err instanceof UploadError ? err.message : "Não foi possível salvar a imagem." };
    }
  }
  const removeImage = fd.get("removeImage") === "on";

  await db.service.update({
    where: { slug },
    data: {
      name,
      summary: text(fd, "summary", 400),
      description: orNull(text(fd, "description")),
      whatsappMessage: text(fd, "whatsappMessage", 300) || "Olá! Quero um orçamento.",
      symptoms: orNull(text(fd, "symptoms")),
      brandsServed: orNull(text(fd, "brandsServed")),
      imageAlt: orNull(text(fd, "imageAlt", 200)),
      ...(image && { imageSrc: image.src, imageW: image.width, imageH: image.height }),
      ...(removeImage && !image && { imageSrc: null, imageW: null, imageH: null }),
    },
  });
  updateTag(CONTENT_TAG);
  return { ok: true, message: "Serviço salvo." };
}

/* ------------------------------------------------------------------ Brands */

export async function addBrand(_state: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const name = text(fd, "name", 80);
  const file = pickedFile(fd.get("logo"));
  if (!name) return { error: "Informe o nome da marca." };
  if (!file) return { error: "Envie o logo da marca." };
  try {
    const logo = await saveImage(file, "marcas", { maxWidth: 400, lossless: true });
    const last = await db.brand.findFirst({ orderBy: { sortOrder: "desc" } });
    await db.brand.create({ data: { name, logoSrc: logo.src, logoW: logo.width, logoH: logo.height, sortOrder: (last?.sortOrder ?? 0) + 1 } });
  } catch (err) {
    return { error: err instanceof UploadError ? err.message : "Não foi possível salvar o logo." };
  }
  updateTag(CONTENT_TAG);
  return { ok: true, message: "Marca adicionada." };
}

export async function deleteBrand(id: string) {
  await requireAdmin();
  await db.brand.delete({ where: { id } });
  updateTag(CONTENT_TAG);
}

export async function moveBrand(id: string, direction: -1 | 1) {
  await requireAdmin();
  const brands = await db.brand.findMany({ orderBy: { sortOrder: "asc" } });
  const i = brands.findIndex((b) => b.id === id);
  const j = i + direction;
  if (i < 0 || j < 0 || j >= brands.length) return;
  [brands[i], brands[j]] = [brands[j], brands[i]];
  await db.$transaction(brands.map((b, k) => db.brand.update({ where: { id: b.id }, data: { sortOrder: k } })));
  updateTag(CONTENT_TAG);
}

/* ------------------------------------------------------------ Testimonials */

export async function saveTestimonial(_state: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = text(fd, "id");
  const author = text(fd, "author", 120);
  const body = text(fd, "text", 1500);
  if (!author || body.length < 10) return { error: "Informe o nome do cliente e o depoimento." };
  const data = { author, text: body, source: orNull(text(fd, "source", 120)), published: fd.get("published") === "on" };
  if (id) await db.testimonial.update({ where: { id }, data });
  else await db.testimonial.create({ data });
  updateTag(CONTENT_TAG);
  return { ok: true, message: id ? "Depoimento salvo." : "Depoimento adicionado." };
}

export async function deleteTestimonial(id: string) {
  await requireAdmin();
  await db.testimonial.delete({ where: { id } });
  updateTag(CONTENT_TAG);
}
