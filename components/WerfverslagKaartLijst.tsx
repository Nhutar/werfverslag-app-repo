"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { BevestigingDialog } from "@/components/BevestigingDialog";
import { StatusTellers } from "@/components/StatusTellers";
import { NokStatus } from "@/lib/status";

interface VerslagKaart {
  id: string;
  datum: string;
  verslaggever: string;
  projectId: string;
  aantalPunten: number;
  tellers: Record<NokStatus, number>;
}

export function WerfverslagKaartLijst({ verslagen }: { verslagen: VerslagKaart[] }) {
  const router = useRouter();
  const [teVerwijderen, setTeVerwijderen] = useState<VerslagKaart | null>(null);
  const [bezig, setBezig] = useState(false);

  async function verwijder(verslag: VerslagKaart) {
    setBezig(true);
    await fetch(`/api/verslagen/${verslag.id}`, { method: "DELETE" });
    setTeVerwijderen(null);
    setBezig(false);
    router.refresh();
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {verslagen.map((verslag) => (
          <div key={verslag.id} className="relative">
            <Link
              href={`/verslag/${verslag.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="pr-20">
                <p className="font-semibold text-gray-900">Werfverslag van {verslag.datum}</p>
                <p className="text-sm text-gray-500 mt-0.5">Verslaggever: {verslag.verslaggever}</p>
              </div>
              <div className="mt-3 flex justify-end">
                {verslag.aantalPunten === 0 ? (
                  <span className="text-xs text-gray-400">Geen punten</span>
                ) : (
                  <StatusTellers tellers={verslag.tellers} />
                )}
              </div>
            </Link>

            <div className="absolute top-4 right-4 flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => router.push(`/verslag/${verslag.id}/aanpassen`)}
                className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors text-sm"
                title="Aanpassen"
              >
                ✏️
              </button>
              <button
                onClick={() => setTeVerwijderen(verslag)}
                className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors text-sm"
                title="Verwijderen"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {teVerwijderen && (
        <BevestigingDialog
          titel="Werfverslag verwijderen?"
          bericht={`Ben je zeker dat je het werfverslag van ${teVerwijderen.datum} wil verwijderen?`}
          waarschuwing={
            teVerwijderen.aantalPunten > 0
              ? `Dit verslag bevat ${teVerwijderen.aantalPunten} NOK-punt${teVerwijderen.aantalPunten === 1 ? "" : "en"}. Alles wordt mee verwijderd.`
              : undefined
          }
          bezig={bezig}
          onBevestig={() => verwijder(teVerwijderen)}
          onAnnuleer={() => setTeVerwijderen(null)}
        />
      )}
    </>
  );
}
