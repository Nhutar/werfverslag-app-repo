import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { berekenStatus } from "@/lib/status";
import { StatusBadge } from "@/components/StatusBadge";

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
      nokPunten: { orderBy: { aangemaaktOp: "asc" } },
    },
  });

  if (!verslag) notFound();

  const datum = new Date(verslag.datum).toLocaleDateString("nl-BE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Sorteer: open punten eerst (voorbij-deadline → bijna-deadline → open → opgelost)
  const volgorde = ["voorbij-deadline", "bijna-deadline", "open", "opgelost"];
  const gesorteerdeNokPunten = [...verslag.nokPunten].sort((a, b) => {
    const statusA = berekenStatus(a.deadline, a.status);
    const statusB = berekenStatus(b.deadline, b.status);
    return volgorde.indexOf(statusA) - volgorde.indexOf(statusB);
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Terug */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        ← Terug
      </Link>

      {/* Verslag info */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h1 className="text-xl font-bold text-gray-900">{verslag.naam}</h1>
        <p className="text-sm text-gray-500 mt-1">{datum}</p>
        <p className="text-sm text-gray-400 mt-0.5">{verslag.werfadres}</p>

        {verslag.aanwezigen.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-1">Aanwezigen</p>
            <div className="flex flex-col gap-1">
              {verslag.aanwezigen.map((a) => (
                <p key={a.id} className="text-sm text-gray-600">
                  <span className="font-medium">{a.naam}</span>{" "}
                  <span className="text-gray-400">— {a.discipline}</span>
                </p>
              ))}
            </div>
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
      {gesorteerdeNokPunten.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-3xl mb-3">✅</p>
          <p className="text-gray-600 font-medium">Geen NOK-punten</p>
          <p className="text-gray-400 text-sm mt-1">
            Voeg een punt toe als er iets niet in orde is.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {gesorteerdeNokPunten.map((punt) => {
            const status = berekenStatus(punt.deadline, punt.status);
            const deadline = new Date(punt.deadline).toLocaleDateString(
              "nl-BE",
              { day: "numeric", month: "short", year: "numeric" }
            );

            return (
              <div
                key={punt.id}
                className="bg-white rounded-xl border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={status} />
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {punt.discipline}
                    </span>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-800 mb-2">
                  {punt.omschrijving}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span>
                    <span className="font-medium">Verantwoordelijke:</span>{" "}
                    {punt.verantwoordelijkeNaam}
                  </span>
                  <span>
                    <span className="font-medium">Deadline:</span> {deadline}
                  </span>
                </div>
                {punt.status === "opgelost" && punt.opgelostOp && (
                  <p className="text-xs text-green-600 mt-2">
                    Opgelost op{" "}
                    {new Date(punt.opgelostOp).toLocaleDateString("nl-BE")}
                    {punt.opgelostDoorNaam && ` door ${punt.opgelostDoorNaam}`}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
