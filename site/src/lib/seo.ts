import type { Metadata } from "next";
import { formatAddress, type Company, type Equipment } from "./content";

// The domain is configuration, not editable content.
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.maqcentercascavel.com.br").replace(/\/$/, "");

export function pageMetadata({
  title,
  description,
  path,
  image,
  noindex,
  absoluteTitle,
}: {
  title: string;
  /** Skip the "| MAQCENTER Cascavel" suffix (home page already has it). */
  absoluteTitle?: boolean;
  description: string;
  path: string;
  image?: string;
  noindex?: boolean;
}): Metadata {
  const images = image ? [{ url: image }] : undefined;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: "MAQCENTER Cascavel",
      locale: "pt_BR",
      type: "website",
      ...(images && { images }),
    },
    ...(noindex && { robots: { index: false, follow: true } }),
  };
}

export function localBusinessJsonLd(company: Company) {
  const a = company.address;
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteUrl}/#business`,
    name: company.name,
    description: company.tagline,
    url: siteUrl,
    telephone: company.phone.e164,
    contactPoint: [
      { "@type": "ContactPoint", contactType: "customer service", telephone: company.phone.e164, availableLanguage: "pt-BR" },
      ...(company.landline
        ? [{ "@type": "ContactPoint", contactType: "customer service", telephone: company.landline.e164, availableLanguage: "pt-BR" }]
        : []),
    ],
    slogan: company.slogan,
    email: company.email,
    image: `${siteUrl}/images/og.png`,
    logo: `${siteUrl}/images/logo-maqcenter.webp`,
    address: {
      "@type": "PostalAddress",
      streetAddress: a.street,
      addressLocality: a.city,
      addressRegion: a.state,
      addressCountry: a.country,
      ...(a.postalCode && { postalCode: a.postalCode }),
    },
    ...(company.geo && { geo: { "@type": "GeoCoordinates", ...company.geo } }),
    openingHoursSpecification: company.hours.flatMap((h) =>
      h.ranges.map(([opens, closes]) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: h.dayCodes.map((d) => dayNames[d]),
        opens,
        closes,
      })),
    ),
    sameAs: [company.social.instagram.url, company.social.facebook.url],
    areaServed: { "@type": "City", name: a.city },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatAddress(company))}`,
  };
}

const dayNames: Record<string, string> = {
  Mo: "Monday",
  Tu: "Tuesday",
  We: "Wednesday",
  Th: "Thursday",
  Fr: "Friday",
  Sa: "Saturday",
  Su: "Sunday",
};

export function productJsonLd(item: Equipment, company: Company) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: item.name,
    url: `${siteUrl}/locacoes/${item.slug}`,
    category: "Locação de equipamentos",
    description: item.description?.join(" ") ?? `${item.name} para locação em ${company.address.city} - ${company.address.state}.`,
    ...(item.images.length > 0 && { image: item.images.map((i) => `${siteUrl}${i.src}`) }),
    ...(item.specs.length > 0 && {
      additionalProperty: item.specs.map((s) => ({ "@type": "PropertyValue", name: s.name, value: s.value })),
    }),
    // No price is published (quotes only), so no Offer is declared.
    seller: { "@id": `${siteUrl}/#business` },
  };
}
