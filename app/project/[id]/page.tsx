import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { berekenStatus, NokStatus } from "@/lib/status";
import { WerfverslagKaartLijst } from "@/components/WerfverslagKaartLijst";

export const dynamic = "force-dynamic";

export default async function ProjectDashboard({
  params,
}: {
  params: { id: string };
}) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      deelnemers: true,
      werfverslagen: {
        orderBy: { datum: "desc" },
        include: { nokPunten: true },
      },
    },
  });

  if (!project) notFound();

  const verslagenData = project.werfverslagen.map((verslag) => {
    const tellers: Record<NokStatus, number> = {
      open: 0,
      "bijna-deadline": 0,
      "voorbij-deadline": 0,
      opgelost: 0,
    };
    verslag.nokPunten.forEach((p) => tellers[berekenStatus(p.deadline, p.status)]++);

    return {
      id: verslag.id,
      datum: new Date(verslag.datum).toLocaleDateString("nl-BE", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      verslaggever: verslag.verslaggever,
      projectId: project.id,
      aantalPunten: verslag.nokPunten.length,
      tellers,
    };
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        ← Terug naar projecten
      </Link>

      {/* Projectkaart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h1 className="text-xl font-bold text-gray-900">{project.naam}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{project.werfadres}</p>
        {project.bouwheer && (
          <p className="text-sm text-gray-500 mt-0.5">Bouwheer: {project.bouwheer}</p>
        )}
        {project.beschrijving && (
          <p className="text-sm text-gray-400 mt-2">{project.beschrijving}</p>
        )}

        {project.deelnemers.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-1">Deelnemende verantwoordelijken</p>
            <div className="flex flex-col gap-1">
              {project.deelnemers.map((d) => (
                <p key={d.id} className="text-sm text-gray-600">
                  <span className="font-medium">{d.naam}</span>{" "}
                  <span className="text-gray-400">— {d.discipline}</span>
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Werfverslagen */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">
          Werfverslagen{" "}
          <span className="text-gray-400 font-normal text-sm">
            ({project.werfverslagen.length})
          </span>
        </h2>
        <Link
          href={`/project/${project.id}/verslag/nieuw`}
          className="inline-flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Nieuw werfverslag
        </Link>
      </div>

      {project.werfverslagen.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-3xl mb-3">📋</p>
          <p className="text-gray-600 font-medium">Nog geen werfverslagen</p>
          <p className="text-gray-400 text-sm mt-1">Maak een werfverslag aan voor dit project.</p>
        </div>
      ) : (
        <WerfverslagKaartLijst verslagen={verslagenData} />
      )}
    </div>
  );
}
