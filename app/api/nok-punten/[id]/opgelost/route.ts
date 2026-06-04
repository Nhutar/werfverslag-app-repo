import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";

const MAX_BESTAND_BYTES = 10 * 1024 * 1024;

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const punt = await prisma.nokPunt.findUnique({
    where: { id: params.id },
    select: { id: true, werfverslagId: true, status: true },
  });

  if (!punt) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }
  if (punt.status === "opgelost") {
    return NextResponse.json({ error: "Al opgelost" }, { status: 400 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Ongeldig formulier" }, { status: 400 });
  }

  const opgelostDoorNaam = formData.get("opgelostDoorNaam") as string | null;
  const oplossingOmschrijving = formData.get("oplossingOmschrijving") as string | null;
  const foto = formData.get("foto") as File | null;

  if (!opgelostDoorNaam?.trim()) {
    return NextResponse.json({ error: "Naam is verplicht" }, { status: 400 });
  }

  // Optionele foto uploaden
  let oplossingFotoUrl: string | null = null;
  if (foto && foto.size > 0) {
    if (foto.size > MAX_BESTAND_BYTES) {
      return NextResponse.json({ error: "Foto mag maximaal 10 MB zijn" }, { status: 400 });
    }
    const timestamp = Date.now();
    const veiligNaam = foto.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const pad = `${punt.werfverslagId}/${punt.id}/oplossing-${timestamp}-${veiligNaam}`;
    const buffer = Buffer.from(await foto.arrayBuffer());

    const { error } = await supabaseAdmin.storage
      .from("nok-fotos")
      .upload(pad, buffer, { contentType: foto.type, upsert: false });

    if (error) {
      return NextResponse.json({ error: "Foto upload mislukt: " + error.message }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage.from("nok-fotos").getPublicUrl(pad);
    oplossingFotoUrl = urlData.publicUrl;
  }

  await prisma.nokPunt.update({
    where: { id: params.id },
    data: {
      status: "opgelost",
      opgelostOp: new Date(),
      opgelostDoorNaam,
      oplossingOmschrijving: oplossingOmschrijving || null,
      oplossingFotoUrl,
    },
  });

  return NextResponse.json({ ok: true });
}
