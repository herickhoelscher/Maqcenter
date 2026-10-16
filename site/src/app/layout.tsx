import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { getCompany } from "@/lib/content";
import { siteUrl } from "@/lib/seo";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompany();
  return {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${company.name} Cascavel | ${company.tagline}`,
    template: `%s | ${company.name} Cascavel`,
  },
  description: `${company.tagline} em Cascavel - PR. Locação de equipamentos, assistência técnica, venda de máquinas e perfuração em concreto.`,
  openGraph: {
    siteName: `${company.name} Cascavel`,
    locale: "pt_BR",
    type: "website",
    images: [{ url: "/images/og.png", width: 1200, height: 630, alt: `${company.name} - ${company.tagline}` }],
  },
  };
}

export const viewport: Viewport = {
  themeColor: "#0a1e3b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${montserrat.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
