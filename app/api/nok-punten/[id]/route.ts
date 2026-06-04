import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";

const MAX_FOTOS = 5;
const MAX_BESTAND_BYTES = 10 * 1024 * 1024;

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const punt = await prisma.nokPunt.findUnique({
    where: { id: params.id },
    include: { werfverslag: { include: { aanwezigen: true } } },
  });

  if (!punt) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }

  return NextResponse.json({
    id: punt.id,
    titel: punt.titel,
    omschrijving: punt.omschrijving,
    discipline: punt.discipline,
    verantwoordelijkeNaam: punt.verantwoordelijkeNaam,
    verantwoordelijkeEmail: punt.verantwoordelijkeEmail,
    deadline: punt.deadline.toISOString().split("T")[0],
    status: punt.status,
    fotoUrls: punt.fotoUrls,
    opgelostOp: punt.opgelostOp ? punt.opgelostOp.toISOString() : null,
    opgelostDoorNaam: punt.opgelostDoorNaam,
    oplossingOmschrijving: punt.oplossingOmschrijving,
    oplossingFotoUrl: punt.oplossingFotoUrl,
    verslagId: punt.werfverslagId,
    verslagNaam: punt.werfverslag.naam,
    aanwezigen: punt.werfverslag.aanwezigen.map((a) => ({
      id: a.id,
      naam: a.naam,
      discipline: a.discipline,
      email: a.email,
    })),
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const punt = await prisma.nokPunt.findUnique({
    where: { id: params.id },
    include: { werfverslag: { include: { aanwezigen: true } } },
  });
  if (!punt) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Ongeldig formulier" }, { status: 400 });
  }

  const titel = formData.get("titel") as string | null;
  const omschrijving = formData.get("omschrijving") as string | null;
  const aanwezigeId = formData.get("aanwezigeId") as string | null;
  const deadlineStr = formData.get("deadline") as string | null;
  const bestaandeUrlsRaw = formData.get("bestaandeFotoUrls") as string | null;

  if (!titel || !aanwezigeId || !deadlineStr) {
    return NextResponse.json({ error: "Verplichte velden ontbreken" }, { status: 400 });
  }

  const aanwezige = punt.werfverslag.aanwezigen.find((a) => a.id === aanwezigeId);
  if (!aanwezige) {
    return NextResponse.json({ error: "Aanwezige niet gevonden" }, { status: 400 });
  }

  const deadline = new Date(deadlineStr);
  if (isNaN(deadline.getTime())) {
    return NextResponse.json({ error: "Ongeldige deadline" }, { status: 400 });
  }

  // Bepaal welke bestaande foto's behouden worden
  const teBehoudenUrls: string[] = bestaandeUrlsRaw
    ? JSON.parse(bestaandeUrlsRaw)
    : punt.fotoUrls;

  // Verwijder foto's die niet meer in de lijst staan
  const teVerwijderenUrls = punt.fotoUrls.filter(
    (url) => !teBehoudenUrls.includes(url)
  );
  if (teVerwijderenUrls.length > 0) {
    const paden = teVerwijderenUrls.map((url) => {
      const parts = url.split("/nok-fotos/");
      return parts[1] ?? "";
    }).filter(Boolean);
    if (paden.length > 0) {
      await supabaseAdmin.storage.from("nok-fotos").remove(paden);
    }
  }

  // Nieuwe foto's uploaden
  const nieuweFotos = formData.getAll("fotos") as File[];
  const geldigeFotos = nieuweFotos.filter((f) => f instanceof File && f.size > 0);

  const totaalFotos = teBehoudenUrls.length + geldigeFotos.length;
  if (totaalFotos > MAX_FOTOS) {
    return NextResponse.json({ error: `Maximum ${MAX_FOTOS} foto's toegestaan` }, { status: 400 });
  }
  for (const foto of geldigeFotos) {
    if (foto.size > MAX_BESTAND_BYTES) {
      return NextResponse.json({ error: "Elk bestand mag maximaal 10 MB zijn" }, { status: 400 });
    }
  }

  const nieuweFotoUrls: string[] = [];
  for (const foto of geldigeFotos) {
    const timestamp = Date.now();
    const veiligNaam = foto.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const pad = `${punt.werfverslagId}/${punt.id}/${timestamp}-${veiligNaam}`;
    const buffer = Buffer.from(await foto.arrayBuffer());

    const { error } = await supabaseAdmin.storage
      .from("nok-fotos")
      .upload(pad, buffer, { contentType: foto.type, upsert: false });

    if (error) {
      return NextResponse.json({ error: "Foto upload mislukt: " + error.message }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage.from("nok-fotos").getPublicUrl(pad);
    nieuweFotoUrls.push(urlData.publicUrl);
  }

  const fotoUrls = [...teBehoudenUrls, ...nieuweFotoUrls];

  await prisma.nokPunt.update({
    where: { id: params.id },
    data: {
      titel: titel!,
      omschrijving: omschrijving || null,
      discipline: aanwezige.discipline,
      verantwoordelijkeNaam: aanwezige.naam,
      verantwoordelijkeEmail: aanwezige.email,
      deadline,
      fotoUrls,
    },
  });

  return NextResponse.json({ id: params.id });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const punt = await prisma.nokPunt.findUnique({
    where: { id: params.id },
    select: { id: true, fotoUrls: true, werfverslagId: true },
  });
  if (!punt) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }

  // Verwijder foto's uit Storage
  if (punt.fotoUrls.length > 0) {
    const paden = punt.fotoUrls.map((url) => {
      const parts = url.split("/nok-fotos/");
      return parts[1] ?? "";
    }).filter(Boolean);
    if (paden.length > 0) {
      await supabaseAdmin.storage.from("nok-fotos").remove(paden);
    }
  }

  await prisma.nokPunt.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
