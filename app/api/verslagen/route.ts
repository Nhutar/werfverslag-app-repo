import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { naam, verslaggever, datum, werfadres, aanwezigen } = body;

    if (!naam || !verslaggever || !datum || !werfadres) {
      return NextResponse.json(
        { error: "Naam, verslaggever, datum en werfadres zijn verplicht" },
        { status: 400 }
      );
    }

    const verslag = await prisma.werfverslag.create({
      data: {
        naam,
        verslaggever,
        datum: new Date(datum),
        werfadres,
        aanwezigen: {
          create: (aanwezigen ?? []).map(
            (a: { discipline: string; naam: string; email: string }) => ({
              discipline: a.discipline,
              naam: a.naam,
              email: a.email,
            })
          ),
        },
      },
    });

    return NextResponse.json({ id: verslag.id }, { status: 201 });
  } catch (error) {
    console.error("Fout bij aanmaken verslag:", error);
    return NextResponse.json(
      { error: "Er is een fout opgetreden" },
      { status: 500 }
    );
  }
}
