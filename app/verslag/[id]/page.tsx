import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NokPuntenLijst, NokPuntData } from "@/components/NokPuntenLijst";
import { AanwezigenBeheer } from "@/components/AanwezigenBeheer";

export const dynamic = "force-dynamic";

export default async function VerslagDetailPagina({
  params,
}: {
  params: { id: string };
}) {
  const verslag = await prisma.werfverslag.findUnique({
    where: { id: params.id },
    include: {
      aanwezigen: true,
      nokPunten: { orderBy: { aangemaaktOp: "desc" } },
    },
  });

  if (!verslag) notFound();

  const datum = new Date(verslag.datum).toLocaleDateString("nl-BE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Punten omzetten naar serialiseerbare data voor het client component
  const puntenData: NokPuntData[] = verslag.nokPunten.map((p) => ({
    id: p.id,
    titel: p.titel,
    discipline: p.discipline,
    omschrijving: p.omschrijving,
    verantwoordelijkeNaam: p.verantwoordelijkeNaam,
    verantwoordelijkeEmail: p.verantwoordelijkeEmail,
    deadline: p.deadline.toISOString(),
    status: p.status,
    opgelostOp: p.opgelostOp ? p.opgelostOp.toISOString() : null,
    opgelostDoorNaam: p.opgelostDoorNaam,
    oplossingOmschrijving: p.oplossingOmschrijving,
    oplossingFotoUrl: p.oplossingFotoUrl,
    fotoUrls: p.fotoUrls,
    verslagId: verslag.id,
  }));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Terug */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        ← Terug naar werfverslagen
      </Link>

      {/* Verslag info — sticky bovenaan */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 md:sticky md:top-4 z-10">
        <h1 className="text-xl font-bold text-gray-900">{verslag.naam}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Verslaggever: {verslag.verslaggever}
        </p>
        {/* Op mobiel verbergen we de extra details om de sticky kop compact te houden */}
        <div className="hidden md:block">
          <p className="text-sm text-gray-500 mt-1">{datum}</p>
          <p className="text-sm text-gray-400 mt-0.5">{verslag.werfadres}</p>

          {verslag.aanwezigen.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-1">
                Aanwezigen
              </p>
              <AanwezigenBeheer aanwezigen={verslag.aanwezigen} />
            </div>
          )}
        </div>
      </div>

      {/* Op mobiel tonen we datum/adres/aanwezigen apart (niet sticky) */}
      <div className="md:hidden bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <p className="text-sm text-gray-500">{datum}</p>
        <p className="text-sm text-gray-400 mt-0.5">{verslag.werfadres}</p>
        {verslag.aanwezigen.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-1">Aanwezigen</p>
            <AanwezigenBeheer aanwezigen={verslag.aanwezigen} />
          </div>
        )}
      </div>

      {/* NOK-punten header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">
          NOK-punten{" "}
          <span className="text-gray-400 font-normal text-sm">
            ({verslag.nokPunten.length})
          </span>
        </h2>
        <Link
          href={`/verslag/${verslag.id}/nieuw-punt`}
          className="inline-flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + NOK-punt
        </Link>
      </div>

      {/* NOK-punten lijst */}
      {verslag.nokPunten.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-3xl mb-3">✅</p>
          <p className="text-gray-600 font-medium">Geen NOK-punten</p>
          <p className="text-gray-400 text-sm mt-1">
            Voeg een punt toe als er iets niet in orde is.
          </p>
        </div>
      ) : (
        <NokPuntenLijst punten={puntenData} />
      )}

    </div>
  );
}
