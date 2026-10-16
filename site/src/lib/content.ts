import { cacheLife, cacheTag } from "next/cache";
import privacyData from "../../content/legal/politica-de-privacidade.json";
import termsData from "../../content/legal/termos-e-condicoes.json";
import deliveryData from "../../content/legal/politica-de-entrega.json";
import { db } from "./db";

// Public site content, read from the database and cached until the admin
// changes something (every admin save calls updateTag(CONTENT_TAG)).
export const CONTENT_TAG = "content";

// fit "cover" is for scene photos; product cutouts default to "contain".
export type Image = { src: string; alt: string; width: number; height: number; fit?: "contain" | "cover" };

export type Spec = { name: string; value: string };

export type Equipment = {
  id: string;
  slug: string;
  name: string;
  category: string;
  brand: string | null;
  /** Short status shown as a badge, e.g. "Disponível". */
  availability: string | null;
  /** Daily rate in BRL. Hidden when null (quote only). */
  priceDaily: number | null;
  order: number;
  featured: boolean;
  previousSlugs: string[];
  images: Image[];
  description: string[] | null;
  specs: Spec[];
};

export type Service = {
  slug: string;
  name: string;
  summary: string;
  image: Image | null;
  description: string[] | null;
  brands?: string[];
  symptoms?: string[];
  whatsappMessage: string;
};

export type Brand = { name: string; logo: string };

export type Product = {
  id: string;
  slug: string;
  name: string;
  group: string;
  brand: string | null;
  featured: boolean;
  image: Image | null;
  description: string[] | null;
  /** Price in cents; null means quote only. */
  priceCents: number | null;
  stock: number;
};

export type Testimonial = { author: string; text: string; source?: string };

export type LegalPage = {
  title: string;
  draft: boolean;
  sections: { heading: string; paragraphs: string[] }[];
};

export type Hours = { days: string; dayCodes: string[]; ranges: [string, string][] };

export type Company = {
  name: string;
  tagline: string;
  slogan: string | null;
  legalName: string | null;
  cnpj: string | null;
  siteUrl: string;
  phone: { display: string; e164: string };
  landline: { display: string; e164: string } | null;
  whatsapp: string;
  email: string;
  emailSite: string | null;
  address: { street: string; district: string; city: string; state: string; postalCode: string | null; country: string };
  geo: { latitude: number; longitude: number } | null;
  hours: Hours[];
  social: { instagram: { handle: string; url: string }; facebook: { name: string; url: string } };
  about: string[] | null;
  aboutImage: Image | null;
};

const toParagraphs = (text: string | null | undefined) =>
  text?.trim() ? text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean) : null;
const toLines = (text: string | null | undefined) =>
  text?.trim() ? text.split("\n").map((l) => l.trim()).filter(Boolean) : undefined;
const parseJson = <T,>(text: string | null | undefined, fallback: T): T => {
  try {
    return text ? (JSON.parse(text) as T) : fallback;
  } catch {
    return fallback;
  }
};
const img = (src: string | null, alt: string | null, w: number | null, h: number | null, fit?: string): Image | null =>
  src ? { src, alt: alt ?? "", width: w ?? 800, height: h ?? 600, fit: fit === "cover" ? "cover" : fit === "contain" ? "contain" : undefined } : null;

