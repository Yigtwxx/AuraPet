import { describe, it, expect } from "vitest";
import { getForm, FORM_NAMES_TR, FORM_NAMES_EN } from "../aurion";

describe("getForm", () => {
  it("level 1 → spark", () => expect(getForm(1)).toBe("spark"));
  it("level 2 → drift",  () => expect(getForm(2)).toBe("drift"));
  it("level 3 → glimmer",() => expect(getForm(3)).toBe("glimmer"));
  it("level 4 → aether", () => expect(getForm(4)).toBe("aether"));
  it("level 5 → nova",   () => expect(getForm(5)).toBe("nova"));

  it("level 0 (alt sınır) → spark",  () => expect(getForm(0)).toBe("spark"));
  it("level 99 (üst sınır) → nova",  () => expect(getForm(99)).toBe("nova"));
  it("negatif level → spark",         () => expect(getForm(-1)).toBe("spark"));
});

describe("FORM_NAMES_TR", () => {
  it("spark → Kıvılcım", () => expect(FORM_NAMES_TR.spark).toBe("Kıvılcım"));
  it("nova  → Nova",     () => expect(FORM_NAMES_TR.nova).toBe("Nova"));
});

describe("FORM_NAMES_EN", () => {
  it("glimmer → Glimmer", () => expect(FORM_NAMES_EN.glimmer).toBe("Glimmer"));
  it("aether  → Aether",  () => expect(FORM_NAMES_EN.aether).toBe("Aether"));
});
