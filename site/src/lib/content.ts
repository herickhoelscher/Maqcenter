import companyData from "../../content/company.json";
import servicesData from "../../content/services.json";
import brandsData from "../../content/brands.json";
import testimonialsData from "../../content/testimonials.json";
import privacyData from "../../content/legal/politica-de-privacidade.json";
import termsData from "../../content/legal/termos-e-condicoes.json";
import betoneira from "../../content/equipment/betoneira.json";
import compactador from "../../content/equipment/compactador-de-solo.json";
import cortadeira from "../../content/equipment/cortadeira-de-piso.json";
import lavador from "../../content/equipment/lavador-de-pressao.json";
import rompedor from "../../content/equipment/rompedor-de-concreto.json";
import serra from "../../content/equipment/serra-circular.json";
import vibrador from "../../content/equipment/vibrador-de-concreto.json";

// fit "cover" is for scene photos; product cutouts default to "contain".
export type Image = { src: string; alt: string; width: number; height: number; fit?: "contain" | "cover" };

export type Spec = { name: string; value: string };

export type Equipment = {
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
  oldUrls: string[];
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
  productLines?: { name: string; items: string[] }[];
  whatsappMessage: string;
};

export type Brand = { name: string; logo: string };

export type Testimonial = { author: string; text: string; source?: string };

export type LegalPage = {
  title: string;
  draft: boolean;
  sections: { heading: string; paragraphs: string[] }[];
};

export type Company = Omit<typeof companyData, "legalName" | "cnpj" | "geo" | "about" | "aboutImage" | "address"> & {
  legalName: string | null;
  cnpj: string | null;
  about: string[] | null;
  aboutImage: Image | null;
  geo: { latitude: number; longitude: number } | null;
  address: Omit<typeof companyData.address, "postalCode"> & { postalCode: string | null };
};

export const company = companyData as Company;

// New equipment files must be imported above and added here.
const equipmentList = [betoneira, compactador, cortadeira, lavador, rompedor, serra, vibrador] as Equipment[];

export function getEquipment(): Equipment[] {
  return [...equipmentList].sort((a, b) => a.order - b.order);
}

export function getEquipmentBySlug(slug: string): Equipment | undefined {
  return equipmentList.find((e) => e.slug === slug);
}

export function getCategories(): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const e of getEquipment()) counts.set(e.category, (counts.get(e.category) ?? 0) + 1);
  return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export function formatPrice(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export function getFeaturedEquipment(): Equipment[] {
  return getEquipment().filter((e) => e.featured);
}

export function getServices(): Service[] {
  return servicesData as Service[];
}

export function getService(slug: string): Service {
  const service = getServices().find((s) => s.slug === slug);
  if (!service) throw new Error(`Unknown service: ${slug}`);
  return service;
}

export function getBrands(): Brand[] {
  return brandsData;
}

export function getTestimonials(): Testimonial[] {
  return testimonialsData as Testimonial[];
}

export const legal = {
  privacy: privacyData as LegalPage,
  terms: termsData as LegalPage,
};

export const servicePaths: Record<string, string> = {
  locacoes: "/locacoes",
  "assistencia-tecnica": "/assistencia-tecnica",
  "venda-de-maquinas": "/venda-de-maquinas",
  "perfuracao-em-concreto": "/perfuracao-em-concreto",
};

export function formatAddress(): string {
  const a = company.address;
  return `${a.street} - ${a.district}, ${a.city} - ${a.state}`;
}

export function formatHoursShort(): string {
  return company.hours.map((h) => `${h.days}: ${h.ranges.map(([from, to]) => `${from}-${to}`).join(" / ")}`).join(" · ");
}

export function formatHours(): string[] {
  return company.hours.map((h) => `${h.days}: ${h.ranges.map(([from, to]) => `${from} às ${to}`).join(" e ")}`);
}
