import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";
import { berekenStatus } from "@/lib/status";

export const dynamic = "force-dynamic";

export default async function AfvinkenPagina({
  params,
}: {
  params: { token: string };
}) {
  const magicLink = await prisma.magicLinkToken.findUnique({
    where: { token: params.token },
    include: {
      nokPunt: {
        include: { werfverslag: true },
      },
    },
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

  const punt = magicLink.nokPunt;
  const verslag = punt.werfverslag;
  const status = berekenStatus(punt.deadline, punt.status);

  const datum = new Date(verslag.datum).toLocaleDateString("nl-BE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const deadline = new Date(punt.deadline).toLocaleDateString("nl-BE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
          Werfverslag App
        </p>
        <h1 className="text-xl font-bold text-gray-900 mt-1">{verslag.naam}</h1>
        <p className="text-sm text-gray-500">{datum} · {verslag.werfadres}</p>
      </div>

      {/* NOK-punt kaart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <StatusBadge status={status} />
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {punt.discipline}
          </span>
        </div>

        <p className="font-medium text-gray-900 mb-4">{punt.omschrijving}</p>

        <div className="text-sm text-gray-500 flex flex-col gap-1">
          <p>
            <span className="font-medium text-gray-700">Deadline:</span>{" "}
            {deadline}
          </p>
        </div>
      </div>

      {/* Afvinken of al opgelost */}
      {punt.status === "opgelost" ? (
        <div className="text-center py-6 bg-green-50 rounded-xl border border-green-200">
          <p className="text-2xl mb-2">✅</p>
          <p className="font-semibold text-green-800">Dit punt is opgelost</p>
          {punt.opgelostOp && (
            <p className="text-sm text-green-600 mt-1">
              Op {new Date(punt.opgelostOp).toLocaleDateString("nl-BE")}
              {punt.opgelostDoorNaam && ` door ${punt.opgelostDoorNaam}`}
            </p>
          )}
          {punt.oplossingOmschrijving && (
            <p className="text-sm text-green-700 mt-2 px-4">
              {punt.oplossingOmschrijving}
            </p>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-blue-800 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-4">
            <span className="font-semibold">Spec 0005</span> — Het effectief
            afvinken wordt gebouwd in Spec 0005. Dit is de volledige UI.
          </p>

          <div className="flex flex-col gap-3">
            <textarea
              rows={3}
              placeholder="Omschrijving van de oplossing (optioneel)..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />

            <button
              type="button"
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-3 text-sm text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
            >
              📷 Foto van oplossing toevoegen (optioneel)
            </button>

            <button
              disabled
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg text-sm font-semibold opacity-50 cursor-not-allowed"
            >
              Ik heb dit opgelost (Spec 0005)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
