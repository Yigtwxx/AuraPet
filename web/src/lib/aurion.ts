export type AurionForm = "spark" | "drift" | "glimmer" | "aether" | "nova";

export const FORM_NAMES_EN: Record<AurionForm, string> = {
  spark:   "Spark",
  drift:   "Drift",
  glimmer: "Glimmer",
  aether:  "Aether",
  nova:    "Nova",
};

export const FORM_NAMES_TR: Record<AurionForm, string> = {
  spark:   "Kıvılcım",
  drift:   "Süzgün",
  glimmer: "Parıltı",
  aether:  "Esir",
  nova:    "Nova",
};

export function getForm(level: number): AurionForm {
  if (level <= 1) return "spark";
  if (level === 2) return "drift";
  if (level === 3) return "glimmer";
  if (level === 4) return "aether";
  return "nova";
}
