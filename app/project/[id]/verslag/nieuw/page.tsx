"use client";

import { useEffect, useState } from "react";
import {
  WerfverslagFormulier,
  DeelnemerKeuze,
  WerfverslagFormData,
} from "@/components/WerfverslagFormulier";

export default function NieuwWerfverslagPagina({ params }: { params: { id: string } }) {
  const [projectNaam, setProjectNaam] = useState("");
  const [deelnemers, setDeelnemers] = useState<DeelnemerKeuze[] | null>(null);

  useEffect(() => {
    fetch(`/api/projecten/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setProjectNaam(data.naam ?? "");
        setDeelnemers(
          (data.deelnemers ?? []).map((d: { id: string; naam: string; discipline: string }) => ({
            id: d.id,
            naam: d.naam,
            discipline: d.discipline,
            aanwezig: false,
          }))
        );
      });
  }, [params.id]);

  async function opslaan(data: WerfverslagFormData): Promise<string | null> {
    const res = await fetch(`/api/projecten/${params.id}/werfverslagen`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const { id } = await res.json();
      window.location.href = `/verslag/${id}`;
      return null;
    }
    const d = await res.json().catch(() => ({}));
    return d.error ?? "Er is iets misgegaan.";
  }

  const vandaag = new Date().toISOString().split("T")[0];

  if (!deelnemers) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-sm text-gray-400">Laden...</p>
      </div>
    );
  }

  return (
    <WerfverslagFormulier
      titel="Nieuw werfverslag"
      projectNaam={projectNaam}
      initieleVerslaggever=""
      initieleDatum={vandaag}
      deelnemers={deelnemers}
      onOpslaan={opslaan}
      annulerenHref={`/project/${params.id}`}
    />
  );
}
