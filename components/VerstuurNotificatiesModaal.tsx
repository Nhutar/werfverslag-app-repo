"use client";

import { useState } from "react";

interface AanwezigeData {
  id: string;
  naam: string;
  discipline: string;
  email: string;
}

type Modus = "alle" | "openstaand" | "specifiek";

export function VerstuurNotificatiesModaal({
  verslagId,
  verslagNaam,
  aanwezigen,
  onSluit,
}: {
  verslagId: string;
  verslagNaam: string;
  aanwezigen: AanwezigeData[];
  onSluit: () => void;
}) {
  const [modus, setModus] = useState<Modus>("openstaand");
  const [gekozen, setGekozen] = useState<Set<string>>(new Set());
  const [bezig, setBezig] = useState(false);
  const [resultaat, setResultaat] = useState<string | null>(null);
  const [fout, setFout] = useState<string | null>(null);

  function toggle(email: string) {
    setGekozen((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  }

  async function verstuur() {
    setBezig(true);
    setFout(null);
    setResultaat(null);

    const res = await fetch(`/api/verslagen/${verslagId}/notificaties`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        modus,
        emails: modus === "specifiek" ? Array.from(gekozen) : undefined,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setResultaat(`${data.verstuurd} e-mail${data.verstuurd === 1 ? "" : "s"} verstuurd.`);
      if (data.fouten && data.fouten.length > 0) {
        setFout("Niet alles is gelukt:\n" + data.fouten.join("\n"));
      }
    } else {
      const data = await res.json().catch(() => ({}));
      setFout(data.error ?? "Er is iets misgegaan.");
    }
    setBezig(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 py-8">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Notificaties versturen</h2>
            <p className="text-sm text-gray-500">{verslagNaam}</p>
          </div>
          <button onClick={onSluit} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            ✕
          </button>
        </div>

        {resultaat ? (
          <div className="text-center py-6">
            <p className="text-3xl mb-2">{fout ? "⚠️" : "✅"}</p>
            <p className="text-green-700 font-medium">{resultaat}</p>
            {fout && (
              <p className="text-sm text-red-600 mt-3 whitespace-pre-line text-left bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {fout}
              </p>
            )}
            <button
              onClick={onSluit}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Sluiten
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2 mb-4">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="modus"
                  checked={modus === "openstaand"}
                  onChange={() => setModus("openstaand")}
                  className="mt-1"
                />
                <span className="text-sm text-gray-700">
                  <span className="font-medium">Enkel verantwoordelijken met openstaande punten</span>
                  <br />
                  <span className="text-xs text-gray-500">Wie nog een niet-opgelost NOK-punt heeft.</span>
                </span>
              </label>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="modus"
                  checked={modus === "alle"}
                  onChange={() => setModus("alle")}
                  className="mt-1"
                />
                <span className="text-sm text-gray-700">
                  <span className="font-medium">Alle aanwezigen</span>
                  <br />
                  <span className="text-xs text-gray-500">Iedereen op het verslag op de hoogte brengen.</span>
                </span>
              </label>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="modus"
                  checked={modus === "specifiek"}
                  onChange={() => setModus("specifiek")}
                  className="mt-1"
                />
                <span className="text-sm text-gray-700">
                  <span className="font-medium">Specifieke personen</span>
                  <br />
                  <span className="text-xs text-gray-500">Kies hieronder wie een mail krijgt.</span>
                </span>
              </label>
            </div>

            {/* Selectielijst bij 'specifiek' */}
            {modus === "specifiek" && (
              <div className="border border-gray-200 rounded-lg p-3 mb-4 flex flex-col gap-2 max-h-48 overflow-y-auto">
                {aanwezigen.map((a) => (
                  <label key={a.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gekozen.has(a.email)}
                      onChange={() => toggle(a.email)}
                    />
                    <span className="text-sm text-gray-700">
                      {a.naam} <span className="text-gray-400">— {a.discipline}</span>
                    </span>
                  </label>
                ))}
              </div>
            )}

            {fout && <p className="text-sm text-red-600 mb-3">{fout}</p>}

            <div className="flex gap-3">
              <button
                onClick={verstuur}
                disabled={bezig || (modus === "specifiek" && gekozen.size === 0)}
                className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {bezig ? "Bezig met versturen..." : "Verstuur"}
              </button>
              <button
                onClick={onSluit}
                disabled={bezig}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-800"
              >
                Annuleren
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
