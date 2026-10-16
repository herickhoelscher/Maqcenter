import { Suspense, type ReactNode } from "react";
import { CartProvider } from "./cart/CartProvider";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { QuoteProvider } from "./quote/QuoteProvider";
import { RevealObserver } from "./RevealObserver";
import { WhatsAppFloat } from "./WhatsAppFloat";

// Public site frame: header, footer and the client stores (quote list, cart).
export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <QuoteProvider>
      <CartProvider>
        <a
          href="#conteudo"
          className="sr-only z-[60] rounded-[var(--radius-control)] bg-amber px-4 py-3 font-bold text-charcoal focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Pular para o conteúdo
        </a>
        <Header />
        <main id="conteudo" className="flex-1">
          {children}
        </main>
        <Footer />
        <WhatsAppFloat />
        <Suspense>
          <RevealObserver />
        </Suspense>
      </CartProvider>
    </QuoteProvider>
  );
}
