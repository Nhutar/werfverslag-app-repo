import { STATUS_DOT, STATUS_LABELS, NokStatus } from "@/lib/status";

const VOLGORDE: NokStatus[] = [
  "voorbij-deadline",
  "bijna-deadline",
  "open",
  "opgelost",
];

/**
 * Toont altijd alle 4 de statussen als gekleurd bolletje + aantal.
 * Een status met 0 punten wordt gedimd weergegeven, zodat de betekenis
 * altijd duidelijk en consistent blijft.
 */
export function StatusTellers({
  tellers,
}: {
  tellers: Record<NokStatus, number>;
}) {
  return (
    <div className="flex gap-2.5 flex-wrap">
      {VOLGORDE.map((s) => {
        const aantal = tellers[s];
        const actief = aantal > 0;
        return (
          <span
            key={s}
            title={STATUS_LABELS[s]}
            className={`inline-flex items-center gap-1.5 text-xs ${
              actief ? "text-gray-700" : "text-gray-300"
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                actief ? STATUS_DOT[s] : "bg-gray-200"
              }`}
            />
            {aantal}
          </span>
        );
      })}
    </div>
  );
}
