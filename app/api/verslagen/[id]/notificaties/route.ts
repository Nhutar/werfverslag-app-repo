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
    include: {
      project: true,
      aanwezigen: { include: { projectDeelnemer: true } },
      nokPunten: true,
    },
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

  // Aanwezigen van dit verslag (projectdeelnemers die aangevinkt zijn)
  let ontvangers = verslag.aanwezigen.map((a) => ({
    naam: a.projectDeelnemer.naam,
    email: a.projectDeelnemer.email,
  }));

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

  // Dedupliceer op e-mailadres (hoofdletterongevoelig): nooit twee mails naar hetzelfde adres
  const gezien = new Set<string>();
  ontvangers = ontvangers.filter((a) => {
    const sleutel = a.email.trim().toLowerCase();
    if (gezien.has(sleutel)) return false;
    gezien.add(sleutel);
    return true;
  });

  if (ontvangers.length === 0) {
    return NextResponse.json({ error: "Geen ontvangers gevonden" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  let verstuurd = 0;
  const fouten: string[] = [];

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
          p.verantwoordelijkeEmail.trim().toLowerCase() ===
            ontvanger.email.trim().toLowerCase() && p.status !== "opgelost"
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
      const { error } = await resend.emails.send({
        from: VAN_ADRES,
        to: ontvanger.email,
        subject: `Werfverslag — ${verslag.project.naam}`,
        react: NotificatieEmail({
          verantwoordelijkeNaam: ontvanger.naam,
          werfnaam: verslag.project.naam,
          punten: eigenPunten,
          link,
        }),
      });

      if (error) {
        console.error("Resend-fout voor", ontvanger.email, error);
        fouten.push(`${ontvanger.email}: ${error.message ?? "onbekende fout"}`);
      } else {
        verstuurd++;
      }
    } catch (e) {
      console.error("Fout bij versturen naar", ontvanger.email, e);
      fouten.push(`${ontvanger.email}: ${e instanceof Error ? e.message : "onbekende fout"}`);
    }
  }

  return NextResponse.json({ verstuurd, fouten });
}
