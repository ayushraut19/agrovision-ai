import type {
  ClassificationResult,
  CropClassLabel,
  ImageAnalysisProfile,
} from "@/lib/crop-model/analysis/types";
import { CROP_CLASSES } from "@/lib/crop-model/analysis/types";

const HEALTHY_GREEN_MIN = 0.58;
const HEALTHY_BROWN_MAX = 0.08;
const HEALTHY_YELLOW_MAX = 0.12;
const HEALTHY_DARK_MAX = 0.07;
const HEALTHY_TEXTURE_MAX = 0.2;
const HEALTHY_EDGE_MAX = 0.22;
const FORCE_DISEASE_BROWN_MIN = 0.08;
const FORCE_DISEASE_ORANGE_MIN = 0.035;
const FORCE_DISEASE_DARK_MIN = 0.1;
const FORCE_DISEASE_EDGE_MIN = 0.26;
const FORCE_SEVERE_DARK_MIN = 0.16;
const FORCE_SEVERE_UNHEALTHY_MIN = 0.28;

export function validateClassification(
  profile: ImageAnalysisProfile,
  result: ClassificationResult,
): ClassificationResult {
  let label = result.label;

  if (mustBeHealthy(profile)) {
    label = "Healthy";
  } else if (mustNotBeHealthy(profile)) {
    if (label === "Healthy") {
      label = pickBestDisease(profile, result.scores);
    }
  }

  if (mustBeSevere(profile) && label === "Healthy") {
    label = "Severe_Infection";
  } else if (mustBeSevere(profile) && isModerateOnly(label)) {
    if (result.scores.Severe_Infection > result.scores[label] * 0.85) {
      label = "Severe_Infection";
    }
  }

  const probabilities = rebuildProbabilities(label, result.scores);
  const sorted = [...probabilities].sort((a, b) => b - a);
  const decisionMargin = sorted[0] - (sorted[1] ?? 0);

  return { ...result, label, probabilities, decisionMargin };
}

function mustBeHealthy(p: ImageAnalysisProfile): boolean {
  return (
    p.greenPixelRatio >= HEALTHY_GREEN_MIN &&
    p.brownPatchRatio < HEALTHY_BROWN_MAX &&
    p.orangeRustRatio < FORCE_DISEASE_ORANGE_MIN &&
    p.yellowPatchRatio < HEALTHY_YELLOW_MAX &&
    p.darkLesionRatio <= HEALTHY_DARK_MAX &&
    p.textureIrregularity <= HEALTHY_TEXTURE_MAX &&
    p.edgeDamageRatio <= HEALTHY_EDGE_MAX &&
    p.meanG > p.meanR &&
    p.dominantColor === "green"
  );
}

function mustNotBeHealthy(p: ImageAnalysisProfile): boolean {
  return (
    p.brownPatchRatio >= FORCE_DISEASE_BROWN_MIN ||
    p.orangeRustRatio >= FORCE_DISEASE_ORANGE_MIN ||
    p.darkLesionRatio >= FORCE_DISEASE_DARK_MIN ||
    p.edgeDamageRatio >= FORCE_DISEASE_EDGE_MIN ||
    (p.brownPatchRatio >= 0.055 && p.textureIrregularity > 0.12) ||
    (p.yellowPatchRatio + p.paleRegionRatio >= 0.16 && p.saturation < 0.3)
  );
}

function mustBeSevere(p: ImageAnalysisProfile): boolean {
  return (
    p.darkLesionRatio >= FORCE_SEVERE_DARK_MIN &&
    p.unhealthyColorRatio >= FORCE_SEVERE_UNHEALTHY_MIN &&
    p.textureIrregularity > 0.12
  );
}

function isModerateOnly(label: CropClassLabel): boolean {
  return (
    label === "Leaf_Blight" ||
    label === "Rust_Disease" ||
    label === "Nutrient_Deficiency"
  );
}

function pickBestDisease(
  profile: ImageAnalysisProfile,
  scores: Record<CropClassLabel, number>,
): CropClassLabel {
  const diseaseLabels = CROP_CLASSES.filter((c) => c !== "Healthy");
  if (mustBeSevere(profile)) return "Severe_Infection";

  let best: CropClassLabel = "Leaf_Blight";
  let bestScore = -Infinity;
  for (const label of diseaseLabels) {
    if (scores[label] > bestScore) {
      bestScore = scores[label];
      best = label;
    }
  }
  return best;
}

function rebuildProbabilities(
  winner: CropClassLabel,
  scores: Record<CropClassLabel, number>,
): number[] {
  const boosted = { ...scores, [winner]: scores[winner] + 3 };
  const max = Math.max(...CROP_CLASSES.map((l) => boosted[l]), 0.01);
  const exp = CROP_CLASSES.map((l) => Math.exp((boosted[l] - max) * 2.5));
  const sum = exp.reduce((a, b) => a + b, 0);
  return exp.map((e) => e / sum);
}
