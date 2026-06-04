import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const body = await req.json();
    const { verslaggever, datum, aanwezigeDeelnemerIds } = body;

    if (!verslaggever?.trim() || !datum) {
      return NextResponse.json(
        { error: "Verslaggever en datum zijn verplicht" },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: "Project niet gevonden" }, { status: 404 });
    }

    const ids: string[] = aanwezigeDeelnemerIds ?? [];

    const verslag = await prisma.werfverslag.create({
      data: {
        projectId,
        verslaggever,
        datum: new Date(datum),
        aanwezigen: {
          create: ids.map((deelnemerId) => ({
            projectDeelnemerId: deelnemerId,
          })),
        },
      },
    });

    return NextResponse.json({ id: verslag.id }, { status: 201 });
  } catch (error) {
    console.error("Fout bij aanmaken werfverslag:", error);
    return NextResponse.json({ error: "Er is een fout opgetreden" }, { status: 500 });
  }
}
