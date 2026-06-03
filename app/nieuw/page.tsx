"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DISCIPLINES } from "@/lib/disciplines";

interface Aanwezige {
  discipline: string;
  naam: string;
  email: string;
}

export default function NieuwVerslagPagina() {
  const router = useRouter();
  const vandaag = new Date().toISOString().split("T")[0];

  const [naam, setNaam] = useState("");
  const [datum, setDatum] = useState(vandaag);
  const [werfadres, setWerfadres] = useState("");
  const [aanwezigen, setAanwezigen] = useState<Aanwezige[]>([]);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState("");

  function voegAanwezigeToe() {
    setAanwezigen([...aanwezigen, { discipline: DISCIPLINES[0], naam: "", email: "" }]);
  }

  function verwijderAanwezige(index: number) {
    setAanwezigen(aanwezigen.filter((_, i) => i !== index));
  }

  function updateAanwezige(index: number, veld: keyof Aanwezige, waarde: string) {
    setAanwezigen(
      aanwezigen.map((a, i) => (i === index ? { ...a, [veld]: waarde } : a))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFout("");

    if (!naam.trim() || !werfadres.trim()) {
      setFout("Naam en werfadres zijn verplicht.");
      return;
    }

    for (const a of aanwezigen) {
      if (!a.naam.trim() || !a.email.trim()) {
        setFout("Vul naam en e-mail in voor elke aanwezige.");
        return;
      }
    }

    setBezig(true);
    try {
      const res = await fetch("/api/verslagen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ naam, datum, werfadres, aanwezigen }),
      });

      if (!res.ok) throw new Error("Fout bij opslaan");
      const data = await res.json();
      router.push(`/verslag/${data.id}`);
    } catch {
      setFout("Er is een fout opgetreden. Probeer opnieuw.");
      setBezig(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Terug */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        ← Terug
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nieuw verslag</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Naam werf */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-gray-800">Verslag details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Naam werf <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={naam}
              onChange={(e) => setNaam(e.target.value)}
              placeholder="bv. Residentie De Linde"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Datum rondgang
            </label>
            <input
              type="date"
              value={datum}
              onChange={(e) => setDatum(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Werfadres <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={werfadres}
              onChange={(e) => setWerfadres(e.target.value)}
              placeholder="bv. Kerkstraat 12, 2000 Antwerpen"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Aanwezigen */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Aanwezigen</h2>
            <button
              type="button"
              onClick={voegAanwezigeToe}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + Aanwezige toevoegen
            </button>
          </div>

          {aanwezigen.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              Nog geen aanwezigen toegevoegd.
            </p>
          )}

          {aanwezigen.map((a, i) => (
            <div key={i} className="flex flex-col gap-2 border border-gray-100 rounded-lg p-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">
                  Aanwezige {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => verwijderAanwezige(i)}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  Verwijderen
                </button>
              </div>

              <select
                value={a.discipline}
                onChange={(e) => updateAanwezige(i, "discipline", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DISCIPLINES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={a.naam}
                onChange={(e) => updateAanwezige(i, "naam", e.target.value)}
                placeholder="Naam"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="email"
                value={a.email}
                onChange={(e) => updateAanwezige(i, "email", e.target.value)}
                placeholder="E-mailadres"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>

        {/* Fout */}
        {fout && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {fout}
          </p>
        )}

        {/* Knoppen */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={bezig}
            className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {bezig ? "Bezig met opslaan..." : "Verslag aanmaken"}
          </button>
          <Link
            href="/"
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Annuleren
          </Link>
        </div>
      </form>
    </div>
  );
}
