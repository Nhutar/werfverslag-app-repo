"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { DISCIPLINES } from "@/lib/disciplines";

export interface DeelnemerVeld {
  id?: string;
  discipline: string;
  naam: string;
  email: string;
  adresboekContactId?: string | null;
}

export interface ProjectFormData {
  naam: string;
  werfadres: string;
  bouwheer: string;
  bouwheerBedrijf: string;
  bouwheerAdres: string;
  bouwheerEmail: string;
  bouwheerTelefoon: string;
  beschrijving: string;
  deelnemers: DeelnemerVeld[];
}

interface AdresboekContact {
  id: string;
  naam: string;
  bedrijf: string | null;
  discipline: string;
  email: string;
  telefoon: string | null;
}

function AdresboekZoeker({
  onKies,
  onNieuw,
}: {
  onKies: (contact: AdresboekContact) => void;
  onNieuw: () => void;
}) {
  const [zoekterm, setZoekterm] = useState("");
  const [resultaten, setResultaten] = useState<AdresboekContact[]>([]);
  const [bezig, setBezig] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const zoek = useCallback(async (term: string) => {
    if (!term.trim()) { setResultaten([]); return; }
    setBezig(true);
    const res = await fetch(`/api/adressenboek?zoek=${encodeURIComponent(term)}`);
    const data = await res.json();
    setResultaten(Array.isArray(data) ? data.slice(0, 8) : []);
    setBezig(false);
  }, []);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setZoekterm(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => zoek(val), 250);
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        value={zoekterm}
        onChange={onChange}
        placeholder="Zoek op naam of e-mail..."
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {bezig && <p className="text-xs text-gray-400">Zoeken...</p>}
      {resultaten.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {resultaten.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => { onKies(c); setZoekterm(""); setResultaten([]); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 border-b border-gray-100 last:border-0"
            >
              <span className="font-medium text-gray-800">{c.naam}</span>
              {c.bedrijf && <span className="text-gray-500"> — {c.bedrijf}</span>}
              <span className="text-gray-400 ml-1 text-xs">{c.discipline}</span>
              <span className="block text-xs text-gray-400">{c.email}</span>
            </button>
          ))}
        </div>
      )}
      {zoekterm.length > 1 && !bezig && resultaten.length === 0 && (
        <p className="text-xs text-gray-400">Geen contact gevonden.</p>
      )}
      <button
        type="button"
        onClick={onNieuw}
        className="text-sm text-blue-600 hover:text-blue-700 font-medium text-left"
      >
        + Nieuw contact invullen
      </button>
    </div>
  );
}

