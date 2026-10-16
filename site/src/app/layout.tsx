import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { QuoteProvider } from "@/components/quote/QuoteProvider";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { company } from "@/lib/content";
import { siteUrl } from "@/lib/seo";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
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

export const viewport: Viewport = {
  themeColor: "#0a1e3b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${montserrat.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#conteudo"
          className="sr-only z-[60] rounded-[var(--radius-control)] bg-amber px-4 py-3 font-bold text-charcoal focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Pular para o conteúdo
        </a>
        <QuoteProvider>
          <Header />
          <main id="conteudo" className="flex-1">
            {children}
          </main>
          <Footer />
          <WhatsAppFloat />
        </QuoteProvider>
      </body>
    </html>
  );
}
