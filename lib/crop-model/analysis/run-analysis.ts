import { analyzeImageColors } from "@/lib/crop-model/analysis/color-analysis";
import { classifyDisease } from "@/lib/crop-model/analysis/disease-classification";
import { validateClassification } from "@/lib/crop-model/analysis/validation";
import {
  computeHealthScore,
  deriveRiskLevel,
  deriveSeverity,
  pickHealthLabel,
} from "@/lib/crop-model/analysis/health-scoring";
import { computeConfidence } from "@/lib/crop-model/analysis/confidence";
import {
  displayDiseaseName,
  generateRecommendation,
} from "@/lib/crop-model/analysis/recommendations";
import type { ImageAnalysisProfile } from "@/lib/crop-model/analysis/types";
import type {
  AnalysisUiVariant,
  CropAnalysisResult,
  ModelPrediction,
} from "@/lib/crop-model/types";
import { CROP_CLASSES } from "@/lib/crop-model/analysis/types";

function deriveUiVariant(
  isHealthy: boolean,
  healthScore: number,
): AnalysisUiVariant {
  if (isHealthy) return "healthy";
  if (healthScore < 45) return "critical";
  if (healthScore < 65) return "warning";
  return "caution";
}

/** Build final dashboard result from an image profile (no re-read of pixels). */
export function buildEngineResult(
  profile: ImageAnalysisProfile,
): CropAnalysisResult {
  const raw = classifyDisease(profile);
  const validated = validateClassification(profile, raw);
  const topProbability =
    validated.probabilities[CROP_CLASSES.indexOf(validated.label)] ?? 0.5;

  const healthScore = computeHealthScore(
    validated.label,
    profile,
    validated.decisionMargin,
  );
  const confidence = computeConfidence(
    profile,
    validated.decisionMargin,
    topProbability,
  );
  const isHealthy = validated.label === "Healthy";
  const { recommendation, alertPriority } = generateRecommendation(
    validated.label,
    profile,
    healthScore,
  );

  return {
    disease: displayDiseaseName(validated.label),
    classLabel: validated.label,
    healthScore,
    riskLevel: deriveRiskLevel(validated.label, healthScore),
    severity: deriveSeverity(validated.label, healthScore),
    confidence,
    healthLabel: pickHealthLabel(validated.label, healthScore),
    recommendation,
    alertPriority,
    uiVariant: deriveUiVariant(isHealthy, healthScore),
    isHealthy,
  };
}

/** Full frontend crop analysis pipeline */
export async function runCropImageAnalysis(
  image: HTMLImageElement,
): Promise<CropAnalysisResult> {
  try {
    const profile = await analyzeImageColors(image);
    return buildEngineResult(profile);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Crop image analysis failed";
    throw new Error(message);
  }
}

export function engineResultToModelPrediction(
  analysis: CropAnalysisResult,
  profile: ImageAnalysisProfile,
): ModelPrediction {
  const probabilities = CROP_CLASSES.map((className) => {
    if (className === analysis.classLabel) {
      return analysis.confidence / 100;
    }
    return (1 - analysis.confidence / 100) / (CROP_CLASSES.length - 1);
  });

  return {
    className: analysis.classLabel,
    probability: analysis.confidence / 100,
    predictions: CROP_CLASSES.map((className, i) => ({
      className,
      probability: probabilities[i],
    })).sort((a, b) => b.probability - a.probability),
    features: profile,
    analysis,
  };
}
