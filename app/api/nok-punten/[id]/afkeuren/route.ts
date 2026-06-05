import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend, VAN_ADRES } from "@/lib/resend";
import { genereerToken, tokenVervaldatum } from "@/lib/tokens";
import { AfkeuringEmail } from "@/emails/AfkeuringEmail";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const punt = await prisma.nokPunt.findUnique({
    where: { id: params.id },
    include: { werfverslag: { include: { project: true } } },
  });

  if (!punt) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }
  if (punt.status !== "wacht-op-goedkeuring") {
    return NextResponse.json({ error: "Punt wacht niet op goedkeuring" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const afkeuringsReden = (body.afkeuringsReden as string | undefined)?.trim();
  if (!afkeuringsReden) {
    return NextResponse.json({ error: "Afkeuringsreden is verplicht" }, { status: 400 });
  }

  await prisma.nokPunt.update({
    where: { id: params.id },
    data: {
      status: "open",
      afkeuringsReden,
      afgekeurdOp: new Date(),
    },
  });

  // Stuur e-mail naar verantwoordelijke met nieuwe magic link
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

  try {
    const { error } = await resend.emails.send({
      from: VAN_ADRES,
      to: punt.verantwoordelijkeEmail,
      subject: `Oplossing afgekeurd — ${punt.titel}`,
      react: AfkeuringEmail({
        verantwoordelijkeNaam: punt.verantwoordelijkeNaam,
        werfnaam: punt.werfverslag.project.naam,
        nokTitel: punt.titel,
        afkeuringsReden,
        link,
      }),
    });
    if (error) {
      console.error("Resend-fout bij afkeuring:", error);
    }
  } catch (e) {
    console.error("Fout bij sturen afkeuringsmail:", e);
  }

  return NextResponse.json({ ok: true });
}
