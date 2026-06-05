import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";

interface DeelnemerInput {
  id?: string;
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
    data: { naam: d.naam.trim(), discipline: d.discipline, email: emailGenormaliseerd },
  });
  return nieuw.id;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { deelnemers: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }

  return NextResponse.json({
    id: project.id,
    naam: project.naam,
    werfadres: project.werfadres,
    bouwheer: project.bouwheer,
    bouwheerBedrijf: project.bouwheerBedrijf,
    bouwheerAdres: project.bouwheerAdres,
    bouwheerEmail: project.bouwheerEmail,
    bouwheerTelefoon: project.bouwheerTelefoon,
    beschrijving: project.beschrijving,
    deelnemers: project.deelnemers.map((d) => ({
      id: d.id,
      naam: d.naam,
      discipline: d.discipline,
      email: d.email,
      adresboekContactId: d.adresboekContactId,
    })),
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const projectId = params.id;
  const body = await req.json();
  const {
    naam, werfadres, bouwheer, bouwheerBedrijf, bouwheerAdres, bouwheerEmail,
    bouwheerTelefoon, beschrijving, deelnemers,
  } = body;

  if (!naam?.trim() || !werfadres?.trim()) {
    return NextResponse.json({ error: "Naam en werfadres zijn verplicht" }, { status: 400 });
  }

  const bestaande = await prisma.projectDeelnemer.findMany({
    where: { projectId },
  });

  const ingestuurd: DeelnemerInput[] = deelnemers ?? [];
  const ingestuurdeIds = new Set(ingestuurd.filter((d) => d.id).map((d) => d.id));

  // Deelnemers die verwijderd zijn (niet meer ingestuurd)
  const teVerwijderen = bestaande.filter((b) => !ingestuurdeIds.has(b.id));

  // Verwijderde deelnemers mogen enkel weg als ze nergens aanwezig zijn.
  for (const d of teVerwijderen) {
    await prisma.werfverslagAanwezige.deleteMany({
      where: { projectDeelnemerId: d.id },
    });
  }
  await prisma.projectDeelnemer.deleteMany({
    where: { id: { in: teVerwijderen.map((d) => d.id) } },
  });

  // Project bijwerken
  await prisma.project.update({
    where: { id: projectId },
    data: {
      naam,
      werfadres,
      bouwheer: bouwheer?.trim() || null,
      bouwheerBedrijf: bouwheerBedrijf?.trim() || null,
      bouwheerAdres: bouwheerAdres?.trim() || null,
      bouwheerEmail: bouwheerEmail?.trim() || null,
      bouwheerTelefoon: bouwheerTelefoon?.trim() || null,
      beschrijving: beschrijving?.trim() || null,
    },
  });

  // Bestaande deelnemers updaten + nieuwe aanmaken; NOK-punten in sync houden
  for (const d of ingestuurd) {
    if (d.id) {
      const oud = bestaande.find((b) => b.id === d.id);
      await prisma.projectDeelnemer.update({
        where: { id: d.id },
        data: {
          naam: d.naam,
          discipline: d.discipline,
          email: d.email,
          adresboekContactId: d.adresboekContactId ?? undefined,
        },
      });
      if (oud) {
        await prisma.nokPunt.updateMany({
          where: { werfverslag: { projectId }, verantwoordelijkeEmail: oud.email },
          data: { verantwoordelijkeNaam: d.naam, verantwoordelijkeEmail: d.email },
        });
      }
    } else {
      // Nieuw: auto-save naar adressenboek
      const contactId = d.adresboekContactId ?? await slaOpInAdressenboek(d);
      await prisma.projectDeelnemer.create({
        data: {
          projectId,
          naam: d.naam,
          discipline: d.discipline,
          email: d.email.trim().toLowerCase(),
          adresboekContactId: contactId,
        },
      });
    }
  }

  return NextResponse.json({ id: projectId });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const projectId = params.id;

  // Alle werfverslagen van dit project
  const werfverslagen = await prisma.werfverslag.findMany({
    where: { projectId },
    select: { id: true },
  });
  const verslagIds = werfverslagen.map((w) => w.id);

  // Foto's van alle NOK-punten verwijderen uit Storage
  const nokPunten = await prisma.nokPunt.findMany({
    where: { werfverslagId: { in: verslagIds } },
    select: { fotoUrls: true, oplossingFotoUrl: true },
  });
  const paden: string[] = [];
  for (const p of nokPunten) {
    for (const url of p.fotoUrls) {
      const deel = url.split("/nok-fotos/")[1];
      if (deel) paden.push(deel);
    }
    if (p.oplossingFotoUrl) {
      const deel = p.oplossingFotoUrl.split("/nok-fotos/")[1];
      if (deel) paden.push(deel);
    }
  }
  if (paden.length > 0) {
    await supabaseAdmin.storage.from("nok-fotos").remove(paden);
  }

  // Cascade verwijderen (kinderen eerst)
  await prisma.magicLinkToken.deleteMany({ where: { werfverslagId: { in: verslagIds } } });
  await prisma.nokPunt.deleteMany({ where: { werfverslagId: { in: verslagIds } } });
  await prisma.werfverslagAanwezige.deleteMany({ where: { werfverslagId: { in: verslagIds } } });
  await prisma.werfverslag.deleteMany({ where: { projectId } });
  await prisma.projectDeelnemer.deleteMany({ where: { projectId } });
  await prisma.project.delete({ where: { id: projectId } });

  return NextResponse.json({ ok: true });
}
