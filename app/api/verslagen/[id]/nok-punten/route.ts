import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";

const MAX_FOTOS = 5;
const MAX_BESTAND_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const verslagId = params.id;

  const verslag = await prisma.werfverslag.findUnique({
    where: { id: verslagId },
    include: { project: { include: { deelnemers: true } } },
  });
  if (!verslag) {
    return NextResponse.json({ error: "Verslag niet gevonden" }, { status: 404 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Ongeldig formulier" }, { status: 400 });
  }

  const titel = formData.get("titel") as string | null;
  const omschrijving = formData.get("omschrijving") as string | null;
  const deelnemerId = formData.get("deelnemerId") as string | null;
  const deadlineStr = formData.get("deadline") as string | null;

  if (!titel || !deelnemerId || !deadlineStr) {
    return NextResponse.json({ error: "Verplichte velden ontbreken" }, { status: 400 });
  }

  const deelnemer = verslag.project.deelnemers.find((d) => d.id === deelnemerId);
  if (!deelnemer) {
    return NextResponse.json({ error: "Verantwoordelijke niet gevonden" }, { status: 400 });
  }
  const discipline = deelnemer.discipline;

  const deadline = new Date(deadlineStr);
  if (isNaN(deadline.getTime())) {
    return NextResponse.json({ error: "Ongeldige deadline" }, { status: 400 });
  }

  // Foto's ophalen uit het formulier (veld "fotos")
  const fotoFiles = formData.getAll("fotos") as File[];
  const geldigeFotos = fotoFiles.filter((f) => f instanceof File && f.size > 0);

  if (geldigeFotos.length > MAX_FOTOS) {
    return NextResponse.json({ error: `Maximum ${MAX_FOTOS} foto's toegestaan` }, { status: 400 });
  }
  for (const foto of geldigeFotos) {
    if (foto.size > MAX_BESTAND_BYTES) {
      return NextResponse.json({ error: "Elk bestand mag maximaal 10 MB zijn" }, { status: 400 });
    }
  }

  // Tijdelijk ID aanmaken voor het opslagpad (gebruiken we ook als DB-id)
  const nokPuntId = crypto.randomUUID();

  // Foto's uploaden naar Supabase Storage
  const fotoUrls: string[] = [];
  for (const foto of geldigeFotos) {
    const timestamp = Date.now();
    const veiligNaam = foto.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const pad = `${verslagId}/${nokPuntId}/${timestamp}-${veiligNaam}`;
    const buffer = Buffer.from(await foto.arrayBuffer());

    const { error } = await supabaseAdmin.storage
      .from("nok-fotos")
      .upload(pad, buffer, { contentType: foto.type, upsert: false });

    if (error) {
      return NextResponse.json({ error: "Foto upload mislukt: " + error.message }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage
      .from("nok-fotos")
      .getPublicUrl(pad);
    fotoUrls.push(urlData.publicUrl);
  }

  // NOK-punt opslaan in de database
  await prisma.nokPunt.create({
    data: {
      id: nokPuntId,
      werfverslagId: verslagId,
      titel: titel!,
      discipline,
      omschrijving: omschrijving || null,
      verantwoordelijkeNaam: deelnemer.naam,
      verantwoordelijkeEmail: deelnemer.email,
      deadline,
      fotoUrls,
      status: "open",
    },
  });

  return NextResponse.json({ id: nokPuntId }, { status: 201 });
}
