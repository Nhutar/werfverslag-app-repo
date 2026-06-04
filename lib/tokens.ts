import { randomUUID } from "crypto";

/** Genereert een uniek token voor een magic link. */
export function genereerToken(): string {
  return randomUUID();
}

/** Vervaldatum: 30 dagen vanaf nu. */
export function tokenVervaldatum(): Date {
  const datum = new Date();
  datum.setDate(datum.getDate() + 30);
  return datum;
}
