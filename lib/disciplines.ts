export const DISCIPLINES = [
  "Ruwbouw",
  "Dak",
  "Buitenschrijnwerk",
  "Binnenschrijnwerk",
  "Gyproc / Plafond",
  "Bepleistering",
  "Vloerwerken",
  "Schilderwerken",
  "Elektriciteit",
  "HVAC",
  "Ventilatie",
  "Sanitair",
  "Verlichting",
  "Andere",
] as const;

export type Discipline = (typeof DISCIPLINES)[number];
