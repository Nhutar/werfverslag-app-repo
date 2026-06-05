import { STATUS_DOT, STATUS_LABELS, NokStatus } from "@/lib/status";

const VOLGORDE: NokStatus[] = [
  "voorbij-deadline",
  "bijna-deadline",
  "open",
  "wacht-op-goedkeuring",
  "opgelost",
];

/** Compacte uitleg van de statuskleuren (voor onderaan een dashboard). */
export function StatusLegende() {
  return (
    <div className="flex gap-x-4 gap-y-1 flex-wrap text-xs text-gray-500">
      {VOLGORDE.map((s) => (
        <span key={s} className="inline-flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${STATUS_DOT[s]}`} />
          {STATUS_LABELS[s]}
        </span>
      ))}
    </div>
  );
}
