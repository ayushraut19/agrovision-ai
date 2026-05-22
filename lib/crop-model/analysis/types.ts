export const CROP_CLASSES = [
  "Healthy",
  "Leaf_Blight",
  "Rust_Disease",
  "Nutrient_Deficiency",
  "Severe_Infection",
] as const;

export type CropClassLabel = (typeof CROP_CLASSES)[number];

export type DominantColor = "green" | "yellow" | "brown" | "dark" | "mixed";

/** Full profile from frontend image processing pipeline */
export type ImageAnalysisProfile = {
  meanR: number;
  meanG: number;
  meanB: number;
  brightness: number;
  saturation: number;
  dominantColor: DominantColor;
  greenPixelRatio: number;
  brownPatchRatio: number;
  yellowPatchRatio: number;
  orangeRustRatio: number;
  paleRegionRatio: number;
  darkLesionRatio: number;
  unhealthyColorRatio: number;
  drynessIndex: number;
  textureIrregularity: number;
  edgeDamageRatio: number;
  colorClusterSpread: number;
  patternStrength: number;
  imageSignature: number;
};

export type ClassificationResult = {
  label: CropClassLabel;
  probabilities: number[];
  scores: Record<CropClassLabel, number>;
  decisionMargin: number;
};
