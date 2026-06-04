"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Aanwezige {
  id: string;
  naam: string;
  discipline: string;
  email: string;
}

interface VerslagInfo {
  naam: string;
  aanwezigen: Aanwezige[];
}

const MAX_FOTOS = 5;

export default function NieuwNokPuntPagina({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [verslag, setVerslag] = useState<VerslagInfo | null>(null);
  const [laden, setLaden] = useState(true);

  const [titel, setTitel] = useState("");
  const [omschrijving, setOmschrijving] = useState("");
  const [aanwezigeId, setAanwezigeId] = useState("");
  const [deadline, setDeadline] = useState(() => {
    const morgen = new Date();
    morgen.setDate(morgen.getDate() + 1);
    return morgen.toISOString().split("T")[0];
  });
  const [fotos, setFotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  // Verslag ophalen
  useEffect(() => {
    fetch(`/api/verslagen/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setVerslag(data);
        if (data.aanwezigen?.length > 0) {
          setAanwezigeId(data.aanwezigen[0].id);
        }
      })
      .finally(() => setLaden(false));
  }, [params.id]);

  // Preview URLs aanmaken
  useEffect(() => {
    const urls = fotos.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [fotos]);

  function fotoToevoegen(e: React.ChangeEvent<HTMLInputElement>) {
    const gekozen = Array.from(e.target.files ?? []);
    const samengevoegd = [...fotos, ...gekozen].slice(0, MAX_FOTOS);
    setFotos(samengevoegd);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function fotoVerwijderen(index: number) {
    setFotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function opslaan(e: React.FormEvent) {
    e.preventDefault();
    if (!aanwezigeId) {
      setFout("Kies een verantwoordelijke.");
      return;
    }

    const gekozenAanwezige = verslag?.aanwezigen.find((a) => a.id === aanwezigeId);
    if (!gekozenAanwezige) {
      setFout("Verantwoordelijke niet gevonden.");
      return;
    }

    if (!titel.trim()) {
      setFout("Titel is verplicht.");
      return;
    }
    setBezig(true);
    setFout(null);

    const fd = new FormData();
    fd.append("titel", titel);
    fd.append("discipline", gekozenAanwezige.discipline);
    fd.append("omschrijving", omschrijving);
    fd.append("aanwezigeId", aanwezigeId);
    fd.append("deadline", deadline);
    fotos.forEach((f) => fd.append("fotos", f));

    const res = await fetch(`/api/verslagen/${params.id}/nok-punten`, {
      method: "POST",
      body: fd,
    });

    if (res.ok) {
      router.push(`/verslag/${params.id}`);
    } else {
      const data = await res.json().catch(() => ({}));
      setFout(data.error ?? "Er is iets misgegaan. Probeer opnieuw.");
      setBezig(false);
    }
  }

  const gekozenAanwezige = verslag?.aanwezigen.find((a) => a.id === aanwezigeId);

  if (laden) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-sm text-gray-400">Laden...</p>
      </div>
    );
  }

  if (!verslag) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-sm text-red-500">Verslag niet gevonden.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Terug */}
      <Link
        href={`/verslag/${params.id}`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        ← Terug naar project
      </Link>

      <h1 className="text-2xl font-bold text-gray-900">{verslag.naam}</h1>
      <p className="text-sm text-gray-500 mb-6">NOK-punt toevoegen</p>

      <form onSubmit={opslaan} className="flex flex-col gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4">
          {/* Titel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titel <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={titel}
              onChange={(e) => setTitel(e.target.value)}
              placeholder="bv. Raam niet waterdicht"
              maxLength={80}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Omschrijving */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Omschrijving
            </label>
            <textarea
              rows={3}
              value={omschrijving}
              onChange={(e) => setOmschrijving(e.target.value)}
              placeholder="Optionele details..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Foto's */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Foto&apos;s{" "}
              <span className="text-gray-400 font-normal">(max {MAX_FOTOS})</span>
            </label>

            {previews.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {previews.map((url, i) => (
                  <div key={i} className="relative w-20 h-20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Foto ${i + 1}`}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => fotoVerwijderen(i)}
                      className="absolute -top-1.5 -right-1.5 bg-white border border-gray-300 rounded-full w-5 h-5 flex items-center justify-center text-xs text-gray-500 hover:text-red-500 hover:border-red-300 shadow-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {fotos.length < MAX_FOTOS && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  onChange={fotoToevoegen}
                  className="hidden"
                  id="foto-input"
                />
                <label
                  htmlFor="foto-input"
                  className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-sm text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors cursor-pointer"
                >
                  📷 Foto toevoegen
                  <span className="text-xs text-gray-300">
                    ({fotos.length}/{MAX_FOTOS})
                  </span>
                </label>
              </>
            )}
          </div>

          {/* Verantwoordelijke */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verantwoordelijke <span className="text-red-500">*</span>
            </label>
            {verslag.aanwezigen.length === 0 ? (
              <p className="text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                Geen aanwezigen toegevoegd aan dit verslag. Voeg eerst aanwezigen
                toe via de verslagdetails.
              </p>
            ) : (
              <>
                <select
                  value={aanwezigeId}
                  onChange={(e) => setAanwezigeId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {verslag.aanwezigen.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.naam} — {a.discipline}
                    </option>
                  ))}
                </select>
                {gekozenAanwezige && (
                  <p className="text-xs text-gray-400 mt-1 px-1">
                    {gekozenAanwezige.email}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deadline <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Foutmelding */}
        {fout && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {fout}
          </p>
        )}

        {/* Knoppen */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={bezig || verslag.aanwezigen.length === 0}
            className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {bezig ? "Bezig met opslaan..." : "Opslaan"}
          </button>
          <Link
            href={`/verslag/${params.id}`}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Annuleren
          </Link>
        </div>
      </form>
    </div>
  );
}