export function ProjectFormulier({
  titel,
  initieel,
  onOpslaan,
  annulerenHref,
}: {
  titel: string;
  initieel: ProjectFormData;
  onOpslaan: (data: ProjectFormData) => Promise<string | null>;
  annulerenHref: string;
}) {
  const [naam, setNaam] = useState(initieel.naam);
  const [werfadres, setWerfadres] = useState(initieel.werfadres);
  const [bouwheer, setBouwheer] = useState(initieel.bouwheer);
  const [bouwheerBedrijf, setBouwheerBedrijf] = useState(initieel.bouwheerBedrijf);
  const [bouwheerAdres, setBouwheerAdres] = useState(initieel.bouwheerAdres);
  const [bouwheerEmail, setBouwheerEmail] = useState(initieel.bouwheerEmail);
  const [bouwheerTelefoon, setBouwheerTelefoon] = useState(initieel.bouwheerTelefoon);
  const [beschrijving, setBeschrijving] = useState(initieel.beschrijving);
  const [deelnemers, setDeelnemers] = useState<DeelnemerVeld[]>(initieel.deelnemers);
  const [zoekModus, setZoekModus] = useState(false);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState("");

  useEffect(() => {
    setNaam(initieel.naam);
    setWerfadres(initieel.werfadres);
    setBouwheer(initieel.bouwheer);
    setBouwheerBedrijf(initieel.bouwheerBedrijf);
    setBouwheerAdres(initieel.bouwheerAdres);
    setBouwheerEmail(initieel.bouwheerEmail);
    setBouwheerTelefoon(initieel.bouwheerTelefoon);
    setBeschrijving(initieel.beschrijving);
    setDeelnemers(initieel.deelnemers);
  }, [initieel]);

  function voegContactToe(contact: AdresboekContact) {
    setDeelnemers([
      {
        discipline: contact.discipline,
        naam: contact.naam,
        email: contact.email,
        adresboekContactId: contact.id,
      },
      ...deelnemers,
    ]);
    setZoekModus(false);
  }

  function voegLegeDeelnemerToe() {
    setDeelnemers([{ discipline: DISCIPLINES[0], naam: "", email: "", adresboekContactId: null }, ...deelnemers]);
    setZoekModus(false);
  }

  function verwijderDeelnemer(index: number) {
    setDeelnemers(deelnemers.filter((_, i) => i !== index));
  }
  function updateDeelnemer(index: number, veld: keyof DeelnemerVeld, waarde: string) {
    setDeelnemers(deelnemers.map((d, i) =>
      i === index ? { ...d, [veld]: waarde, adresboekContactId: veld === "email" || veld === "naam" ? null : d.adresboekContactId } : d
    ));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFout("");
    if (!naam.trim() || !werfadres.trim()) {
      setFout("Naam en werfadres zijn verplicht.");
      return;
    }
    for (const d of deelnemers) {
      if (!d.naam.trim() || !d.email.trim()) {
        setFout("Vul naam en e-mail in voor elke deelnemer.");
        return;
      }
    }
    setBezig(true);
    const foutmelding = await onOpslaan({
      naam, werfadres, bouwheer, bouwheerBedrijf, bouwheerAdres,
      bouwheerEmail, bouwheerTelefoon, beschrijving, deelnemers,
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
        ← Terug
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">{titel}</h1>

      <form onSubmit={submit} className="flex flex-col gap-6">
        {/* Projectgegevens */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-gray-800">Projectgegevens</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Projectnaam <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={naam}
              onChange={(e) => setNaam(e.target.value)}
              placeholder="bv. Residentie De Linde"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Beschrijving</label>
            <textarea
              rows={2}
              value={beschrijving}
              onChange={(e) => setBeschrijving(e.target.value)}
              placeholder="Optioneel"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Bouwheer */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-gray-800">Bouwheer / opdrachtgever</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Naam contactpersoon</label>
              <input
                type="text"
                value={bouwheer}
                onChange={(e) => setBouwheer(e.target.value)}
                placeholder="Optioneel"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bedrijf</label>
              <input
                type="text"
                value={bouwheerBedrijf}
                onChange={(e) => setBouwheerBedrijf(e.target.value)}
                placeholder="Optioneel"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
            <input
              type="text"
              value={bouwheerAdres}
              onChange={(e) => setBouwheerAdres(e.target.value)}
              placeholder="Optioneel"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                value={bouwheerEmail}
                onChange={(e) => setBouwheerEmail(e.target.value)}
                placeholder="Optioneel"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GSM / telefoon</label>
              <input
                type="text"
                value={bouwheerTelefoon}
                onChange={(e) => setBouwheerTelefoon(e.target.value)}
                placeholder="Optioneel"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Deelnemers */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Deelnemende verantwoordelijken</h2>
            <button
              type="button"
              onClick={() => setZoekModus(!zoekModus)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + Toevoegen
            </button>
          </div>

          {zoekModus && (
            <div className="border border-blue-100 bg-blue-50 rounded-lg p-3 flex flex-col gap-2">
              <p className="text-xs font-medium text-blue-700">Zoek in adressenboek of voeg nieuw in:</p>
              <AdresboekZoeker onKies={voegContactToe} onNieuw={voegLegeDeelnemerToe} />
            </div>
          )}

          {deelnemers.length === 0 && !zoekModus && (
            <p className="text-sm text-gray-400 text-center py-4">Nog geen deelnemers toegevoegd.</p>
          )}

          {deelnemers.map((d, i) => (
            <div key={i} className="flex flex-col gap-2 border border-gray-100 rounded-lg p-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">
                  Deelnemer {deelnemers.length - i}
                  {d.adresboekContactId && (
                    <span className="ml-2 text-blue-500">● adressenboek</span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => verwijderDeelnemer(i)}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  Verwijderen
                </button>
              </div>
              <select
                value={d.discipline}
                onChange={(e) => updateDeelnemer(i, "discipline", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DISCIPLINES.map((disc) => (
                  <option key={disc} value={disc}>{disc}</option>
                ))}
              </select>
              <input
                type="text"
                value={d.naam}
                onChange={(e) => updateDeelnemer(i, "naam", e.target.value)}
                placeholder="Naam"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                value={d.email}
                onChange={(e) => updateDeelnemer(i, "email", e.target.value)}
                placeholder="E-mailadres"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
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
