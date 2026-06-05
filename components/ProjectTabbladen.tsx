"use client";

import { useState } from "react";
import Link from "next/link";
import { WerfverslagKaartLijst } from "@/components/WerfverslagKaartLijst";
import { StatusLegende } from "@/components/StatusLegende";
import { TijdlijnSectie } from "@/components/TijdlijnSectie";
import { NokPuntData } from "@/components/NokPuntenLijst";
import { NokStatus } from "@/lib/status";

interface VerslagKaartData {
  id: string;
  datum: string;
  verslaggever: string;
  projectId: string;
  aantalPunten: number;
  tellers: Record<NokStatus, number>;
}

interface VerslagTijdlijnData {
  id: string;
  datum: string;
  nokPunten: NokPuntData[];
}

interface Props {
  projectId: string;
  verslagenKaart: VerslagKaartData[];
  verslagenTijdlijn: VerslagTijdlijnData[];
  projectNaam: string;
  startdatum?: string | null;
}

export function ProjectTabbladen({
  projectId,
  verslagenKaart,
  verslagenTijdlijn,
  projectNaam,
  startdatum,
}: Props) {
  const [weergave, setWeergave] = useState<"verslagen" | "tijdlijn">("verslagen");

  return (
    <>
      {/* Header met tabbladen */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-gray-900">
            Werfverslagen{" "}
            <span className="text-gray-400 font-normal text-sm">
              ({verslagenKaart.length})
            </span>
          </h2>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setWeergave("verslagen")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${weergave === "verslagen" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Lijst
            </button>
            <button
              type="button"
              onClick={() => setWeergave("tijdlijn")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${weergave === "tijdlijn" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Tijdlijn
            </button>
          </div>
        </div>
        <Link
          href={`/project/${projectId}/verslag/nieuw`}
          className="inline-flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Nieuw werfverslag
        </Link>
      </div>

      {weergave === "verslagen" && (
        <>
          {verslagenKaart.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <p className="text-3xl mb-3">📋</p>
              <p className="text-gray-600 font-medium">Nog geen werfverslagen</p>
              <p className="text-gray-400 text-sm mt-1">Maak een werfverslag aan voor dit project.</p>
            </div>
          ) : (
            <>
              <WerfverslagKaartLijst verslagen={verslagenKaart} />
              <div className="mt-6 pt-4 border-t border-gray-200">
                <StatusLegende />
              </div>
            </>
          )}
        </>
      )}

      {weergave === "tijdlijn" && (
        <TijdlijnSectie
          verslagen={verslagenTijdlijn}
          startdatum={startdatum}
          projectNaam={projectNaam}
        />
      )}
    </>
  );
}
