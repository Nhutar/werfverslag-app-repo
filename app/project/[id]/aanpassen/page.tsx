"use client";

import { useEffect, useState } from "react";
import { ProjectFormulier, ProjectFormData } from "@/components/ProjectFormulier";

export default function ProjectAanpassenPagina({ params }: { params: { id: string } }) {
  const [initieel, setInitieel] = useState<ProjectFormData | null>(null);

  useEffect(() => {
    fetch(`/api/projecten/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setInitieel({
          naam: data.naam ?? "",
          werfadres: data.werfadres ?? "",
          bouwheer: data.bouwheer ?? "",
          bouwheerBedrijf: data.bouwheerBedrijf ?? "",
          bouwheerAdres: data.bouwheerAdres ?? "",
          bouwheerEmail: data.bouwheerEmail ?? "",
          bouwheerTelefoon: data.bouwheerTelefoon ?? "",
          startdatum: data.startdatum ?? "",
          beschrijving: data.beschrijving ?? "",
          deelnemers: data.deelnemers ?? [],
        });
      });
  }, [params.id]);

  async function opslaan(data: ProjectFormData): Promise<string | null> {
    const res = await fetch(`/api/projecten/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      window.location.href = `/project/${params.id}`;
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
    <ProjectFormulier
      titel="Project aanpassen"
      initieel={initieel}
      onOpslaan={opslaan}
      annulerenHref={`/project/${params.id}`}
    />
  );
}
