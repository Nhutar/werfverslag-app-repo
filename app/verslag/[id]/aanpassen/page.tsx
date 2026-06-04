"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function VerslagAanpassenPagina({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();

  const [laden, setLaden] = useState(true);
  const [naam, setNaam] = useState("");
  const [verslaggever, setVerslaggever] = useState("");
  const [datum, setDatum] = useState("");
  const [werfadres, setWerfadres] = useState("");
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState("");

  useEffect(() => {
    fetch(`/api/verslagen/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setNaam(data.naam ?? "");
        setVerslaggever(data.verslaggever ?? "");
        setDatum(data.datum ?? "");
        setWerfadres(data.werfadres ?? "");
      })
      .finally(() => setLaden(false));
  }, [params.id]);

  async function opslaan(e: React.FormEvent) {
    e.preventDefault();
    if (!naam.trim() || !verslaggever.trim() || !werfadres.trim()) {
      setFout("Naam werf, verslaggever en werfadres zijn verplicht.");
      return;
    }
    setBezig(true);
    setFout("");

    const res = await fetch(`/api/verslagen/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ naam, verslaggever, datum, werfadres }),
    });

    if (res.ok) {
      router.push("/");
    } else {
      const data = await res.json().catch(() => ({}));
      setFout(data.error ?? "Er is iets misgegaan. Probeer opnieuw.");
      setBezig(false);
    }
  }

  if (laden) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-sm text-gray-400">Laden...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        ← Terug naar werfverslagen
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Verslag aanpassen</h1>

      <form onSubmit={opslaan} className="flex flex-col gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Naam werf <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={naam}
              onChange={(e) => setNaam(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verslaggever <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={verslaggever}
              onChange={(e) => setVerslaggever(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {fout && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {fout}
          </p>
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
