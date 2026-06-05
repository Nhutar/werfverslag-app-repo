import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface DeelnemerInput {
  discipline: string;
  naam: string;
  email: string;
  adresboekContactId?: string | null;
}

async function slaOpInAdressenboek(d: DeelnemerInput): Promise<string | null> {
  const emailGenormaliseerd = d.email.trim().toLowerCase();
  const bestaand = await prisma.adresboekContact.findUnique({
    where: { email: emailGenormaliseerd },
  });
  if (bestaand) return bestaand.id;
  const nieuw = await prisma.adresboekContact.create({
    data: {
      naam: d.naam.trim(),
      discipline: d.discipline,
      email: emailGenormaliseerd,
    },
  });
  return nieuw.id;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      naam, werfadres, bouwheer, bouwheerBedrijf, bouwheerAdres, bouwheerEmail,
      bouwheerTelefoon, startdatum, beschrijving, deelnemers,
    } = body;

    if (!naam?.trim() || !werfadres?.trim()) {
      return NextResponse.json({ error: "Naam en werfadres zijn verplicht" }, { status: 400 });
    }

    // Auto-save deelnemers naar adressenboek en verzamel contactIds
    const deelnemerData = [];
    for (const d of (deelnemers ?? []) as DeelnemerInput[]) {
      const contactId = d.adresboekContactId ?? await slaOpInAdressenboek(d);
      deelnemerData.push({
        discipline: d.discipline,
        naam: d.naam,
        email: d.email.trim().toLowerCase(),
        adresboekContactId: contactId,
      });
    }

    const project = await prisma.project.create({
      data: {
        naam,
        werfadres,
        bouwheer: bouwheer?.trim() || null,
        bouwheerBedrijf: bouwheerBedrijf?.trim() || null,
        bouwheerAdres: bouwheerAdres?.trim() || null,
        bouwheerEmail: bouwheerEmail?.trim() || null,
        bouwheerTelefoon: bouwheerTelefoon?.trim() || null,
        startdatum: startdatum ? new Date(startdatum) : null,
        beschrijving: beschrijving?.trim() || null,
        deelnemers: { create: deelnemerData },
      },
    });

    return NextResponse.json({ id: project.id }, { status: 201 });
  } catch (error) {
    console.error("Fout bij aanmaken project:", error);
    return NextResponse.json({ error: "Er is een fout opgetreden" }, { status: 500 });
  }
}
