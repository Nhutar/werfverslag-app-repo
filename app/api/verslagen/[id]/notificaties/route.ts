import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend, VAN_ADRES } from "@/lib/resend";
import { genereerToken, tokenVervaldatum } from "@/lib/tokens";
import { NotificatieEmail } from "@/emails/NotificatieEmail";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const verslagId = params.id;

  const verslag = await prisma.werfverslag.findUnique({
    where: { id: verslagId },
    include: { aanwezigen: true, nokPunten: true },
  });
  if (!verslag) {
    return NextResponse.json({ error: "Verslag niet gevonden" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const modus = body.modus as "alle" | "openstaand" | "specifiek" | undefined;
  const gekozenEmails = (body.emails as string[] | undefined) ?? [];

  if (!modus) {
    return NextResponse.json({ error: "Geen modus opgegeven" }, { status: 400 });
  }

  // Bepaal de ontvangers op basis van de modus
  let ontvangers = verslag.aanwezigen;

  if (modus === "openstaand") {
    const openEmails = new Set(
      verslag.nokPunten
        .filter((p) => p.status !== "opgelost")
        .map((p) => p.verantwoordelijkeEmail)
    );
    ontvangers = ontvangers.filter((a) => openEmails.has(a.email));
  } else if (modus === "specifiek") {
    const set = new Set(gekozenEmails);
    ontvangers = ontvangers.filter((a) => set.has(a.email));
  }

  if (ontvangers.length === 0) {
    return NextResponse.json({ error: "Geen ontvangers gevonden" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  let verstuurd = 0;

  for (const ontvanger of ontvangers) {
    // Token aanmaken
    const token = genereerToken();
    await prisma.magicLinkToken.create({
      data: {
        token,
        werfverslagId: verslagId,
        verantwoordelijkeEmail: ontvanger.email,
        verantwoordelijkeNaam: ontvanger.naam,
        vervalOp: tokenVervaldatum(),
      },
    });

    const link = `${baseUrl}/afvinken/${token}`;

    // Openstaande punten van deze persoon
    const eigenPunten = verslag.nokPunten
      .filter(
        (p) =>
          p.verantwoordelijkeEmail === ontvanger.email && p.status !== "opgelost"
      )
      .map((p) => ({
        titel: p.titel,
        deadline: new Date(p.deadline).toLocaleDateString("nl-BE", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      }));

    try {
      await resend.emails.send({
        from: VAN_ADRES,
        to: ontvanger.email,
        subject: `Werfverslag — ${verslag.naam}`,
        react: NotificatieEmail({
          verantwoordelijkeNaam: ontvanger.naam,
          werfnaam: verslag.naam,
          punten: eigenPunten,
          link,
        }),
      });
      verstuurd++;
    } catch (e) {
      console.error("Fout bij versturen naar", ontvanger.email, e);
    }
  }

  return NextResponse.json({ verstuurd });
}
