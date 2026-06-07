import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const opmerking = await prisma.opmerking.findUnique({ where: { id: params.id } });
  if (!opmerking) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  // Verwijder foto's uit storage
  for (const url of opmerking.fotoUrls) {
    const deel = url.split("/nok-fotos/")[1];
    if (deel) {
      await supabaseAdmin.storage.from("nok-fotos").remove([deel]);
    }
  }

  await prisma.opmerking.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
