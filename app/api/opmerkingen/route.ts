import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";
import { resend, VAN_ADRES } from "@/lib/resend";
import { genereerToken, tokenVervaldatum } from "@/lib/tokens";
import { NieuwBerichtEmail } from "@/emails/NieuwBerichtEmail";

const MAX_FOTO_BYTES = 10 * 1024 * 1024;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const projectId = searchParams.get("projectId");
  const werfverslagId = searchParams.get("werfverslagId");
  const nokPuntId = searchParams.get("nokPuntId");

  const opmerkingen = await prisma.opmerking.findMany({
    where: {
      ...(projectId ? { projectId } : {}),
      ...(werfverslagId ? { werfverslagId } : {}),
      ...(nokPuntId ? { nokPuntId } : {}),
    },
    orderBy: { aangemaaktOp: "asc" },
  });

  return NextResponse.json(opmerkingen.map((o) => ({
    id: o.id,
    auteurNaam: o.auteurNaam,
    auteurRol: o.auteurRol,
    tekst: o.tekst,
    fotoUrls: o.fotoUrls,
    aangemaaktOp: o.aangemaaktOp.toISOString(),
  })));
}

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Ongeldig formulier" }, { status: 400 });
  }

  const projectId = formData.get("projectId") as string | null;
  const werfverslagId = formData.get("werfverslagId") as string | null;
  const nokPuntId = formData.get("nokPuntId") as string | null;
  const auteurNaam = (formData.get("auteurNaam") as string | null)?.trim();
  const auteurRol = (formData.get("auteurRol") as string | null)?.trim() ?? "verslaggever";
  const tekst = (formData.get("tekst") as string | null)?.trim();

  if (!auteurNaam || !tekst) {
    return NextResponse.json({ error: "Naam en tekst zijn verplicht" }, { status: 400 });
  }
  if (!projectId && !werfverslagId && !nokPuntId) {
    return NextResponse.json({ error: "Contextveld ontbreekt" }, { status: 400 });
  }

  // Foto uploaden (optioneel, max 1)
  const foto = formData.get("foto") as File | null;
  const fotoUrls: string[] = [];

  if (foto && foto.size > 0) {
    if (foto.size > MAX_FOTO_BYTES) {
      return NextResponse.json({ error: "Foto mag maximaal 10 MB zijn" }, { status: 400 });
    }
    const contextId = nokPuntId ?? werfverslagId ?? projectId ?? "algemeen";
    const timestamp = Date.now();
    const veiligNaam = foto.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const pad = `opmerkingen/${contextId}/${timestamp}-${veiligNaam}`;
    const buffer = Buffer.from(await foto.arrayBuffer());

    const { error } = await supabaseAdmin.storage
      .from("nok-fotos")
      .upload(pad, buffer, { contentType: foto.type, upsert: false });

    if (error) {
      return NextResponse.json({ error: "Foto upload mislukt: " + error.message }, { status: 500 });
    }
    const { data: urlData } = supabaseAdmin.storage.from("nok-fotos").getPublicUrl(pad);
    fotoUrls.push(urlData.publicUrl);
  }

  const opmerking = await prisma.opmerking.create({
    data: {
      projectId: projectId || null,
      werfverslagId: werfverslagId || null,
      nokPuntId: nokPuntId || null,
      auteurNaam,
      auteurRol,
      tekst,
      fotoUrls,
    },
  });

  // E-mail notificatie: enkel bij NOK-chat + verslaggever stuurt een bericht
  if (nokPuntId && auteurRol === "verslaggever") {
    try {
      const punt = await prisma.nokPunt.findUnique({
        where: { id: nokPuntId },
        include: { werfverslag: { include: { project: true } } },
      });
      if (punt) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
        const token = genereerToken();
        await prisma.magicLinkToken.create({
          data: {
            token,
            werfverslagId: punt.werfverslagId,
            verantwoordelijkeEmail: punt.verantwoordelijkeEmail,
            verantwoordelijkeNaam: punt.verantwoordelijkeNaam,
            vervalOp: tokenVervaldatum(),
          },
        });
        const link = `${baseUrl}/afvinken/${token}`;
        const { error } = await resend.emails.send({
          from: VAN_ADRES,
          to: punt.verantwoordelijkeEmail,
          subject: `Nieuw bericht — ${punt.titel}`,
          react: NieuwBerichtEmail({
            verantwoordelijkeNaam: punt.verantwoordelijkeNaam,
            werfnaam: punt.werfverslag.project.naam,
            nokTitel: punt.titel,
            auteurNaam,
            tekst,
            link,
          }),
        });
        if (error) console.error("Resend fout bij chat-notificatie:", error);
      }
    } catch (e) {
      console.error("Fout bij chat-notificatie:", e);
    }
  }

  return NextResponse.json({
    id: opmerking.id,
    auteurNaam: opmerking.auteurNaam,
    auteurRol: opmerking.auteurRol,
    tekst: opmerking.tekst,
    fotoUrls: opmerking.fotoUrls,
    aangemaaktOp: opmerking.aangemaaktOp.toISOString(),
  }, { status: 201 });
}
