import type {
  CropClassLabel,
  ImageAnalysisProfile,
} from "@/lib/crop-model/analysis/types";

export type HealthTier = "healthy" | "moderate" | "severe";

export function getHealthTier(label: CropClassLabel): HealthTier {
  if (label === "Healthy") return "healthy";
  if (label === "Severe_Infection") return "severe";
  return "moderate";
}

export function computeHealthScore(
  label: CropClassLabel,
  profile: ImageAnalysisProfile,
  decisionMargin: number,
): number {
  void decisionMargin;

  const greenScore = softScore(profile.greenPixelRatio, 0.34, 0.74);
  const brownScore = softScore(
    profile.brownPatchRatio +
      profile.orangeRustRatio * 0.7 +
      profile.yellowPatchRatio * 0.35,
    0.035,
    0.22,
  );
  const darkDamage = softScore(
    profile.darkLesionRatio + profile.edgeDamageRatio * 0.16,
    0.025,
    0.22,
  );
  const textureDamage = softScore(
    profile.textureIrregularity + profile.edgeDamageRatio * 0.35,
    0.1,
    0.46,
  );

  const weightedHealth = roundClamp(
    55 +
      greenScore * 45 -
      brownScore * 25 -
      darkDamage * 20 -
      textureDamage * 10,
  );

  if (label === "Healthy") return clampRound(weightedHealth, 85, 98);
  if (label === "Leaf_Blight") return clampRound(weightedHealth, 30, 65);
  if (label === "Rust_Disease") return clampRound(weightedHealth, 45, 75);
  if (label === "Nutrient_Deficiency") return clampRound(weightedHealth, 55, 80);
  return clampRound(weightedHealth, 25, 50);
}

export function deriveSeverity(
  label: CropClassLabel,
  healthScore: number,
): string {
  if (label === "Healthy") return "Low";
  if (healthScore < 40 || label === "Severe_Infection") return "Severe";
  if (healthScore < 58) return "Moderate";
  return "Mild";
}

export function deriveRiskLevel(
  label: CropClassLabel,
  healthScore: number,
): "Low" | "Medium" | "High" | "Critical" {
  if (label === "Healthy") return "Low";
  if (label === "Severe_Infection" || healthScore < 40) return "Critical";
  if (healthScore < 58) return "High";
  return "Medium";
}

export function pickHealthLabel(
  label: CropClassLabel,
  healthScore: number,
): string {
  if (label === "Healthy") {
    if (healthScore >= 94) return "Excellent - crop appears thriving";
    if (healthScore >= 88) return "Very good - maintain current care plan";
    return "Good - continue routine monitoring";
  }
  if (healthScore < 40) return "Critical - immediate intervention required";
  if (healthScore < 58) return "At risk - treatment recommended soon";

  const labels: Partial<Record<CropClassLabel, string>> = {
    Leaf_Blight: "Leaf blight signs - treat within 24-48 hours",
    Rust_Disease: "Rust detected - apply fungicide and improve airflow",
    Nutrient_Deficiency: "Nutrient stress - adjust fertilization plan",
    Severe_Infection: "Severe infection - isolate affected plants",
  };
  return labels[label] ?? "Monitor closely and follow recommendation";
}

function softScore(value: number, start: number, end: number): number {
  if (start === end) return value >= end ? 1 : 0;
  return Math.max(0, Math.min(1, (value - start) / (end - start)));
}

function roundClamp(n: number): number {
  return Math.max(25, Math.min(99, Math.round(n)));
}

function clampRound(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}
