"use client";

import { AdresboekFormulier, AdresboekFormData } from "@/components/AdresboekFormulier";

export default function NieuwContactPagina() {
  async function opslaan(data: AdresboekFormData): Promise<string | null> {
    const res = await fetch("/api/adressenboek", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      window.location.href = "/adressenboek";
      return null;
    }
    const d = await res.json().catch(() => ({}));
    return d.error ?? "Er is iets misgegaan.";
  }

  return (
    <AdresboekFormulier
      titel="Nieuw contact"
      initieel={{ naam: "", bedrijf: "", adres: "", discipline: "", email: "", telefoon: "" }}
      onOpslaan={opslaan}
      annulerenHref="/adressenboek"
    />
  );
}
