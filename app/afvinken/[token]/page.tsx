import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AfvinkenPagina({
  params,
}: {
  params: { token: string };
}) {
  const magicLink = await prisma.magicLinkToken.findUnique({
    where: { token: params.token },
  });

  // Ongeldige of verlopen token
  if (!magicLink || new Date() > magicLink.vervalOp) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-4">🔗</p>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Link niet meer geldig
        </h1>
        <p className="text-gray-500 text-sm">
          Deze link is verlopen of ongeldig. Neem contact op met de
          verslagmaker.
        </p>
      </div>
    );
  }

  // Geldig → redirect naar de verslagpagina, voorgefilterd op de verantwoordelijke
  redirect(
    `/verslag/${magicLink.werfverslagId}?verantwoordelijke=${encodeURIComponent(
      magicLink.verantwoordelijkeEmail
    )}&modus=afvinken`
  );
}
