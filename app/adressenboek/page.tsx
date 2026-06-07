import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdresboekVerwijderKnop } from "@/components/AdresboekVerwijderKnop";
import type { AdresboekContact } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdressenboekPagina({
  searchParams,
}: {
  searchParams: { discipline?: string };
}) {
  const contacten = await prisma.adresboekContact.findMany({
    orderBy: { naam: "asc" },
  });

  const disciplines = Array.from(new Set(contacten.map((c: AdresboekContact) => c.discipline))).sort();
  const filterDiscipline = searchParams.discipline ?? "";

  const zichtbaar = filterDiscipline
    ? contacten.filter((c: AdresboekContact) => c.discipline === filterDiscipline)
    : contacten;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        ← Terug naar projecten
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Adressenboek{" "}
          <span className="text-gray-400 font-normal text-base">({contacten.length})</span>
        </h1>
        <Link
          href="/adressenboek/nieuw"
          className="inline-flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Nieuw contact
        </Link>
      </div>

      {/* Filter */}
      {disciplines.length > 0 && (
        <div className="mb-4 flex gap-2 flex-wrap">
          <Link
            href="/adressenboek"
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              !filterDiscipline
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
            }`}
          >
            Alle
          </Link>
          {disciplines.map((d) => (
            <Link
              key={d}
              href={`/adressenboek?discipline=${encodeURIComponent(d)}`}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filterDiscipline === d
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
              }`}
            >
              {d}
            </Link>
          ))}
        </div>
      )}

      {zichtbaar.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-3xl mb-3">📒</p>
          <p className="text-gray-600 font-medium">Nog geen contacten</p>
          <p className="text-gray-400 text-sm mt-1">
            Voeg een contact toe of maak een project aan — contacten worden automatisch opgeslagen.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {zichtbaar.map((contact) => (
            <div
              key={contact.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="text-sm font-semibold text-gray-900">{contact.naam}</p>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {contact.discipline}
                  </span>
                </div>
                {contact.bedrijf && (
                  <p className="text-sm text-gray-600">{contact.bedrijf}</p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">{contact.email}</p>
                {contact.telefoon && (
                  <p className="text-xs text-gray-400">{contact.telefoon}</p>
                )}
                {contact.adres && (
                  <p className="text-xs text-gray-400">{contact.adres}</p>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Link
                  href={`/adressenboek/${contact.id}/aanpassen`}
                  className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded"
                >
                  Aanpassen
                </Link>
                <AdresboekVerwijderKnop contactId={contact.id} contactNaam={contact.naam} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
