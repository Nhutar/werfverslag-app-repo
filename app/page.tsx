import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { berekenStatus, NokStatus } from "@/lib/status";
import { ProjectKaartLijst } from "@/components/ProjectKaartLijst";
import { StatusLegende } from "@/components/StatusLegende";

export const dynamic = "force-dynamic";

export default async function HoofdDashboard() {
  const projecten = await prisma.project.findMany({
    orderBy: { aangemaaktOp: "desc" },
    include: {
      werfverslagen: { include: { nokPunten: true } },
    },
  });

  const projectenData = projecten.map((project) => {
    const tellers: Record<NokStatus, number> = {
      open: 0,
      "bijna-deadline": 0,
      "voorbij-deadline": 0,
      opgelost: 0,
    };
    let aantalPunten = 0;
    for (const verslag of project.werfverslagen) {
      for (const punt of verslag.nokPunten) {
        tellers[berekenStatus(punt.deadline, punt.status)]++;
        aantalPunten++;
      }
    }

    return {
      id: project.id,
      naam: project.naam,
      werfadres: project.werfadres,
      bouwheer: project.bouwheer,
      aantalVerslagen: project.werfverslagen.length,
      aantalPunten,
      tellers,
    };
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projecten</h1>
          <p className="text-sm text-gray-500 mt-1">
            {projecten.length} {projecten.length === 1 ? "project" : "projecten"}
          </p>
        </div>
        <Link
          href="/project/nieuw"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Nieuw project
        </Link>
      </div>

      {projecten.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-4xl mb-4">📁</p>
          <p className="text-gray-600 font-medium">Nog geen projecten</p>
          <p className="text-gray-400 text-sm mt-1">
            Maak je eerste project aan om te beginnen.
          </p>
          <Link
            href="/project/nieuw"
            className="inline-flex items-center gap-2 mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Nieuw project
          </Link>
        </div>
      ) : (
        <>
          <ProjectKaartLijst projecten={projectenData} />
          <div className="mt-6 pt-4 border-t border-gray-200">
            <StatusLegende />
          </div>
        </>
      )}
    </div>
  );
}
