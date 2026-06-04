"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { DrieKnopjesMenu } from "@/components/DrieKnopjesMenu";
import { BevestigingDialog } from "@/components/BevestigingDialog";
import { STATUS_DOT, NokStatus } from "@/lib/status";

interface VerslagKaart {
  id: string;
  naam: string;
  datum: string;
  werfadres: string;
  aantalNokPunten: number;
  tellers: Record<NokStatus, number>;
}

export function VerslagKaartLijst({ verslagen }: { verslagen: VerslagKaart[] }) {
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
          <div key={verslag.id} className="relative group">
            <Link
              href={`/verslag/${verslag.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate pr-8">
                    {verslag.naam}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">{verslag.datum}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {verslag.werfadres}
                  </p>
                </div>
                <div className="flex gap-3 flex-shrink-0 flex-wrap justify-end items-center">
                  {(
                    [
                      "voorbij-deadline",
                      "bijna-deadline",
                      "open",
                      "opgelost",
                    ] as NokStatus[]
                  ).map(
                    (s) =>
                      verslag.tellers[s] > 0 && (
                        <span
                          key={s}
                          className="inline-flex items-center gap-1 text-xs text-gray-600"
                        >
                          <span
                            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${STATUS_DOT[s]}`}
                          />
                          {verslag.tellers[s]}
                        </span>
                      )
                  )}
                  {verslag.aantalNokPunten === 0 && (
                    <span className="text-xs text-gray-400">Geen punten</span>
                  )}
                </div>
              </div>
            </Link>

            {/* 3-puntjes menu — absoluut gepositioneerd bovenop de kaart */}
            <div className="absolute top-4 right-4">
              <DrieKnopjesMenu
                opties={[
                  {
                    label: "Aanpassen",
                    onClick: () => router.push(`/verslag/${verslag.id}/aanpassen`),
                  },
                  {
                    label: "Verwijderen",
                    onClick: () => setTeVerwijderen(verslag),
                    gevaarlijk: true,
                  },
                ]}
              />
            </div>
          </div>
        ))}
      </div>

      {teVerwijderen && (
        <BevestigingDialog
          titel="Verslag verwijderen?"
          bericht={`Ben je zeker dat je "${teVerwijderen.naam}" wil verwijderen?`}
          waarschuwing={
            teVerwijderen.aantalNokPunten > 0
              ? `Dit verslag bevat ${teVerwijderen.aantalNokPunten} NOK-punt${teVerwijderen.aantalNokPunten === 1 ? "" : "en"}. Alle punten en foto's worden ook verwijderd.`
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
