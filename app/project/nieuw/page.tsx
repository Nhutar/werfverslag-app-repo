"use client";

import { ProjectFormulier, ProjectFormData } from "@/components/ProjectFormulier";

export default function NieuwProjectPagina() {
  async function opslaan(data: ProjectFormData): Promise<string | null> {
    const res = await fetch("/api/projecten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const { id } = await res.json();
      window.location.href = `/project/${id}`;
      return null;
    }
    const d = await res.json().catch(() => ({}));
    return d.error ?? "Er is iets misgegaan.";
  }

  return (
    <ProjectFormulier
      titel="Nieuw project"
      initieel={{ naam: "", werfadres: "", bouwheer: "", bouwheerBedrijf: "", bouwheerAdres: "", bouwheerEmail: "", bouwheerTelefoon: "", beschrijving: "", deelnemers: [] }}
      onOpslaan={opslaan}
      annulerenHref="/"
    />
  );
}
