import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const verslag = await prisma.werfverslag.findUnique({
    where: { id: params.id },
    include: { aanwezigen: true },
  });

  if (!verslag) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }

  return NextResponse.json({
    id: verslag.id,
    naam: verslag.naam,
    verslaggever: verslag.verslaggever,
    datum: verslag.datum.toISOString().split("T")[0],
    werfadres: verslag.werfadres,
    aanwezigen: verslag.aanwezigen.map((a) => ({
      id: a.id,
      naam: a.naam,
      discipline: a.discipline,
      email: a.email,
    })),
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { naam, verslaggever, datum, werfadres } = body;

  if (!naam || !verslaggever || !datum || !werfadres) {
    return NextResponse.json({ error: "Verplichte velden ontbreken" }, { status: 400 });
  }

  const verslag = await prisma.werfverslag.update({
    where: { id: params.id },
    data: { naam, verslaggever, datum: new Date(datum), werfadres },
  });

  return NextResponse.json({ id: verslag.id });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const verslagId = params.id;

  // Haal alle NOK-punten op voor foto-verwijdering
  const nokPunten = await prisma.nokPunt.findMany({
    where: { werfverslagId: verslagId },
    select: { id: true, fotoUrls: true },
  });

  // Verwijder foto's uit Supabase Storage per NOK-punt
  for (const punt of nokPunten) {
    if (punt.fotoUrls.length > 0) {
      const paden = punt.fotoUrls.map((url) => {
        const parts = url.split("/nok-fotos/");
        return parts[1] ?? "";
      }).filter(Boolean);
      if (paden.length > 0) {
        await supabaseAdmin.storage.from("nok-fotos").remove(paden);
      }
    }
  }

  // Cascade verwijdering via Prisma (tokens → punten → aanwezigen → verslag)
  await prisma.magicLinkToken.deleteMany({
    where: { werfverslagId: verslagId },
  });
  await prisma.nokPunt.deleteMany({ where: { werfverslagId: verslagId } });
  await prisma.aanwezige.deleteMany({ where: { werfverslagId: verslagId } });
  await prisma.werfverslag.delete({ where: { id: verslagId } });

  return NextResponse.json({ ok: true });
}
