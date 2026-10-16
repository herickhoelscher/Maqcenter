// Loads the content extracted from the old site (content/*.json) into the
// database and creates the first admin user. Safe to run again: existing
// rows are updated, nothing is deleted.
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";

try {
  process.loadEnvFile(".env");
} catch {}

const db = new PrismaClient({
  adapter: new PrismaLibSql({
    url: (process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL)!,
    authToken: process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || undefined,
  }),
});

const content = (file: string) => JSON.parse(readFileSync(path.join("content", file), "utf8"));
const paragraphs = (list?: string[] | null) => (list && list.length ? list.join("\n\n") : null);
const lines = (list?: string[] | null) => (list && list.length ? list.join("\n") : null);

async function main() {
  const c = content("company.json");
  const company = {
    name: c.name,
    tagline: c.tagline,
    slogan: c.slogan ?? null,
    legalName: c.legalName,
    cnpj: c.cnpj,
    siteUrl: c.siteUrl,
    phoneDisplay: c.phone.display,
    phoneE164: c.phone.e164,
    whatsapp: c.whatsapp,
    emailSite: c.emailSite ?? null,
    landlineDisplay: c.landline?.display ?? null,
    landlineE164: c.landline?.e164 ?? null,
    email: c.email,
    street: c.address.street,
    district: c.address.district,
    city: c.address.city,
    state: c.address.state,
    postalCode: c.address.postalCode,
    latitude: c.geo?.latitude ?? null,
    longitude: c.geo?.longitude ?? null,
    hours: JSON.stringify(c.hours),
    instagramHandle: c.social.instagram.handle,
    instagramUrl: c.social.instagram.url,
    facebookName: c.social.facebook.name,
    facebookUrl: c.social.facebook.url,
    about: paragraphs(c.about),
    aboutImageSrc: c.aboutImage?.src ?? null,
    aboutImageAlt: c.aboutImage?.alt ?? null,
    aboutImageW: c.aboutImage?.width ?? null,
    aboutImageH: c.aboutImage?.height ?? null,
  };
  await db.company.upsert({ where: { id: 1 }, create: { id: 1, ...company }, update: company });

  for (const [i, s] of content("services.json").entries()) {
    const data = {
      name: s.name,
      summary: s.summary,
      description: paragraphs(s.description),
      imageSrc: s.image?.src ?? null,
      imageAlt: s.image?.alt ?? null,
      imageW: s.image?.width ?? null,
      imageH: s.image?.height ?? null,
      whatsappMessage: s.whatsappMessage,
      symptoms: lines(s.symptoms),
      brandsServed: lines(s.brands),
      sortOrder: i,
    };
    await db.service.upsert({ where: { slug: s.slug }, create: { slug: s.slug, ...data }, update: data });
  }

  for (const file of readdirSync(path.join("content", "equipment"))) {
    const e = content(path.join("equipment", file));
    const data = {
      name: e.name,
      category: e.category,
      brand: e.brand,
      availability: e.availability,
      priceDailyCents: e.priceDaily ? Math.round(e.priceDaily * 100) : null,
      sortOrder: e.order,
      featured: e.featured,
      description: paragraphs(e.description),
      specs: JSON.stringify(e.specs ?? []),
      previousSlugs: e.slug === "serra-circular" ? "serra-circular1" : null,
    };
    const row = await db.equipment.upsert({ where: { slug: e.slug }, create: { slug: e.slug, ...data }, update: data });
    await db.equipmentImage.deleteMany({ where: { equipmentId: row.id } });
    for (const [j, img] of (e.images ?? []).entries()) {
      await db.equipmentImage.create({
        data: { equipmentId: row.id, src: img.src, alt: img.alt, width: img.width, height: img.height, fit: img.fit ?? "contain", sortOrder: j },
      });
    }
  }

  for (const [i, p] of content("products.json").items.entries()) {
    const data = {
      name: p.name,
      group: p.group,
      brand: p.brand,
      description: paragraphs(p.description),
      featured: p.featured,
      sortOrder: i,
    };
    const row = await db.product.upsert({ where: { slug: p.slug }, create: { slug: p.slug, ...data }, update: data });
    if (p.image) {
      await db.productImage.deleteMany({ where: { productId: row.id } });
      await db.productImage.create({
        data: { productId: row.id, src: p.image.src, alt: p.image.alt, width: p.image.width, height: p.image.height, fit: p.image.fit ?? "cover" },
      });
    }
  }

  if ((await db.brand.count()) === 0) {
    for (const [i, b] of content("brands.json").entries()) {
      await db.brand.create({ data: { name: b.name, logoSrc: b.logo, logoW: 320, logoH: 120, sortOrder: i } });
    }
  }

  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password && !(await db.user.findUnique({ where: { email } }))) {
    await db.user.create({
      data: { name: process.env.ADMIN_NAME || "Administrador", email, passwordHash: await bcrypt.hash(password, 12) },
    });
    console.log(`Admin criado: ${email}`);
  }
}

main()
  .then(() => console.log("Seed concluido"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
