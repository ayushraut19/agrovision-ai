import type { AlertPriority } from "@/lib/dashboard-data";

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export type AnalysisUiVariant = "healthy" | "caution" | "warning" | "critical";

import type { ImageFeatures } from "@/lib/crop-model/image-features";

export type ModelPrediction = {
  className: string;
  probability: number;
  predictions: { className: string; probability: number }[];
  features?: ImageFeatures;
  /** Present when using the built-in analysis engine */
  analysis?: CropAnalysisResult;
};

export type CropAnalysisResult = {
  disease: string;
  classLabel: string;
  healthScore: number;
  riskLevel: RiskLevel;
  severity: string;
  confidence: number;
  healthLabel: string;
  recommendation: string;
  alertPriority: AlertPriority;
  uiVariant: AnalysisUiVariant;
  isHealthy: boolean;
};

export type CropModel = {
  readonly kind: "mock" | "teachable-machine";
  predict: (image: HTMLImageElement) => Promise<ModelPrediction>;
  dispose: () => void;
};
