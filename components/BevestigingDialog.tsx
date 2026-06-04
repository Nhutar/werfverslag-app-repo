"use client";

export function BevestigingDialog({
  titel,
  bericht,
  waarschuwing,
  bezig,
  onBevestig,
  onAnnuleer,
}: {
  titel: string;
  bericht: string;
  waarschuwing?: string;
  bezig?: boolean;
  onBevestig: () => void;
  onAnnuleer: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
        <h3 className="font-semibold text-gray-900 mb-2">{titel}</h3>
        <p className="text-sm text-gray-600">{bericht}</p>
        {waarschuwing && (
          <p className="text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 mt-3">
            {waarschuwing}
          </p>
        )}
        <div className="flex gap-3 mt-5">
          <button
            onClick={onBevestig}
            disabled={bezig}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {bezig ? "Bezig..." : "Verwijderen"}
          </button>
          <button
            onClick={onAnnuleer}
            disabled={bezig}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Annuleren
          </button>
        </div>
      </div>
    </div>
  );
}
