import type { ImageAnalysisProfile } from "@/lib/crop-model/analysis/types";

/**
 * Clearer visual patterns → higher confidence; ambiguous → lower.
 */
export function computeConfidence(
  profile: ImageAnalysisProfile,
  decisionMargin: number,
  topProbability: number,
): number {
  const patternClarity =
    profile.patternStrength * 0.35 +
    decisionMargin * 0.45 +
    topProbability * 0.2;

  const ambiguous =
    profile.dominantColor === "mixed" ||
    decisionMargin < 0.12 ||
    (profile.greenPixelRatio > 0.35 &&
      profile.unhealthyColorRatio > 0.12 &&
      profile.unhealthyColorRatio < 0.22);

  let base: number;
  if (ambiguous) {
    base = 62 + patternClarity * 12;
  } else if (patternClarity > 0.45) {
    base = 86 + patternClarity * 12;
  } else {
    base = 74 + patternClarity * 18;
  }

  const jitter = Math.floor(profile.imageSignature * 1000) % 5;
  return Math.min(98, Math.max(58, Math.round(base + jitter)));
}
