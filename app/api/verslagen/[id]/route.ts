import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const verslag = await prisma.werfverslag.findUnique({
    where: { id: params.id },
    include: {
      project: { include: { deelnemers: true } },
      aanwezigen: true,
    },
  });

  if (!verslag) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }

  const aanwezigeIds = new Set(verslag.aanwezigen.map((a) => a.projectDeelnemerId));

  return NextResponse.json({
    id: verslag.id,
    projectId: verslag.projectId,
    projectNaam: verslag.project.naam,
    werfadres: verslag.project.werfadres,
    verslaggever: verslag.verslaggever,
    datum: verslag.datum.toISOString().split("T")[0],
    aanwezigeDeelnemerIds: Array.from(aanwezigeIds),
    // Alle projectdeelnemers (voor de verantwoordelijke-dropdown en aanwezigheids-checkboxes)
    deelnemers: verslag.project.deelnemers.map((d) => ({
      id: d.id,
      naam: d.naam,
      discipline: d.discipline,
      email: d.email,
      aanwezig: aanwezigeIds.has(d.id),
    })),
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { verslaggever, datum, aanwezigeDeelnemerIds } = body;

  if (!verslaggever?.trim() || !datum) {
    return NextResponse.json({ error: "Verplichte velden ontbreken" }, { status: 400 });
  }

  await prisma.werfverslag.update({
    where: { id: params.id },
    data: { verslaggever, datum: new Date(datum) },
  });

  // Aanwezigheden opnieuw zetten
  if (Array.isArray(aanwezigeDeelnemerIds)) {
    await prisma.werfverslagAanwezige.deleteMany({ where: { werfverslagId: params.id } });
    await prisma.werfverslagAanwezige.createMany({
      data: aanwezigeDeelnemerIds.map((deelnemerId: string) => ({
        werfverslagId: params.id,
        projectDeelnemerId: deelnemerId,
      })),
    });
  }

  return NextResponse.json({ id: params.id });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const verslagId = params.id;

  const nokPunten = await prisma.nokPunt.findMany({
    where: { werfverslagId: verslagId },
    select: { fotoUrls: true, oplossingFotoUrl: true },
  });

  const paden: string[] = [];
  for (const punt of nokPunten) {
    for (const url of punt.fotoUrls) {
      const deel = url.split("/nok-fotos/")[1];
      if (deel) paden.push(deel);
    }
    if (punt.oplossingFotoUrl) {
      const deel = punt.oplossingFotoUrl.split("/nok-fotos/")[1];
      if (deel) paden.push(deel);
    }
  }
  if (paden.length > 0) {
    await supabaseAdmin.storage.from("nok-fotos").remove(paden);
  }

  await prisma.magicLinkToken.deleteMany({ where: { werfverslagId: verslagId } });
  await prisma.nokPunt.deleteMany({ where: { werfverslagId: verslagId } });
  await prisma.werfverslagAanwezige.deleteMany({ where: { werfverslagId: verslagId } });
  await prisma.werfverslag.delete({ where: { id: verslagId } });

  return NextResponse.json({ ok: true });
}
