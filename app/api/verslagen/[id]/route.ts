import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    aanwezigen: verslag.aanwezigen.map((a) => ({
      id: a.id,
      naam: a.naam,
      discipline: a.discipline,
      email: a.email,
    })),
  });
}
