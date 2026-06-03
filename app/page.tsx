import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { berekenStatus, STATUS_DOT, NokStatus } from "@/lib/status";

export const dynamic = "force-dynamic";

export default async function OverzichtPagina() {
  const verslagen = await prisma.werfverslag.findMany({
    orderBy: { datum: "desc" },
    include: { nokPunten: true },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Werfverslagen</h1>
          <p className="text-sm text-gray-500 mt-1">
            {verslagen.length}{" "}
            {verslagen.length === 1 ? "verslag" : "verslagen"}
          </p>
        </div>
        <Link
          href="/nieuw"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Nieuw verslag
        </Link>
      </div>

      {/* Lijst */}
      {verslagen.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-4xl mb-4">📋</p>
          <p className="text-gray-600 font-medium">Nog geen verslagen</p>
          <p className="text-gray-400 text-sm mt-1">
            Maak je eerste werfverslag aan om te beginnen.
          </p>
          <Link
            href="/nieuw"
            className="inline-flex items-center gap-2 mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Nieuw verslag
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {verslagen.map((verslag) => {
            const statussen = verslag.nokPunten.map((p) =>
              berekenStatus(p.deadline, p.status)
            );
            const tellers: Record<NokStatus, number> = {
              open: 0,
              "bijna-deadline": 0,
              "voorbij-deadline": 0,
              opgelost: 0,
            };
            statussen.forEach((s) => tellers[s]++);

            const datum = new Date(verslag.datum).toLocaleDateString("nl-BE", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });

            return (
              <Link
                key={verslag.id}
                href={`/verslag/${verslag.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {verslag.naam}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">{datum}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {verslag.werfadres}
                    </p>
                  </div>
                  <div className="flex gap-3 flex-shrink-0 flex-wrap justify-end items-center">
                    {(
                      [
                        "voorbij-deadline",
                        "bijna-deadline",
                        "open",
                        "opgelost",
                      ] as NokStatus[]
                    ).map(
                      (s) =>
                        tellers[s] > 0 && (
                          <span
                            key={s}
                            className="inline-flex items-center gap-1 text-xs text-gray-600"
                          >
                            <span
                              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${STATUS_DOT[s]}`}
                            />
                            {tellers[s]}
                          </span>
                        )
                    )}
                    {verslag.nokPunten.length === 0 && (
                      <span className="text-xs text-gray-400">Geen punten</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
