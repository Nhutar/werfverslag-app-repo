import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const zoek = req.nextUrl.searchParams.get("zoek")?.trim().toLowerCase() ?? "";

  const contacten = await prisma.adresboekContact.findMany({
    orderBy: { naam: "asc" },
  });

  const gefilterd = zoek
    ? contacten.filter(
        (c) =>
          c.naam.toLowerCase().includes(zoek) ||
          c.email.toLowerCase().includes(zoek) ||
          (c.bedrijf ?? "").toLowerCase().includes(zoek)
      )
    : contacten;

  return NextResponse.json(gefilterd);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { naam, bedrijf, adres, discipline, email, telefoon } = body;

  if (!naam?.trim() || !discipline?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Naam, discipline en e-mail zijn verplicht" }, { status: 400 });
  }

  const bestaand = await prisma.adresboekContact.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (bestaand) {
    return NextResponse.json({ error: "Er bestaat al een contact met dit e-mailadres" }, { status: 409 });
  }

  const contact = await prisma.adresboekContact.create({
    data: {
      naam: naam.trim(),
      bedrijf: bedrijf?.trim() || null,
      adres: adres?.trim() || null,
      discipline: discipline.trim(),
      email: email.trim().toLowerCase(),
      telefoon: telefoon?.trim() || null,
    },
  });

  return NextResponse.json(contact, { status: 201 });
}
