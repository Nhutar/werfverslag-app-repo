import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DISCIPLINES } from "@/lib/disciplines";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { naam, discipline, email } = body;

  if (!naam || !discipline || !email) {
    return NextResponse.json({ error: "Verplichte velden ontbreken" }, { status: 400 });
  }

  if (!DISCIPLINES.includes(discipline)) {
    return NextResponse.json({ error: "Ongeldige discipline" }, { status: 400 });
  }

  // Oude gegevens ophalen om bijhorende NOK-punten mee te kunnen bijwerken
  const oud = await prisma.aanwezige.findUnique({ where: { id: params.id } });
  if (!oud) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }

  const aanwezige = await prisma.aanwezige.update({
    where: { id: params.id },
    data: { naam, discipline, email },
  });

  // Houd de verantwoordelijke-gegevens op de NOK-punten van dit verslag in sync.
  // Match op het oude e-mailadres binnen hetzelfde verslag.
  await prisma.nokPunt.updateMany({
    where: {
      werfverslagId: oud.werfverslagId,
      verantwoordelijkeEmail: oud.email,
    },
    data: {
      verantwoordelijkeNaam: naam,
      verantwoordelijkeEmail: email,
    },
  });

  return NextResponse.json({ id: aanwezige.id });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.aanwezige.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
