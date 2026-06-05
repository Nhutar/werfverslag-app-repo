"use client";

import { useEffect, useState } from "react";
import { AdresboekFormulier, AdresboekFormData } from "@/components/AdresboekFormulier";

export default function ContactAanpassenPagina({ params }: { params: { id: string } }) {
  const [initieel, setInitieel] = useState<AdresboekFormData | null>(null);

  useEffect(() => {
    fetch(`/api/adressenboek/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setInitieel({
          naam: data.naam ?? "",
          bedrijf: data.bedrijf ?? "",
          adres: data.adres ?? "",
          discipline: data.discipline ?? "",
          email: data.email ?? "",
          telefoon: data.telefoon ?? "",
        });
      });
  }, [params.id]);

  async function opslaan(data: AdresboekFormData): Promise<string | null> {
    const res = await fetch(`/api/adressenboek/${params.id}`, {
      method: "PATCH",
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

  if (!initieel) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-sm text-gray-400">Laden...</p>
      </div>
    );
  }

  return (
    <AdresboekFormulier
      titel="Contact aanpassen"
      initieel={initieel}
      onOpslaan={opslaan}
      annulerenHref="/adressenboek"
    />
  );
}
