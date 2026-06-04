import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NokPuntData } from "@/components/NokPuntenLijst";
import { AanwezigenBeheer } from "@/components/AanwezigenBeheer";
import { NokPuntenSectie } from "@/components/NokPuntenSectie";

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

  const aanwezigenData = verslag.aanwezigen.map((a) => ({
    id: a.id,
    naam: a.naam,
    discipline: a.discipline,
    email: a.email,
  }));

  // Sticky kop-inhoud (server-rendered): terug-link + verslag info kaart
  const kopInhoud = (
    <>
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        ← Terug naar werfverslagen
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h1 className="text-xl font-bold text-gray-900">{verslag.naam}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Verslaggever: {verslag.verslaggever}
        </p>
        <p className="text-sm text-gray-500 mt-0.5">{datum}</p>
        <p className="text-sm text-gray-400 mt-0.5">{verslag.werfadres}</p>

        {verslag.aanwezigen.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-1">Aanwezigen</p>
            <AanwezigenBeheer
              aanwezigen={aanwezigenData}
              verantwoordelijkeModus={verantwoordelijkeModus}
            />
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="max-w-2xl mx-auto px-4">
      <NokPuntenSectie
        verslagId={verslag.id}
        verslagNaam={verslag.naam}
        punten={puntenData}
        aanwezigen={aanwezigenData}
        initieleVerantwoordelijke={searchParams.verantwoordelijke ?? ""}
        verantwoordelijkeModus={verantwoordelijkeModus}
        kopInhoud={kopInhoud}
      />
    </div>
  );
}