async function loadContent() {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("max");

  const [c, services, equipment, products, brands, testimonials] = await Promise.all([
    db.company.findUnique({ where: { id: 1 } }),
    db.service.findMany({ orderBy: { sortOrder: "asc" } }),
    db.equipment.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" }, include: { images: { orderBy: { sortOrder: "asc" } } } }),
    db.product.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" }, include: { images: { orderBy: { sortOrder: "asc" } } } }),
    db.brand.findMany({ orderBy: { sortOrder: "asc" } }),
    db.testimonial.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  if (!c) throw new Error("Company data missing. Run: npx prisma db seed");

  const company: Company = {
    name: c.name,
    tagline: c.tagline,
    slogan: c.slogan,
    legalName: c.legalName,
    cnpj: c.cnpj,
    siteUrl: c.siteUrl,
    phone: { display: c.phoneDisplay, e164: c.phoneE164 },
    landline: c.landlineDisplay && c.landlineE164 ? { display: c.landlineDisplay, e164: c.landlineE164 } : null,
    whatsapp: c.whatsapp,
    email: c.email,
    emailSite: c.emailSite,
    address: { street: c.street, district: c.district, city: c.city, state: c.state, postalCode: c.postalCode, country: "BR" },
    geo: c.latitude != null && c.longitude != null ? { latitude: c.latitude, longitude: c.longitude } : null,
    hours: parseJson<Hours[]>(c.hours, []),
    social: {
      instagram: { handle: c.instagramHandle ?? "", url: c.instagramUrl ?? "" },
      facebook: { name: c.facebookName ?? "", url: c.facebookUrl ?? "" },
    },
    about: toParagraphs(c.about),
    aboutImage: img(c.aboutImageSrc, c.aboutImageAlt, c.aboutImageW, c.aboutImageH),
  };

  return {
    company,
    services: services.map<Service>((s) => ({
      slug: s.slug,
      name: s.name,
      summary: s.summary,
      image: img(s.imageSrc, s.imageAlt, s.imageW, s.imageH),
      description: toParagraphs(s.description),
      brands: toLines(s.brandsServed),
      symptoms: toLines(s.symptoms),
      whatsappMessage: s.whatsappMessage,
    })),
    equipment: equipment.map<Equipment>((e) => ({
      id: e.id,
      slug: e.slug,
      name: e.name,
      category: e.category,
      brand: e.brand,
      availability: e.availability,
      priceDaily: e.priceDailyCents != null ? e.priceDailyCents / 100 : null,
      order: e.sortOrder,
      featured: e.featured,
      previousSlugs: toLines(e.previousSlugs) ?? [],
      images: e.images.map((i) => img(i.src, i.alt, i.width, i.height, i.fit)!),
      description: toParagraphs(e.description),
      specs: parseJson<Spec[]>(e.specs, []),
    })),
    products: products.map<Product>((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      group: p.group,
      brand: p.brand,
      featured: p.featured,
      image: p.images[0] ? img(p.images[0].src, p.images[0].alt, p.images[0].width, p.images[0].height, p.images[0].fit) : null,
      description: toParagraphs(p.description),
      priceCents: p.priceCents,
      stock: p.stock,
    })),
    brands: brands.map<Brand>((b) => ({ name: b.name, logo: b.logoSrc })),
    testimonials: testimonials.map<Testimonial>((t) => ({ author: t.author, text: t.text, source: t.source ?? undefined })),
  };
}

export async function getCompany(): Promise<Company> {
  return (await loadContent()).company;
}

export async function getEquipment(): Promise<Equipment[]> {
  return (await loadContent()).equipment;
}

export async function getEquipmentBySlug(slug: string): Promise<Equipment | undefined> {
  return (await getEquipment()).find((e) => e.slug === slug);
}

/** Equipment whose slug was renamed in the admin, for redirecting old links. */
export async function findEquipmentByPreviousSlug(slug: string): Promise<Equipment | undefined> {
  return (await getEquipment()).find((e) => e.previousSlugs.includes(slug));
}

export async function getFeaturedEquipment(): Promise<Equipment[]> {
  return (await getEquipment()).filter((e) => e.featured);
}

export function categoriesOf(equipment: Equipment[]): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const e of equipment) counts.set(e.category, (counts.get(e.category) ?? 0) + 1);
  return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export async function getServices(): Promise<Service[]> {
  return (await loadContent()).services;
}

export async function getService(slug: string): Promise<Service> {
  const service = (await getServices()).find((s) => s.slug === slug);
  if (!service) throw new Error(`Unknown service: ${slug}`);
  return service;
}

export async function getProducts(): Promise<Product[]> {
  return (await loadContent()).products;
}

export async function getProductGroups(): Promise<{ name: string; items: Product[] }[]> {
  const groups = new Map<string, Product[]>();
  for (const p of await getProducts()) groups.set(p.group, [...(groups.get(p.group) ?? []), p]);
  return [...groups].map(([name, items]) => ({ name, items }));
}

export async function getBrands(): Promise<Brand[]> {
  return (await loadContent()).brands;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return (await loadContent()).testimonials;
}

export const legal = {
  privacy: privacyData as LegalPage,
  terms: termsData as LegalPage,
  delivery: deliveryData as LegalPage,
};

export const servicePaths: Record<string, string> = {
  locacoes: "/locacoes",
  "assistencia-tecnica": "/assistencia-tecnica",
  "venda-de-maquinas": "/venda-de-maquinas",
  "perfuracao-em-concreto": "/perfuracao-em-concreto",
};

export function formatPrice(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatAddress(company: Company): string {
  const a = company.address;
  return `${a.street} - ${a.district}, ${a.city} - ${a.state}`;
}

export function formatHours(company: Company): string[] {
  return company.hours.map((h) => `${h.days}: ${h.ranges.map(([from, to]) => `${from} às ${to}`).join(" e ")}`);
}
