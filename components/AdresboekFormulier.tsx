"use client";

import { useState } from "react";
import Link from "next/link";
import { DISCIPLINES } from "@/lib/disciplines";

export interface AdresboekFormData {
  naam: string;
  bedrijf: string;
  adres: string;
  discipline: string;
  email: string;
  telefoon: string;
}

export function AdresboekFormulier({
  titel,
  initieel,
  onOpslaan,
  annulerenHref,
}: {
  titel: string;
  initieel: AdresboekFormData;
  onOpslaan: (data: AdresboekFormData) => Promise<string | null>;
  annulerenHref: string;
}) {
  const [naam, setNaam] = useState(initieel.naam);
  const [bedrijf, setBedrijf] = useState(initieel.bedrijf);
  const [adres, setAdres] = useState(initieel.adres);
  const [discipline, setDiscipline] = useState(initieel.discipline || DISCIPLINES[0]);
  const [email, setEmail] = useState(initieel.email);
  const [telefoon, setTelefoon] = useState(initieel.telefoon);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFout("");
    if (!naam.trim() || !email.trim()) {
      setFout("Naam en e-mail zijn verplicht.");
      return;
    }
    setBezig(true);
    const foutmelding = await onOpslaan({ naam, bedrijf, adres, discipline, email, telefoon });
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
        ← Terug
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{titel}</h1>

      <form onSubmit={submit} className="flex flex-col gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Naam <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={naam}
                onChange={(e) => setNaam(e.target.value)}
                placeholder="Voornaam Achternaam"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bedrijf</label>
              <input
                type="text"
                value={bedrijf}
                onChange={(e) => setBedrijf(e.target.value)}
                placeholder="Optioneel"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discipline</label>
            <select
              value={discipline}
              onChange={(e) => setDiscipline(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DISCIPLINES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="naam@bedrijf.be"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GSM / telefoon</label>
              <input
                type="text"
                value={telefoon}
                onChange={(e) => setTelefoon(e.target.value)}
                placeholder="Optioneel"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
              <input
                type="text"
                value={adres}
                onChange={(e) => setAdres(e.target.value)}
                placeholder="Optioneel"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {fout && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{fout}</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={bezig}
            className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {bezig ? "Bezig met opslaan..." : "Opslaan"}
          </button>
          <Link
            href={annulerenHref}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-800"
          >
            Annuleren
          </Link>
        </div>
      </form>
    </div>
  );
}
