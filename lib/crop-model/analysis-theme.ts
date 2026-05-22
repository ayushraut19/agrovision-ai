import type {
  AnalysisUiVariant,
  CropAnalysisResult,
} from "@/lib/crop-model/types";
import type { AlertPriority } from "@/lib/dashboard-data";

export type AnalysisTheme = {
  healthCard: {
    border: string;
    shadow: string;
    iconBg: string;
    title: string;
    score: string;
    bar: string;
  };
  diseaseCard: {
    border: string;
    shadow: string;
    iconBg: string;
    title: string;
    severity: string;
  };
  recommendationCard: {
    border: string;
    iconBg: string;
    title: string;
  };
  alertBorder: string;
  alertRing: string;
};

const themes: Record<AnalysisUiVariant, AnalysisTheme> = {
  healthy: {
    healthCard: {
      border: "border-green-500/40",
      shadow: "shadow-green-950/30",
      iconBg: "bg-green-500/15 ring-green-500/30",
      title: "text-green-400",
      score: "text-green-300",
      bar: "bg-green-500",
    },
    diseaseCard: {
      border: "border-green-600/25",
      shadow: "shadow-green-950/15",
      iconBg: "bg-green-500/15 ring-green-500/25",
      title: "text-green-400",
      severity: "text-green-400/80",
    },
    recommendationCard: {
      border: "border-emerald-600/30",
      iconBg: "bg-emerald-500/15 ring-emerald-500/25",
      title: "text-emerald-400",
    },
    alertBorder: "border-green-500/30",
    alertRing: "ring-green-500/40",
  },
  caution: {
    healthCard: {
      border: "border-yellow-600/30",
      shadow: "shadow-yellow-950/15",
      iconBg: "bg-yellow-500/15 ring-yellow-500/25",
      title: "text-yellow-400",
      score: "text-yellow-300",
      bar: "bg-yellow-500",
    },
    diseaseCard: {
      border: "border-orange-500/30",
      shadow: "shadow-orange-950/15",
      iconBg: "bg-orange-500/15 ring-orange-500/25",
      title: "text-orange-400",
      severity: "text-orange-400",
    },
    recommendationCard: {
      border: "border-lime-600/25",
      iconBg: "bg-lime-500/15 ring-lime-500/25",
      title: "text-lime-400",
    },
    alertBorder: "border-yellow-500/30",
    alertRing: "ring-yellow-500/35",
  },
  warning: {
    healthCard: {
      border: "border-orange-600/30",
      shadow: "shadow-orange-950/20",
      iconBg: "bg-orange-500/15 ring-orange-500/25",
      title: "text-orange-400",
      score: "text-orange-300",
      bar: "bg-orange-500",
    },
    diseaseCard: {
      border: "border-red-500/30",
      shadow: "shadow-red-950/20",
      iconBg: "bg-red-500/15 ring-red-500/25",
      title: "text-red-400",
      severity: "text-red-400",
    },
    recommendationCard: {
      border: "border-amber-600/25",
      iconBg: "bg-amber-500/15 ring-amber-500/25",
      title: "text-amber-400",
    },
    alertBorder: "border-orange-500/35",
    alertRing: "ring-orange-500/40",
  },
  critical: {
    healthCard: {
      border: "border-red-600/35",
      shadow: "shadow-red-950/25",
      iconBg: "bg-red-500/15 ring-red-500/30",
      title: "text-red-400",
      score: "text-red-300",
      bar: "bg-red-500",
    },
    diseaseCard: {
      border: "border-red-500/40",
      shadow: "shadow-red-950/25",
      iconBg: "bg-red-500/20 ring-red-500/35",
      title: "text-red-400",
      severity: "text-red-300",
    },
    recommendationCard: {
      border: "border-red-600/30",
      iconBg: "bg-red-500/15 ring-red-500/30",
      title: "text-red-400",
    },
    alertBorder: "border-red-500/40",
    alertRing: "ring-red-500/45",
  },
};

export function getAnalysisTheme(
  variant: AnalysisUiVariant,
): AnalysisTheme {
  return themes[variant];
}

export function alertPriorityAccent(priority: AlertPriority): string {
  switch (priority) {
    case "High":
      return "border-red-500/30";
    case "Medium":
      return "border-yellow-500/30";
    case "Low":
      return "border-green-500/25";
  }
}

export function themeFromAnalysis(
  analysis: CropAnalysisResult | null,
): AnalysisTheme | null {
  if (!analysis) return null;
  return getAnalysisTheme(analysis.uiVariant);
}
