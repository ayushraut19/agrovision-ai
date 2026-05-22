import type { CropClassLabel } from "@/lib/crop-model/analysis/types";
import type { ImageAnalysisProfile } from "@/lib/crop-model/analysis/types";
import type { AlertPriority } from "@/lib/dashboard-data";

const BASE: Record<
  CropClassLabel,
  { text: string; priority: AlertPriority }
> = {
  Healthy: {
    text: "Maintain balanced NPK feeding and consistent irrigation. Re-scan in 7 days to confirm sustained vigor.",
    priority: "Low",
  },
  Leaf_Blight: {
    text: "Apply copper-based or chlorothalonil fungicide within 24 hours. Remove infected lower leaves and switch to drip irrigation to keep foliage dry.",
    priority: "High",
  },
  Rust_Disease: {
    text: "Apply sulfur or triazole fungicide at the first sign of pustules. Increase row spacing for airflow and avoid field work when leaves are wet.",
    priority: "Medium",
  },
  Nutrient_Deficiency: {
    text: "Soil-test and apply balanced nitrogen with micronutrients (especially zinc/iron). Adjust pH if needed and monitor new growth over 10–14 days.",
    priority: "Medium",
  },
  Severe_Infection: {
    text: "Isolate affected rows immediately. Remove heavily damaged plants, apply broad-spectrum fungicide today, and improve drainage to lower humidity.",
    priority: "High",
  },
};

export function generateRecommendation(
  label: CropClassLabel,
  profile: ImageAnalysisProfile,
  healthScore: number,
): { recommendation: string; alertPriority: AlertPriority } {
  const base = BASE[label];
  const detail = buildDetail(label, profile, healthScore);
  return {
    recommendation: `${base.text} ${detail}`.trim(),
    alertPriority: base.priority,
  };
}

function buildDetail(
  label: CropClassLabel,
  p: ImageAnalysisProfile,
  healthScore: number,
): string {
  const pct = (n: number) => `${Math.round(n * 100)}%`;

  if (label === "Healthy") {
    return `Scan shows ${pct(p.greenPixelRatio)} green canopy coverage with minimal stress markers.`;
  }
  if (label === "Leaf_Blight") {
    return `Brown lesion coverage ~${pct(p.brownPatchRatio)}; estimated health ${healthScore}%.`;
  }
  if (label === "Rust_Disease") {
    return `Rust-toned patches ~${pct(p.orangeRustRatio)}; monitor spread over 72 hours.`;
  }
  if (label === "Nutrient_Deficiency") {
    return `Pale/yellow regions ~${pct(p.paleRegionRatio + p.yellowPatchRatio)}; check NPK and micronutrients.`;
  }
  return `Dark damaged tissue ~${pct(p.darkLesionRatio)} with irregular texture — urgent field review advised.`;
}

export function displayDiseaseName(label: CropClassLabel): string {
  const names: Record<CropClassLabel, string> = {
    Healthy: "Healthy",
    Leaf_Blight: "Leaf Blight",
    Rust_Disease: "Rust Disease",
    Nutrient_Deficiency: "Nutrient Deficiency",
    Severe_Infection: "Severe Infection",
  };
  return names[label];
}
