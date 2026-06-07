"use client";

import { useMemo, useState } from "react";
import { TijdlijnSVG, TijdlijnVerslagItem, ZoomNiveau } from "@/components/TijdlijnSVG";
import { BekijkNokPuntModaal, NokPuntDetail } from "@/components/BekijkNokPuntModaal";
import { NokPuntData } from "@/components/NokPuntenLijst";
import { berekenStatus } from "@/lib/status";

interface VerslagBasis {
  id: string;
  datum: string;
  nokPunten: NokPuntData[];
}

interface VerslagDetail {
  id: string;
  verslaggever: string;
  datum: string;
  deelnemers: { id: string; naam: string; discipline: string; aanwezig: boolean }[];
}

interface Props {
  verslagen: VerslagBasis[];
  startdatum?: string | null;
  projectNaam: string;
  verantwoordelijkeModus?: boolean;
}

const ZOOM_LABELS: { waarde: ZoomNiveau; label: string }[] = [
  { waarde: "week", label: "Week" },
  { waarde: "2weken", label: "2w" },
  { waarde: "maand", label: "Maand" },
];

export function TijdlijnSectie({ verslagen, startdatum, projectNaam, verantwoordelijkeModus = false }: Props) {
  const [filterVerantwoordelijke, setFilterVerantwoordelijke] = useState("");
  const [filterStatus, setFilterStatus] = useState("alle");
  const [filterDiscipline, setFilterDiscipline] = useState("alle");
  const [zoom, setZoom] = useState<ZoomNiveau>("week");
  const [teBekijken, setTeBekijken] = useState<NokPuntDetail | null>(null);

  // Verslag-selectie voor Gantt
  const [geselecteerdVerslagId, setGeselecteerdVerslagId] = useState<string | null>(null);
  const [verslagModaal, setVerslagModaal] = useState<VerslagDetail | null>(null);

  const allePunten = useMemo(() => verslagen.flatMap((v) => v.nokPunten), [verslagen]);

  const verantwoordelijken = useMemo(() =>
    Array.from(new Set(allePunten.map((p) => p.verantwoordelijkeNaam))).sort(),
    [allePunten]);

  const disciplines = useMemo(() =>
    Array.from(new Set(allePunten.map((p) => p.discipline))).sort(),
    [allePunten]);

  const gefilterd: TijdlijnVerslagItem[] = useMemo(() => {
    return verslagen.map((v) => ({
      id: v.id,
      datum: v.datum,
      nokPunten: v.nokPunten
        .filter((p) => {
          if (filterVerantwoordelijke && p.verantwoordelijkeNaam !== filterVerantwoordelijke) return false;
          if (filterDiscipline !== "alle" && p.discipline !== filterDiscipline) return false;
          if (filterStatus !== "alle") {
            const status = berekenStatus(new Date(p.deadline), p.status);
            if (status !== filterStatus) return false;
          }
          return true;
        })
        .sort((a, b) => {
          const d = a.discipline.localeCompare(b.discipline);
          return d !== 0 ? d : a.id.localeCompare(b.id);
        })
        .map((p) => ({ id: p.id, titel: p.titel, discipline: p.discipline, deadline: p.deadline, status: p.status, verslagId: p.verslagId, verslagDatum: v.datum })),
    }));
  }, [verslagen, filterVerantwoordelijke, filterStatus, filterDiscipline]);

  async function bekijkNok(nokId: string, verslagId: string) {
    // Altijd het bijhorende verslag selecteren + modaal openen
    setGeselecteerdVerslagId(verslagId);
    const res = await fetch(`/api/nok-punten/${nokId}`);
    const data = await res.json();
    setTeBekijken(data as NokPuntDetail);
  }

  async function handleVerslagKlik(verslagId: string) {
    if (geselecteerdVerslagId === verslagId) {
      // Tweede klik op hetzelfde verslag: open verslagmodaal
      const res = await fetch(`/api/verslagen/${verslagId}`);
      const data = await res.json();
      setVerslagModaal(data as VerslagDetail);
    } else {
      // Eerste klik: selecteer verslag
      setGeselecteerdVerslagId(verslagId);
    }
  }

  const filterActief = filterVerantwoordelijke !== "" || filterStatus !== "alle" || filterDiscipline !== "alle";

  return (
    <div className="flex flex-col gap-3">
      {/* Filterbalk + zoom */}
      {allePunten.length > 0 && (
        <div className="flex gap-2 flex-wrap items-center justify-between">
          <div className="flex gap-2 flex-wrap items-center">
            <select value={filterVerantwoordelijke} onChange={(e) => setFilterVerantwoordelijke(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Iedereen</option>
              {verantwoordelijken.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>

            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="alle">Alle statussen</option>
              <option value="open">Open</option>
              <option value="bijna-deadline">Bijna deadline</option>
              <option value="voorbij-deadline">Voorbij deadline</option>
              <option value="wacht-op-goedkeuring">Wacht op goedkeuring</option>
              <option value="opgelost">Opgelost</option>
            </select>

            <select value={filterDiscipline} onChange={(e) => setFilterDiscipline(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="alle">Alle disciplines</option>
              {disciplines.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>

            {filterActief && (
              <button onClick={() => { setFilterVerantwoordelijke(""); setFilterStatus("alle"); setFilterDiscipline("alle"); }}
                className="text-xs text-gray-500 hover:text-gray-700 underline">
                Wissen
              </button>
            )}

            {/* Selectie-badge */}
            {geselecteerdVerslagId && (
              <button
                onClick={() => setGeselecteerdVerslagId(null)}
                className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors"
              >
                Verslag geselecteerd ✕
              </button>
            )}
          </div>

          {/* Zoom knoppen */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
            {ZOOM_LABELS.map(({ waarde, label }) => (
              <button
                key={waarde}
                type="button"
                onClick={() => setZoom(waarde)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${zoom === waarde ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <TijdlijnSVG
        verslagen={gefilterd}
        startdatum={startdatum}
        projectNaam={projectNaam}
        zoom={zoom}
        verslaggeVerModus={!verantwoordelijkeModus}
        geselecteerdVerslagId={geselecteerdVerslagId}
        onBekijkNok={bekijkNok}
        onVerslagKlik={handleVerslagKlik}
        onDeselecteer={() => setGeselecteerdVerslagId(null)}
      />

      {teBekijken && (
        <BekijkNokPuntModaal
          punt={teBekijken}
          verantwoordelijkeModus={verantwoordelijkeModus}
          onSluit={() => setTeBekijken(null)}
        />
      )}

      {/* Verslag-modaal */}
      {verslagModaal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 py-8"
          onClick={() => setVerslagModaal(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Werfverslag van {new Date(verslagModaal.datum).toLocaleDateString("nl-BE", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">Verslaggever: {verslagModaal.verslaggever}</p>
              </div>
              <button onClick={() => setVerslagModaal(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>

            <div className="p-5">
              {verslagModaal.deelnemers.filter((d) => d.aanwezig).length > 0 ? (
                <>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Aanwezigen</p>
                  <div className="flex flex-col gap-1">
                    {verslagModaal.deelnemers.filter((d) => d.aanwezig).map((d) => (
                      <p key={d.id} className="text-sm text-gray-700">
                        <span className="font-medium">{d.naam}</span>
                        <span className="text-gray-400"> — {d.discipline}</span>
                      </p>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-400">Geen aanwezigen geregistreerd.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
