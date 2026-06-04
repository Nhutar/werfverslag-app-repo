"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { berekenStatus } from "@/lib/status";

export interface NokPuntData {
  id: string;
  discipline: string;
  omschrijving: string;
  verantwoordelijkeNaam: string;
  deadline: string; // ISO string
  status: string;
  opgelostOp: string | null;
  opgelostDoorNaam: string | null;
  fotoUrls: string[];
}

function NokPuntKaart({ punt }: { punt: NokPuntData }) {
  const status = berekenStatus(new Date(punt.deadline), punt.status);
  const deadline = new Date(punt.deadline).toLocaleDateString("nl-BE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <StatusBadge status={status} />
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {punt.discipline}
        </span>
      </div>
      <p className="text-sm font-medium text-gray-800 mb-2">
        {punt.omschrijving}
      </p>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        <span>
          <span className="font-medium">Verantwoordelijke:</span>{" "}
          {punt.verantwoordelijkeNaam}
        </span>
        <span>
          <span className="font-medium">Deadline:</span> {deadline}
        </span>
      </div>
      {/* Foto thumbnails */}
      {punt.fotoUrls.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {punt.fotoUrls.slice(0, 3).map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Foto ${i + 1}`}
                className="w-14 h-14 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition-opacity"
              />
            </a>
          ))}
          {punt.fotoUrls.length > 3 && (
            <div className="w-14 h-14 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium">
              +{punt.fotoUrls.length - 3}
            </div>
          )}
        </div>
      )}
      {punt.status === "opgelost" && punt.opgelostOp && (
        <p className="text-xs text-green-600 mt-2">
          Opgelost op {new Date(punt.opgelostOp).toLocaleDateString("nl-BE")}
          {punt.opgelostDoorNaam && ` door ${punt.opgelostDoorNaam}`}
        </p>
      )}
    </div>
  );
}

export function NokPuntenLijst({ punten }: { punten: NokPuntData[] }) {
  const [opgelostOpen, setOpgelostOpen] = useState(false);

  // Volgorde van toevoegen behouden (komt al gesorteerd binnen)
  const openPunten = punten.filter((p) => p.status !== "opgelost");
  const opgelostePunten = punten.filter((p) => p.status === "opgelost");

  return (
    <div className="flex flex-col gap-3">
      {/* Open punten */}
      {openPunten.map((punt) => (
        <NokPuntKaart key={punt.id} punt={punt} />
      ))}

      {openPunten.length === 0 && opgelostePunten.length > 0 && (
        <p className="text-sm text-gray-400 text-center py-2">
          Alle punten zijn opgelost 🎉
        </p>
      )}

      {/* Opgeloste punten — inklapbare sectie */}
      {opgelostePunten.length > 0 && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setOpgelostOpen(!opgelostOpen)}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 w-full"
          >
            <span
              className={`transition-transform ${
                opgelostOpen ? "rotate-90" : ""
              }`}
            >
              ▶
            </span>
            Opgelost ({opgelostePunten.length})
          </button>

          {opgelostOpen && (
            <div className="flex flex-col gap-3 mt-3">
              {opgelostePunten.map((punt) => (
                <NokPuntKaart key={punt.id} punt={punt} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
