import type { CropAnalysisResult } from "@/lib/crop-model/types";
import { getAnalysisTheme } from "@/lib/crop-model/analysis-theme";
import { riskLevelAccent } from "@/lib/crop-model/labels";

type CropAnalysisCardsProps = {
  analysis: CropAnalysisResult;
  visible: boolean;
};

export function CropAnalysisCards({ analysis, visible }: CropAnalysisCardsProps) {
  const theme = getAnalysisTheme(analysis.uiVariant);

  return (
    <div
      className={`mt-6 grid grid-cols-1 gap-4 transition-all duration-700 ease-out md:grid-cols-3 ${
        visible
          ? "result-reveal translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
      aria-hidden={!visible}
    >
      <article
        className={`rounded-xl border bg-zinc-950/80 p-4 shadow-inner sm:p-5 ${theme.healthCard.border} ${theme.healthCard.shadow}`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg ring-1 ${theme.healthCard.iconBg}`}
          >
            {analysis.isHealthy ? "✅" : "📊"}
          </span>
          <h3 className={`text-sm font-semibold ${theme.healthCard.title}`}>
            Crop Health Score
          </h3>
        </div>
        <p
          className={`mt-4 text-4xl font-bold tabular-nums ${theme.healthCard.score}`}
        >
          {analysis.healthScore}%
        </p>
        <p className="mt-1 text-xs text-zinc-500">{analysis.healthLabel}</p>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-zinc-500">Risk level</span>
          <span
            className={`font-semibold ${riskLevelAccent(analysis.riskLevel)}`}
          >
            {analysis.riskLevel}
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${theme.healthCard.bar}`}
            style={{ width: `${analysis.healthScore}%` }}
          />
        </div>
      </article>

      <article
        className={`rounded-xl border bg-zinc-950/80 p-4 shadow-inner sm:p-5 ${theme.diseaseCard.border} ${theme.diseaseCard.shadow}`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg ring-1 ${theme.diseaseCard.iconBg}`}
          >
            {analysis.isHealthy ? "🌿" : "🦠"}
          </span>
          <h3 className={`text-sm font-semibold ${theme.diseaseCard.title}`}>
            {analysis.isHealthy ? "Disease Status" : "Detected Disease"}
          </h3>
        </div>
        <p className="mt-4 text-lg font-semibold text-zinc-100">
          {analysis.disease}
        </p>
        <p className="mt-2 text-sm text-zinc-400">
          Severity:{" "}
          <span className={`font-medium ${theme.diseaseCard.severity}`}>
            {analysis.severity}
          </span>
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          AI confidence: {analysis.confidence}%
        </p>
        <p className="mt-1 text-xs text-zinc-600">
          Class: {analysis.classLabel.replace(/_/g, " ")}
        </p>
      </article>

      <article
        className={`rounded-xl border bg-zinc-950/80 p-4 sm:p-5 ${theme.recommendationCard.border}`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg ring-1 ${theme.recommendationCard.iconBg}`}
          >
            💡
          </span>
          <h3
            className={`text-sm font-semibold ${theme.recommendationCard.title}`}
          >
            Recommendation
          </h3>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-zinc-300">
          {analysis.recommendation}
        </p>
      </article>
    </div>
  );
}
