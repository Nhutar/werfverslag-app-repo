import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NokPuntData } from "@/components/NokPuntenLijst";
import { NokPuntenSectie } from "@/components/NokPuntenSectie";
import { OpmerkingPaneel } from "@/components/OpmerkingPaneel";

export const dynamic = "force-dynamic";

export default async function VerslagDetailPagina({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { verantwoordelijke?: string; modus?: string };
}) {
  const verantwoordelijkeModus = searchParams.modus === "afvinken";
  const verslag = await prisma.werfverslag.findUnique({
    where: { id: params.id },
    include: {
      project: { include: { deelnemers: true } },
      aanwezigen: { include: { projectDeelnemer: true } },
      nokPunten: { orderBy: { aangemaaktOp: "desc" } },
    },
  });

  if (!verslag) notFound();

  const datum = new Date(verslag.datum).toLocaleDateString("nl-BE", {
    day: "numeric", month: "long", year: "numeric",
  });

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
    afkeuringsReden: p.afkeuringsReden,
    afgekeurdOp: p.afgekeurdOp ? p.afgekeurdOp.toISOString() : null,
    fotoUrls: p.fotoUrls,
    verslagId: verslag.id,
  }));

  const aanwezigen = verslag.aanwezigen.map((a) => ({
    id: a.projectDeelnemer.id,
    naam: a.projectDeelnemer.naam,
    discipline: a.projectDeelnemer.discipline,
    email: a.projectDeelnemer.email,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Terug-link — verborgen in verantwoordelijke-modus */}
      {!verantwoordelijkeModus && (
        <Link href={`/project/${verslag.projectId}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          ← Terug naar project
        </Link>
      )}

      {/* Bovenste sectie: 2 kolommen */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-5 mb-6">
        {/* Verslagkaart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h1 className="text-xl font-bold text-gray-900">{verslag.project.naam}</h1>
          <p className="text-sm text-gray-500 mt-1">Werfverslag van {datum}</p>
          <p className="text-sm text-gray-500 mt-0.5">Verslaggever: {verslag.verslaggever}</p>
          <p className="text-sm text-gray-400 mt-0.5">{verslag.project.werfadres}</p>

          {aanwezigen.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-1">Aanwezigen</p>
              <div className="flex flex-col gap-1">
                {aanwezigen.map((a) => (
                  <p key={a.id} className="text-sm text-gray-600">
                    <span className="font-medium">{a.naam}</span>{" "}
                    <span className="text-gray-400">— {a.discipline}</span>
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Opmerkingen rechts — verborgen in verantwoordelijke-modus */}
        {!verantwoordelijkeModus && (
          <OpmerkingPaneel werfverslagId={verslag.id} titel="Opmerkingen verslag" />
        )}
      </div>

      {/* NOK-punten — volle breedte */}
      <NokPuntenSectie
        verslagId={verslag.id}
        verslagNaam={verslag.project.naam}
        verslagDatum={verslag.datum.toISOString().split("T")[0]}
        punten={puntenData}
        aanwezigen={aanwezigen}
        initieleVerantwoordelijke={searchParams.verantwoordelijke ?? ""}
        verantwoordelijkeModus={verantwoordelijkeModus}
      />
    </div>
  );
}
