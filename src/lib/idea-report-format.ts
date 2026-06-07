// Deterministic helpers to display "single, credible" economic numbers
// derived from the existing min/max stored on idea_calculator_runs.
// Same idea_hash → same numbers across refreshes.

function hashSeed(hash: string | null | undefined): number {
  const s = (hash ?? "").trim();
  if (!s) return 0;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) >>> 0;
}

/** Round to nearest 10 and avoid "too round" multiples of 100 (e.g. 1000, 1500). */
function deRound(value: number, seed: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  let v = Math.round(value / 10) * 10;
  if (v % 100 === 0) {
    // Choose a deterministic non-round offset in tens (30, 50, 70, 80, 120, 150, 180, 220, 250, 320).
    const candidates = [30, 50, 70, 80, 120, 150, 180, 220, 250, 320];
    const off = candidates[seed % candidates.length];
    v = v >= 1000 ? v + off : v + (off % 100); // keep small values realistic
  }
  return v;
}

/**
 * Picks a single "realistic" monthly potential from a [min,max] range,
 * biased toward the upper-middle of the range (≈ 60%).
 */
export function singleMonthlyPotential(
  min: number | null | undefined,
  max: number | null | undefined,
  hash: string | null | undefined,
): number | null {
  const lo = min ?? 0;
  const hi = max ?? 0;
  if (hi <= 0) return null;
  const seed = hashSeed(hash);
  const ratio = 0.55 + ((seed % 21) / 100); // 0.55..0.75
  const base = lo + (hi - lo) * ratio;
  // Avoid trivially small values.
  const floored = Math.max(base, Math.max(lo, hi * 0.4));
  return deRound(floored, seed);
}

/** Single "traditional development cost" with a non-round look. */
export function singleTraditionalCost(
  value: number | null | undefined,
  hash: string | null | undefined,
): number | null {
  if (value == null || value <= 0) return null;
  return deRound(value, hashSeed(hash) ^ 0x9e3779b9);
}

/** Savings = traditionalCost - teamAiPrice (floor 0). */
export function singleSavings(
  traditional: number | null | undefined,
  teamAiPrice: number | null | undefined,
): number | null {
  if (traditional == null) return null;
  const price = teamAiPrice ?? 29;
  const diff = traditional - price;
  return diff > 0 ? diff : null;
}

/** Make a short, human title from a free-text idea. */
export function projectTitleFromIdea(idea: string | null | undefined): string {
  const raw = (idea ?? "").trim();
  if (!raw) return "Il tuo progetto";
  // First sentence, capped.
  const first = raw.split(/[.\n!?]/)[0].trim();
  const base = first.length > 0 ? first : raw;
  const cleaned = base
    .replace(/^(vorrei|voglio|mi piacerebbe|sto pensando di|ho un['’]idea(?: per)?|idea per)\s+/i, "")
    .replace(/^(creare|costruire|fare|sviluppare|realizzare)\s+(una|un['’]?|uno|il|la|lo|gli|le|dei|degli|delle)?\s*/i, "")
    .trim();
  const truncated = cleaned.length > 60 ? cleaned.slice(0, 57).trimEnd() + "…" : cleaned;
  return truncated.charAt(0).toUpperCase() + truncated.slice(1);
}