import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface DeelnemerInput {
  discipline: string;
  naam: string;
  email: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { naam, werfadres, bouwheer, beschrijving, deelnemers } = body;

    if (!naam?.trim() || !werfadres?.trim()) {
      return NextResponse.json(
        { error: "Naam en werfadres zijn verplicht" },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        naam,
        werfadres,
        bouwheer: bouwheer?.trim() ? bouwheer : null,
        beschrijving: beschrijving?.trim() ? beschrijving : null,
        deelnemers: {
          create: (deelnemers ?? []).map((d: DeelnemerInput) => ({
            discipline: d.discipline,
            naam: d.naam,
            email: d.email,
          })),
        },
      },
    });

    return NextResponse.json({ id: project.id }, { status: 201 });
  } catch (error) {
    console.error("Fout bij aanmaken project:", error);
    return NextResponse.json({ error: "Er is een fout opgetreden" }, { status: 500 });
  }
}
