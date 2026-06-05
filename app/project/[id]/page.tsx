import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { berekenStatus, NokStatus } from "@/lib/status";
import { ProjectTabbladen } from "@/components/ProjectTabbladen";
import { OpmerkingPaneel } from "@/components/OpmerkingPaneel";
import { NokPuntData } from "@/components/NokPuntenLijst";

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

  // Data voor kaartenlijst
  const verslagenKaart = project.werfverslagen.map((verslag) => {
    const tellers: Record<NokStatus, number> = {
      open: 0, "bijna-deadline": 0, "voorbij-deadline": 0,
      "wacht-op-goedkeuring": 0, opgelost: 0,
    };
    verslag.nokPunten.forEach((p) => tellers[berekenStatus(p.deadline, p.status)]++);
    return {
      id: verslag.id,
      datum: new Date(verslag.datum).toLocaleDateString("nl-BE", { day: "numeric", month: "long", year: "numeric" }),
      verslaggever: verslag.verslaggever,
      projectId: project.id,
      aantalPunten: verslag.nokPunten.length,
      tellers,
    };
  });

  // Data voor tijdlijn
  const verslagenTijdlijn = project.werfverslagen.map((verslag) => ({
    id: verslag.id,
    datum: verslag.datum.toISOString().split("T")[0],
    nokPunten: verslag.nokPunten.map((p): NokPuntData => ({
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
      afkeuringsReden: p.afkeuringsReden,
      afgekeurdOp: p.afgekeurdOp ? p.afgekeurdOp.toISOString() : null,
      fotoUrls: p.fotoUrls,
      verslagId: verslag.id,
    })),
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        ← Terug naar projecten
      </Link>

      {/* Bovenste sectie: 2 kolommen */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-5 mb-6">
        {/* Projectkaart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">{project.naam}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{project.werfadres}</p>
              {project.startdatum && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Gestart op {new Date(project.startdatum).toLocaleDateString("nl-BE", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              )}
            </div>
            <Link href={`/project/${project.id}/aanpassen`} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded">
              ✏️ Aanpassen
            </Link>
          </div>

          {(project.bouwheer || project.bouwheerBedrijf) && (
            <div className="mt-2">
              <p className="text-xs font-medium text-gray-400">Bouwheer</p>
              {project.bouwheer && <p className="text-sm text-gray-600">{project.bouwheer}</p>}
              {project.bouwheerBedrijf && <p className="text-sm text-gray-500">{project.bouwheerBedrijf}</p>}
              {project.bouwheerEmail && <p className="text-xs text-gray-400">{project.bouwheerEmail}</p>}
              {project.bouwheerTelefoon && <p className="text-xs text-gray-400">{project.bouwheerTelefoon}</p>}
            </div>
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

        {/* Opmerkingen rechts */}
        <OpmerkingPaneel projectId={project.id} titel="Algemene opmerkingen" />
      </div>

      {/* Werfverslagen — volle breedte */}
      <ProjectTabbladen
        projectId={project.id}
        verslagenKaart={verslagenKaart}
        verslagenTijdlijn={verslagenTijdlijn}
        projectNaam={project.naam}
        startdatum={project.startdatum ? project.startdatum.toISOString().split("T")[0] : null}
      />
    </div>
  );
}
