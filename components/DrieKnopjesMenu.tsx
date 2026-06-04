"use client";

import { useEffect, useRef, useState } from "react";

interface Optie {
  label: string;
  onClick: () => void;
  gevaarlijk?: boolean;
}

export function DrieKnopjesMenu({ opties }: { opties: Optie[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function sluit(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", sluit);
    return () => document.removeEventListener("mousedown", sluit);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors text-base leading-none"
        aria-label="Meer opties"
      >
        ···
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-50 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[140px] py-1">
          {opties.map((optie) => (
            <button
              key={optie.label}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(false);
                optie.onClick();
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                optie.gevaarlijk ? "text-red-600" : "text-gray-700"
              }`}
            >
              {optie.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
