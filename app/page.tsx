import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { berekenStatus, NokStatus } from "@/lib/status";
import { VerslagKaartLijst } from "@/components/VerslagKaartLijst";

export const dynamic = "force-dynamic";

export default async function OverzichtPagina() {
  const verslagen = await prisma.werfverslag.findMany({
    orderBy: { datum: "desc" },
    include: { nokPunten: true },
  });

  const verslagenData = verslagen.map((verslag) => {
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

    return {
      id: verslag.id,
      naam: verslag.naam,
      datum,
      werfadres: verslag.werfadres,
      aantalNokPunten: verslag.nokPunten.length,
      tellers,
    };
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
        <VerslagKaartLijst verslagen={verslagenData} />
      )}
    </div>
  );
}
