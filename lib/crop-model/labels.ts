import type { CropAnalysisResult } from "@/lib/crop-model/types";
import type { ImageAnalysisProfile } from "@/lib/crop-model/analysis/color-analysis";
import {
  buildEngineResult,
} from "@/lib/crop-model/analysis/run-analysis";
import {
  CROP_CLASSES,
  type CropClassLabel,
} from "@/lib/crop-model/analysis/types";
import type { RiskLevel } from "@/lib/crop-model/types";

export { CROP_CLASSES };
export type TMClassLabel = CropClassLabel;
export const TM_CLASS_LABELS = CROP_CLASSES;

export function mapPredictionToAnalysis(
  className: string,
  probability: number,
  features: ImageAnalysisProfile,
  allProbabilities: number[],
): CropAnalysisResult {
  void className;
  void probability;
  void allProbabilities;
  return buildEngineResult(features);
}

export function normalizeClassLabel(label: string): CropClassLabel {
  const cleaned = label.trim().replace(/\s+/g, "_");
  const aliases: Record<string, CropClassLabel> = {
    Healthy: "Healthy",
    Leaf_Blight: "Leaf_Blight",
    LeafBlight: "Leaf_Blight",
    Early_Blight: "Leaf_Blight",
    Early_Leaf_Blight: "Leaf_Blight",
    Late_Blight: "Severe_Infection",
    LateBlight: "Severe_Infection",
    Rust: "Rust_Disease",
    Rust_Disease: "Rust_Disease",
    Leaf_Spot: "Leaf_Blight",
    LeafSpot: "Leaf_Blight",
    Nutrient_Deficiency: "Nutrient_Deficiency",
    NutrientDeficiency: "Nutrient_Deficiency",
    Severe_Infection: "Severe_Infection",
    SevereInfection: "Severe_Infection",
  };

  if (cleaned in aliases) return aliases[cleaned];

  const match = CROP_CLASSES.find(
    (c) => c.toLowerCase() === cleaned.toLowerCase(),
  );
  return match ?? "Leaf_Blight";
}

export function riskLevelAccent(risk: RiskLevel): string {
  switch (risk) {
    case "Low":
      return "text-green-400";
    case "Medium":
      return "text-yellow-400";
    case "High":
      return "text-orange-400";
    case "Critical":
      return "text-red-400";
  }
}
