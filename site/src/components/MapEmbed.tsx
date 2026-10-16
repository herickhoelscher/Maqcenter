"use client";

import { useState } from "react";
import { PinIcon } from "./icons";

// Click-to-load Google Maps: the iframe (and Google's scripts and cookies)
// only loads when the visitor asks for it.
export function MapEmbed({ query, title, address, mapsUrl }: { query: string; title: string; address: string; mapsUrl: string }) {
  const [show, setShow] = useState(false);

  if (show) {
    return (
      <iframe
        title={title}
        src={`https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`}
        referrerPolicy="no-referrer-when-downgrade"
        className="aspect-[4/3] w-full"
      />
    );
  }

  return (
    <div className="on-dark relative flex aspect-[4/3] flex-col items-center justify-center gap-4 overflow-hidden bg-navy p-6 text-center text-white">
      {/* Street-grid pattern as a stand-in for the map. */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "linear-gradient(rgb(255 255 255 / 0.5) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.5) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />
      <span className="relative grid size-14 place-items-center rounded-full bg-amber text-charcoal shadow-level3">
        <PinIcon className="size-7" />
      </span>
      <p className="relative text-body-lg font-semibold">{address}</p>
      <div className="relative flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => setShow(true)} className="btn btn-primary">
          Mostrar mapa
        </button>
        <a href={mapsUrl} target="_blank" rel="noopener" className="btn btn-ghost-dark">
          Abrir no Google Maps
        </a>
      </div>
      <p className="relative text-body-sm text-on-dark">O mapa é carregado do Google ao clicar.</p>
    </div>
  );
}
