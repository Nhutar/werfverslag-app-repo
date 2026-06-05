import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const punt = await prisma.nokPunt.findUnique({
    where: { id: params.id },
    select: { id: true, status: true },
  });

  if (!punt) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }
  if (punt.status !== "wacht-op-goedkeuring") {
    return NextResponse.json({ error: "Punt wacht niet op goedkeuring" }, { status: 400 });
  }

  await prisma.nokPunt.update({
    where: { id: params.id },
    data: { status: "opgelost" },
  });

  return NextResponse.json({ ok: true });
}
