import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const contact = await prisma.adresboekContact.findUnique({
    where: { id: params.id },
  });
  if (!contact) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  return NextResponse.json(contact);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json().catch(() => ({}));
  const { naam, bedrijf, adres, discipline, email, telefoon } = body;

  if (!naam?.trim() || !discipline?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Naam, discipline en e-mail zijn verplicht" }, { status: 400 });
  }

  const contact = await prisma.adresboekContact.findUnique({ where: { id: params.id } });
  if (!contact) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  // Check uniek email (exclusief huidig contact)
  const emailGenormaliseerd = email.trim().toLowerCase();
  if (emailGenormaliseerd !== contact.email) {
    const bestaand = await prisma.adresboekContact.findUnique({
      where: { email: emailGenormaliseerd },
    });
    if (bestaand) {
      return NextResponse.json({ error: "Er bestaat al een contact met dit e-mailadres" }, { status: 409 });
    }
  }

  const bijgewerkt = await prisma.adresboekContact.update({
    where: { id: params.id },
    data: {
      naam: naam.trim(),
      bedrijf: bedrijf?.trim() || null,
      adres: adres?.trim() || null,
      discipline: discipline.trim(),
      email: emailGenormaliseerd,
      telefoon: telefoon?.trim() || null,
    },
  });

  // Sync naar gekoppelde projectdeelnemers
  const deelnemers = await prisma.projectDeelnemer.findMany({
    where: { adresboekContactId: params.id },
    select: { id: true, email: true, projectId: true },
  });

  for (const d of deelnemers) {
    const oudeEmail = d.email;
    await prisma.projectDeelnemer.update({
      where: { id: d.id },
      data: {
        naam: bijgewerkt.naam,
        discipline: bijgewerkt.discipline,
        email: bijgewerkt.email,
      },
    });
    // Sync NOK-punten van dit project
    await prisma.nokPunt.updateMany({
      where: {
        werfverslag: { projectId: d.projectId },
        verantwoordelijkeEmail: oudeEmail,
      },
      data: {
        verantwoordelijkeNaam: bijgewerkt.naam,
        verantwoordelijkeEmail: bijgewerkt.email,
      },
    });
  }

  return NextResponse.json(bijgewerkt);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const contact = await prisma.adresboekContact.findUnique({ where: { id: params.id } });
  if (!contact) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  // Ontkoppel deelnemers (adresboekContactId → null)
  await prisma.projectDeelnemer.updateMany({
    where: { adresboekContactId: params.id },
    data: { adresboekContactId: null },
  });

  await prisma.adresboekContact.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
