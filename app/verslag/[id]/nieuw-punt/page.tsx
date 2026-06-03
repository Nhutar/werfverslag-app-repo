import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DISCIPLINES } from "@/lib/disciplines";

export const dynamic = "force-dynamic";

export default async function NieuwNokPuntPagina({
  params,
}: {
  params: { id: string };
}) {
  const verslag = await prisma.werfverslag.findUnique({
    where: { id: params.id },
    include: { aanwezigen: true },
  });

  if (!verslag) notFound();

  const morgen = new Date();
  morgen.setDate(morgen.getDate() + 1);
  const morgenStr = morgen.toISOString().split("T")[0];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Terug */}
      <Link
        href={`/verslag/${params.id}`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        ← Terug naar {verslag.naam}
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        NOK-punt toevoegen
      </h1>

      {/* Placeholder melding */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Spec 0003</span> — Het opslaan van
          NOK-punten en het versturen van e-mails wordt gebouwd in de volgende
          spec. Dit formulier toont alvast de volledige UI.
        </p>
      </div>

      <form className="flex flex-col gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4">
          {/* Discipline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discipline <span className="text-red-500">*</span>
            </label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {DISCIPLINES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Omschrijving */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Omschrijving <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Beschrijf het NOK-punt..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Foto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Foto&apos;s
            </label>
            <button
              type="button"
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-sm text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
            >
              📷 Foto toevoegen (camera)
            </button>
            <p className="text-xs text-gray-400 mt-1">
              Meerdere foto&apos;s mogelijk — komt beschikbaar in Spec 0003
            </p>
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
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Kies een verantwoordelijke...</option>
                {verslag.aanwezigen.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.naam} — {a.discipline}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deadline <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              defaultValue={morgenStr}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Knoppen */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled
            className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed"
          >
            Opslaan en e-mail versturen (Spec 0003)
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
