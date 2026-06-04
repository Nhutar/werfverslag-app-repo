"use client";

import { useState } from "react";
import Link from "next/link";

export interface DeelnemerKeuze {
  id: string;
  naam: string;
  discipline: string;
  aanwezig: boolean;
}

export interface WerfverslagFormData {
  verslaggever: string;
  datum: string;
  aanwezigeDeelnemerIds: string[];
}

export function WerfverslagFormulier({
  titel,
  projectNaam,
  initieleVerslaggever,
  initieleDatum,
  deelnemers: initieleDeelnemers,
  onOpslaan,
  annulerenHref,
}: {
  titel: string;
  projectNaam: string;
  initieleVerslaggever: string;
  initieleDatum: string;
  deelnemers: DeelnemerKeuze[];
  onOpslaan: (data: WerfverslagFormData) => Promise<string | null>;
  annulerenHref: string;
}) {
  const [verslaggever, setVerslaggever] = useState(initieleVerslaggever);
  const [datum, setDatum] = useState(initieleDatum);
  const [deelnemers, setDeelnemers] = useState<DeelnemerKeuze[]>(initieleDeelnemers);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState("");

  function toggle(id: string) {
    setDeelnemers((prev) =>
      prev.map((d) => (d.id === id ? { ...d, aanwezig: !d.aanwezig } : d))
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFout("");
    if (!verslaggever.trim() || !datum) {
      setFout("Verslaggever en datum zijn verplicht.");
      return;
    }
    setBezig(true);
    const foutmelding = await onOpslaan({
      verslaggever,
      datum,
      aanwezigeDeelnemerIds: deelnemers.filter((d) => d.aanwezig).map((d) => d.id),
    });
    if (foutmelding) {
      setFout(foutmelding);
      setBezig(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href={annulerenHref}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        ← Terug naar project
      </Link>

      <h1 className="text-2xl font-bold text-gray-900">{projectNaam}</h1>
      <p className="text-sm text-gray-500 mb-6">{titel}</p>

      <form onSubmit={submit} className="flex flex-col gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verslaggever <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={verslaggever}
              onChange={(e) => setVerslaggever(e.target.value)}
              placeholder="Jouw naam"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Datum rondgang <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={datum}
              onChange={(e) => setDatum(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Aanwezigen aanvinken */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-2">
          <h2 className="font-semibold text-gray-800 mb-1">Aanwezigen</h2>
          {deelnemers.length === 0 ? (
            <p className="text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
              Dit project heeft nog geen deelnemers. Voeg ze toe via het project.
            </p>
          ) : (
            <>
              <p className="text-xs text-gray-500 mb-1">Vink aan wie aanwezig was op de rondgang.</p>
              {deelnemers.map((d) => (
                <label key={d.id} className="flex items-center gap-2 cursor-pointer py-1">
                  <input type="checkbox" checked={d.aanwezig} onChange={() => toggle(d.id)} />
                  <span className="text-sm text-gray-700">
                    {d.naam} <span className="text-gray-400">— {d.discipline}</span>
                  </span>
                </label>
              ))}
            </>
          )}
        </div>

        {fout && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{fout}</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={bezig}
            className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {bezig ? "Bezig met opslaan..." : "Opslaan"}
          </button>
          <Link
            href={annulerenHref}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Annuleren
          </Link>
        </div>
      </form>
    </div>
  );
}
