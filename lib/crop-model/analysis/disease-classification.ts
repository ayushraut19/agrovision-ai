import {
  CROP_CLASSES,
  type ClassificationResult,
  type CropClassLabel,
  type ImageAnalysisProfile,
} from "@/lib/crop-model/analysis/types";

type ScoreMap = Record<CropClassLabel, number>;

/**
 * Rule-based disease classification from color/texture profile.
 */
export function classifyDisease(
  profile: ImageAnalysisProfile,
): ClassificationResult {
  const scores: ScoreMap = {
    Healthy: scoreHealthy(profile),
    Leaf_Blight: scoreLeafBlight(profile),
    Rust_Disease: scoreRustDisease(profile),
    Nutrient_Deficiency: scoreNutrientDeficiency(profile),
    Severe_Infection: scoreSevereInfection(profile),
  };

  const probabilities = softmaxScores(scores);
  const sorted = CROP_CLASSES.map((label, i) => ({
    label,
    probability: probabilities[i],
    score: scores[label],
  })).sort((a, b) => b.probability - a.probability);

  const top = sorted[0];
  const second = sorted[1];
  const decisionMargin = top.probability - second.probability;

  return {
    label: top.label,
    probabilities,
    scores,
    decisionMargin,
  };
}

export function buildProbabilityDistribution(probabilities: number[]) {
  return CROP_CLASSES.map((className, i) => ({
    className,
    probability: probabilities[i] ?? 0,
  })).sort((a, b) => b.probability - a.probability);
}

function scoreHealthy(p: ImageAnalysisProfile): number {
  const greenScore = softScore(p.greenPixelRatio, 0.55, 0.78);
  const brownYellow = p.brownPatchRatio + p.orangeRustRatio * 0.7 + p.yellowPatchRatio * 0.35;
  const lowColorDamage = 1 - softScore(brownYellow + p.darkLesionRatio, 0.035, 0.12);
  const smooth = 1 - softScore(p.textureIrregularity, 0.08, 0.22);
  const cleanEdges = 1 - softScore(p.edgeDamageRatio, 0.06, 0.22);
  return (
    greenScore * 3 +
    lowColorDamage * 2.6 +
    smooth * 2 +
    cleanEdges * 1.6 -
    p.darkLesionRatio * 5 -
    p.brownPatchRatio * 4 -
    p.orangeRustRatio * 4
  );
}

function scoreLeafBlight(p: ImageAnalysisProfile): number {
  if (p.brownPatchRatio < 0.035 && p.darkLesionRatio < 0.035 && p.edgeDamageRatio < 0.1) return 0;
  const streakLike = p.darkLesionRatio * 1.4 + p.edgeDamageRatio * 0.8;
  return (
    streakLike * 4.5 +
    softScore(p.brownPatchRatio + p.darkLesionRatio, 0.045, 0.24) * 3 +
    softScore(p.textureIrregularity, 0.14, 0.4) * 1.4 +
    p.drynessIndex * 1.5 -
    p.orangeRustRatio * 1.4
  );
}

function scoreRustDisease(p: ImageAnalysisProfile): number {
  if (p.orangeRustRatio < 0.018 && p.brownPatchRatio < 0.05) return 0;
  const clusteredSpots = p.orangeRustRatio * 1.6 + p.brownPatchRatio * p.colorClusterSpread * 5;
  return (
    clusteredSpots * 5 +
    softScore(p.orangeRustRatio + p.brownPatchRatio * 0.58, 0.018, 0.14) * 3 +
    softScore(p.textureIrregularity, 0.1, 0.32) * 1.3 -
    p.darkLesionRatio * 1.2
  );
}

function scoreNutrientDeficiency(p: ImageAnalysisProfile): number {
  if (p.paleRegionRatio < 0.045 && p.yellowPatchRatio < 0.08) return 0;
  if (p.darkLesionRatio > 0.16 || p.brownPatchRatio > 0.18) return 0;
  return (
    softScore(p.paleRegionRatio + p.yellowPatchRatio, 0.1, 0.34) * 4 +
    softScore(1 - p.saturation, 0.42, 0.78) * 2 +
    softScore(p.brightness, 0.42, 0.72) * 1.2 -
    p.brownPatchRatio * 2.4 -
    p.orangeRustRatio * 2
  );
}

function scoreSevereInfection(p: ImageAnalysisProfile): number {
  if (p.darkLesionRatio < 0.08 && p.unhealthyColorRatio < 0.2) return 0;
  const irregular = p.textureIrregularity * p.edgeDamageRatio * 6;
  return (
    p.darkLesionRatio * 5 +
    p.unhealthyColorRatio * 3 +
    irregular * 2.5 +
    p.edgeDamageRatio * 2 +
    clamp01(p.colorClusterSpread - 0.06) * 1.5 -
    p.greenPixelRatio * 2
  );
}

function softmaxScores(scores: ScoreMap): number[] {
  const labels = CROP_CLASSES;
  const raw = labels.map((l) => scores[l]);
  const max = Math.max(...raw, 0.01);
  const exp = raw.map((s) => Math.exp((s - max) * 2.8));
  const sum = exp.reduce((a, b) => a + b, 0);
  return exp.map((e) => e / sum);
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function softScore(value: number, start: number, end: number): number {
  if (start === end) return value >= end ? 1 : 0;
  return clamp01((value - start) / (end - start));
}
