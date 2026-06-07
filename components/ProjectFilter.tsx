"use client";

import { useState, useMemo } from "react";
import { ProjectKaartLijst } from "@/components/ProjectKaartLijst";
import { NokStatus } from "@/lib/status";

interface ProjectKaart {
  id: string;
  naam: string;
  werfadres: string;
  bouwheer: string | null;
  aantalVerslagen: number;
  aantalPunten: number;
  tellers: Record<NokStatus, number>;
}

export function ProjectFilter({ projecten }: { projecten: ProjectKaart[] }) {
  const [zoek, setZoek] = useState("");
  const [filterStatus, setFilterStatus] = useState("alle");

  const gefilterd = useMemo(() => {
    const zoekLower = zoek.trim().toLowerCase();
    return projecten.filter((p) => {
      // Tekstzoek op naam, adres, bouwheer
      if (zoekLower) {
        const match =
          p.naam.toLowerCase().includes(zoekLower) ||
          p.werfadres.toLowerCase().includes(zoekLower) ||
          (p.bouwheer ?? "").toLowerCase().includes(zoekLower);
        if (!match) return false;
      }
      // Statusfilter
      if (filterStatus === "open") {
        const openTotaal = (p.tellers["open"] ?? 0) + (p.tellers["bijna-deadline"] ?? 0) + (p.tellers["voorbij-deadline"] ?? 0);
        if (openTotaal === 0) return false;
      } else if (filterStatus === "voorbij") {
        if ((p.tellers["voorbij-deadline"] ?? 0) === 0) return false;
      } else if (filterStatus === "opgelost") {
        if (p.aantalPunten === 0 || p.tellers["opgelost"] !== p.aantalPunten) return false;
      }
      return true;
    });
  }, [projecten, zoek, filterStatus]);

  return (
    <div className="flex flex-col gap-4">
      {/* Filterbalk */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            value={zoek}
            onChange={(e) => setZoek(e.target.value)}
            placeholder="Zoek op naam, adres of bouwheer…"
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="alle">Alle projecten</option>
          <option value="open">Met open punten</option>
          <option value="voorbij">Voorbij deadline</option>
          <option value="opgelost">Volledig opgelost</option>
        </select>
        {(zoek || filterStatus !== "alle") && (
          <button
            onClick={() => { setZoek(""); setFilterStatus("alle"); }}
            className="text-sm text-gray-500 hover:text-gray-700 px-2 underline"
          >
            Wissen
          </button>
        )}
      </div>

      {/* Resultaten */}
      {gefilterd.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-400 text-sm">Geen projecten gevonden.</p>
        </div>
      ) : (
        <ProjectKaartLijst projecten={gefilterd} />
      )}

      {gefilterd.length > 0 && gefilterd.length < projecten.length && (
        <p className="text-xs text-gray-400 text-center">
          {gefilterd.length} van {projecten.length} projecten
        </p>
      )}
    </div>
  );
}
