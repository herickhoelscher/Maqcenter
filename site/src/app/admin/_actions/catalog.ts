"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/components/forms/Form";
import { requireAdmin } from "@/lib/auth";
import { CONTENT_TAG } from "@/lib/content";
import { db } from "@/lib/db";
import { pickedFile, saveImage, UploadError } from "@/lib/storage";
import { parseMoneyToCents, slugify } from "@/lib/validators";

const text = (fd: FormData, key: string, max = 5000) => String(fd.get(key) ?? "").trim().slice(0, max);
const bool = (fd: FormData, key: string) => fd.get(key) === "on";
const int = (fd: FormData, key: string, fallback = 0) => {
  const n = parseInt(String(fd.get(key) ?? ""), 10);
  return Number.isFinite(n) ? n : fallback;
};

function uploadError(err: unknown): FormState {
  if (err instanceof UploadError) return { error: err.message };
  console.error(err);
  return { error: "Não foi possível salvar a imagem. Tente outra." };
}

/* ---------------------------------------------------------------- Products */

export async function saveProduct(_state: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = text(fd, "id");
  const name = text(fd, "name", 160);
  if (name.length < 2) return { error: "Informe o nome do produto." };
  const slug = slugify(text(fd, "slug", 160) || name);
  const priceText = text(fd, "price", 30);
  const priceCents = parseMoneyToCents(priceText);
  if (priceText && (priceCents == null || priceCents <= 0)) return { error: "Preço inválido. Use o formato 1.234,56." };
  const stock = Math.max(0, int(fd, "stock"));

  const clash = await db.product.findFirst({ where: { slug, NOT: id ? { id } : undefined } });
  if (clash) return { error: `Já existe outro produto com o endereço "${slug}".` };

  const data = {
    name,
    slug,
    group: text(fd, "group", 60) || "Máquinas",
    brand: text(fd, "brand", 80) || null,
    description: text(fd, "description") || null,
    priceCents,
    stock,
    active: bool(fd, "active"),
    featured: bool(fd, "featured"),
    sortOrder: int(fd, "sortOrder"),
  };

  const file = pickedFile(fd.get("image"));
  let image: Awaited<ReturnType<typeof saveImage>> | null = null;
  if (file) {
    try {
      image = await saveImage(file, "produtos");
    } catch (err) {
      return uploadError(err);
    }
  }

  const product = id ? await db.product.update({ where: { id }, data }) : await db.product.create({ data });
  if (image) {
    await db.productImage.create({
      data: { productId: product.id, src: image.src, width: image.width, height: image.height, alt: text(fd, "imageAlt", 200) || name, fit: "cover", sortOrder: 99 },
    });
  }
  updateTag(CONTENT_TAG);
  if (!id) redirect(`/admin/produtos/${product.id}?criado=1`);
  return { ok: true, message: "Produto salvo." };
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await db.product.delete({ where: { id } });
  updateTag(CONTENT_TAG);
  redirect("/admin/produtos");
}

export async function deleteProductImage(imageId: string) {
  await requireAdmin();
  await db.productImage.delete({ where: { id: imageId } });
  updateTag(CONTENT_TAG);
}

/* --------------------------------------------------------------- Equipment */

function parseSpecs(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const i = line.indexOf(":");
      return i > 0 ? { name: line.slice(0, i).trim(), value: line.slice(i + 1).trim() } : null;
    })
    .filter((s): s is { name: string; value: string } => Boolean(s && s.name && s.value));
}

export async function saveEquipment(_state: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = text(fd, "id");
  const name = text(fd, "name", 160);
  if (name.length < 2) return { error: "Informe o nome do equipamento." };
  const category = text(fd, "category", 80);
  if (!category) return { error: "Informe a categoria (ex.: Concretagem, Demolição)." };
  const slug = slugify(text(fd, "slug", 160) || name);
  const priceText = text(fd, "priceDaily", 30);
  const priceDailyCents = parseMoneyToCents(priceText);
  if (priceText && (priceDailyCents == null || priceDailyCents <= 0)) return { error: "Diária inválida. Use o formato 150,00." };

  const clash = await db.equipment.findFirst({ where: { slug, NOT: id ? { id } : undefined } });
  if (clash) return { error: `Já existe outro equipamento com o endereço "${slug}".` };

  // Renaming keeps the old address working (redirect).
  let previousSlugs: string | undefined;
  if (id) {
    const current = await db.equipment.findUniqueOrThrow({ where: { id } });
    if (current.slug !== slug) {
      const list = new Set((current.previousSlugs ?? "").split("\n").filter(Boolean));
      list.add(current.slug);
      list.delete(slug);
      previousSlugs = [...list].join("\n");
    }
  }

  const data = {
    name,
    slug,
    category,
    brand: text(fd, "brand", 80) || null,
    availability: text(fd, "availability", 40) || null,
    priceDailyCents,
    description: text(fd, "description") || null,
    specs: JSON.stringify(parseSpecs(text(fd, "specs"))),
    featured: bool(fd, "featured"),
    published: bool(fd, "published"),
    sortOrder: int(fd, "sortOrder"),
    ...(previousSlugs !== undefined && { previousSlugs }),
  };

  const files = fd.getAll("images").map(pickedFile).filter((f): f is File => Boolean(f));
  const uploaded = [];
  try {
    for (const f of files) uploaded.push(await saveImage(f, "equipamentos"));
  } catch (err) {
    return uploadError(err);
  }

  const item = id ? await db.equipment.update({ where: { id }, data }) : await db.equipment.create({ data });
  const fit = text(fd, "imageFit") === "contain" ? "contain" : "cover";
  for (const [i, img] of uploaded.entries()) {
    await db.equipmentImage.create({
      data: { equipmentId: item.id, src: img.src, width: img.width, height: img.height, alt: text(fd, "imageAlt", 200) || name, fit, sortOrder: 50 + i },
    });
  }
  updateTag(CONTENT_TAG);
  if (!id) redirect(`/admin/equipamentos/${item.id}?criado=1`);
  return { ok: true, message: "Equipamento salvo." };
}

export async function deleteEquipment(id: string) {
  await requireAdmin();
  await db.equipment.delete({ where: { id } });
  updateTag(CONTENT_TAG);
  redirect("/admin/equipamentos");
}

export async function deleteEquipmentImage(imageId: string) {
  await requireAdmin();
  await db.equipmentImage.delete({ where: { id: imageId } });
  updateTag(CONTENT_TAG);
}

export async function moveEquipmentImageFirst(imageId: string) {
  await requireAdmin();
  const img = await db.equipmentImage.findUniqueOrThrow({ where: { id: imageId } });
  const min = await db.equipmentImage.findFirst({ where: { equipmentId: img.equipmentId }, orderBy: { sortOrder: "asc" } });
  await db.equipmentImage.update({ where: { id: imageId }, data: { sortOrder: (min?.sortOrder ?? 0) - 1 } });
  updateTag(CONTENT_TAG);
}
