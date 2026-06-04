"use client";

import { ReactNode, useMemo, useState } from "react";
import Link from "next/link";
import { NokPuntenLijst, NokPuntData } from "@/components/NokPuntenLijst";
import { VerstuurNotificatiesModaal } from "@/components/VerstuurNotificatiesModaal";
import { berekenStatus, NokStatus } from "@/lib/status";

interface AanwezigeData {
  id: string;
  naam: string;
  discipline: string;
  email: string;
}

type SorteerOptie = "urgentie" | "toegevoegd";

const STATUS_VOLGORDE: Record<NokStatus, number> = {
  "voorbij-deadline": 0,
  "bijna-deadline": 1,
  open: 2,
  opgelost: 3,
};

export function NokPuntenSectie({
  verslagId,
  verslagNaam,
  punten,
  aanwezigen,
  initieleVerantwoordelijke,
  verantwoordelijkeModus = false,
  kopInhoud,
}: {
  verslagId: string;
  verslagNaam: string;
  punten: NokPuntData[];
  aanwezigen: AanwezigeData[];
  initieleVerantwoordelijke: string; // email of ""
  verantwoordelijkeModus?: boolean;
  kopInhoud: ReactNode;
}) {
  // Verantwoordelijken die effectief op punten voorkomen (naam, uniek)
  const verantwoordelijken = useMemo(() => {
    const namen = new Set(punten.map((p) => p.verantwoordelijkeNaam));
    return Array.from(namen).sort();
  }, [punten]);

  const disciplines = useMemo(() => {
    const d = new Set(punten.map((p) => p.discipline));
    return Array.from(d).sort();
  }, [punten]);

  // Initiële verantwoordelijke-filter op basis van de magic link (email → naam)
  const initieleNaam = useMemo(() => {
    if (!initieleVerantwoordelijke) return "";
    const match = punten.find(
      (p) => p.verantwoordelijkeEmail === initieleVerantwoordelijke
    );
    return match?.verantwoordelijkeNaam ?? "";
  }, [initieleVerantwoordelijke, punten]);

  const [filterVerantwoordelijke, setFilterVerantwoordelijke] = useState(initieleNaam);
  const [filterStatus, setFilterStatus] = useState<string>("alle");
  const [filterDiscipline, setFilterDiscipline] = useState<string>("alle");
  const [sortering, setSortering] = useState<SorteerOptie>("urgentie");
  const [notificatiesOpen, setNotificatiesOpen] = useState(false);

  const filterActief =
    filterVerantwoordelijke !== "" ||
    filterStatus !== "alle" ||
    filterDiscipline !== "alle";

  const zichtbarePunten = useMemo(() => {
    let lijst = [...punten];

    if (filterVerantwoordelijke) {
      lijst = lijst.filter((p) => p.verantwoordelijkeNaam === filterVerantwoordelijke);
    }
    if (filterDiscipline !== "alle") {
      lijst = lijst.filter((p) => p.discipline === filterDiscipline);
    }
    if (filterStatus !== "alle") {
      lijst = lijst.filter(
        (p) => berekenStatus(new Date(p.deadline), p.status) === filterStatus
      );
    }

    if (sortering === "urgentie") {
      lijst.sort((a, b) => {
        const sa = STATUS_VOLGORDE[berekenStatus(new Date(a.deadline), a.status)];
        const sb = STATUS_VOLGORDE[berekenStatus(new Date(b.deadline), b.status)];
        if (sa !== sb) return sa - sb;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
    } else {
      // Toegevoegd: nieuwste eerst (punten komen al desc binnen)
      // Geen extra sortering nodig
    }

    return lijst;
  }, [punten, filterVerantwoordelijke, filterDiscipline, filterStatus, sortering]);

  function wisFilters() {
    setFilterVerantwoordelijke("");
    setFilterStatus("alle");
    setFilterDiscipline("alle");
  }

  return (
    <>
      {/* Sticky kop */}
      <div className="sticky top-0 z-10 bg-gray-50 pt-8 pb-4">
        {kopInhoud}

        {/* NOK-punten header */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="font-semibold text-gray-900">
            NOK-punten{" "}
            <span className="text-gray-400 font-normal text-sm">({punten.length})</span>
          </h2>
          {!verantwoordelijkeModus && (
            <div className="flex gap-2">
              <button
                onClick={() => setNotificatiesOpen(true)}
                className="inline-flex items-center gap-1 bg-white border border-blue-200 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
              >
                ✉ Verstuur notificaties
              </button>
              <Link
                href={`/verslag/${verslagId}/nieuw-punt`}
                className="inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                + NOK-punt
              </Link>
            </div>
          )}
        </div>

        {/* Melding in verantwoordelijke-modus */}
        {verantwoordelijkeModus && (
          <p className="text-xs text-blue-800 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mt-3">
            Je bekijkt dit als verantwoordelijke. Je kan je punten bekijken en afvinken.
          </p>
        )}

        {/* Filterbalk */}
        {punten.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap items-center">
            <select
              value={filterVerantwoordelijke}
              onChange={(e) => setFilterVerantwoordelijke(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Iedereen</option>
              {verantwoordelijken.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="alle">Alle statussen</option>
              <option value="open">Open</option>
              <option value="bijna-deadline">Bijna deadline</option>
              <option value="voorbij-deadline">Voorbij deadline</option>
              <option value="opgelost">Opgelost</option>
            </select>

            <select
              value={filterDiscipline}
              onChange={(e) => setFilterDiscipline(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="alle">Alle disciplines</option>
              {disciplines.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              value={sortering}
              onChange={(e) => setSortering(e.target.value as SorteerOptie)}
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="urgentie">Sorteer: urgentie</option>
              <option value="toegevoegd">Sorteer: toegevoegd</option>
            </select>

            {filterActief && (
              <button
                onClick={wisFilters}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Filters wissen
              </button>
            )}
          </div>
        )}
      </div>

      {/* Lijst */}
      <div className="pb-8 pt-4">
        {punten.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-3xl mb-3">✅</p>
            <p className="text-gray-600 font-medium">Geen NOK-punten</p>
            <p className="text-gray-400 text-sm mt-1">
              Voeg een punt toe als er iets niet in orde is.
            </p>
          </div>
        ) : zichtbarePunten.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            Geen NOK-punten voor deze filter.
          </p>
        ) : (
          <NokPuntenLijst punten={zichtbarePunten} verantwoordelijkeModus={verantwoordelijkeModus} />
        )}
      </div>

      {notificatiesOpen && (
        <VerstuurNotificatiesModaal
          verslagId={verslagId}
          verslagNaam={verslagNaam}
          aanwezigen={aanwezigen}
          onSluit={() => setNotificatiesOpen(false)}
        />
      )}
    </>
  );
}
