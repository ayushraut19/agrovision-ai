"use client";

import {
  CropAnalysisProvider,
  useCropAnalysis,
} from "@/context/CropAnalysisContext";
import { DashboardSection } from "@/components/DashboardSection";
import { FarmerDashboardNav } from "@/components/FarmerDashboardNav";
import { HeroSection } from "@/components/HeroSection";
import { CropHealthSection } from "@/components/CropHealthSection";
import { SmartAlertsSection } from "@/components/SmartAlertsSection";
import { WeatherSection } from "@/components/WeatherSection";
import { FieldManagementSection } from "@/components/FieldManagementSection";
import { CropReportsSection } from "@/components/CropReportsSection";
import { CropUploadSection } from "@/components/CropUploadSection";
import { summary, weather } from "@/lib/dashboard-data";

type DashboardClientProps = {
  initialHealthScore: number;
};

function DashboardKpis() {
  const { displayHealthScore, alerts } = useCropAnalysis();

  const kpis = [
    {
      label: "Crop Condition",
      value: `${displayHealthScore}%`,
      hint: "Live health score",
      accent: "text-green-400",
    },
    {
      label: "Open Alerts",
      value: String(alerts.length),
      hint: "Issues needing attention",
      accent: "text-yellow-400",
    },
    {
      label: "Active Fields",
      value: String(summary.activeFieldCount),
      hint: `${summary.fieldCount} total plots`,
      accent: "text-emerald-400",
    },
    {
      label: "Weather",
      value: `${weather.temperature}°C`,
      hint: weather.condition,
      accent: "text-blue-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6"
        >
          <h2 className={`text-sm font-semibold sm:text-base ${kpi.accent}`}>
            {kpi.label}
          </h2>
          <p className="mt-2 text-2xl font-bold tabular-nums sm:text-3xl">
            {kpi.value}
          </p>
          <p className="mt-1 text-xs text-zinc-500 sm:text-sm">{kpi.hint}</p>
        </div>
      ))}
    </div>
  );
}

function DashboardBody() {
  return (
    <>
      <HeroSection />
      <FarmerDashboardNav />
      <DashboardKpis />

      <div className="mt-10 space-y-10">
        <DashboardSection
          id="condition-tracking"
          featureLabel="Crop condition tracking"
          title="Monitor crop health & environment"
          description="Weekly condition scores, field weather, and AI scan results keep you ahead of stress and disease."
        >
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <CropHealthSection />
            <WeatherSection />
          </div>
        </DashboardSection>

        <DashboardSection
          id="issue-alerts"
          featureLabel="Issue detection alerts"
          title="Smart alerts & warnings"
          description="Disease detections, irrigation issues, weather risks, and fertilizer recommendations in one place."
        >
          <SmartAlertsSection />
        </DashboardSection>

        <DashboardSection
          id="field-management"
          featureLabel="Field management support"
          title="Manage plots & operations"
          description="View crop type, growth stage, irrigation status, and soil moisture for every field."
        >
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">
            <FieldManagementSection />
          </div>
        </DashboardSection>

        <DashboardSection
          id="crop-reports"
          featureLabel="Crop monitoring reports"
          title="Field analysis reports"
          description="Recent monitoring summaries with health scores, detected issues, and download-ready records."
        >
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">
            <CropReportsSection />
          </div>
        </DashboardSection>

        <DashboardSection
          id="ai-scan"
          featureLabel="AI crop analysis"
          title="Scan crops for disease"
          description="Upload a leaf image for TensorFlow.js classification — results update condition scores and alerts automatically."
        >
          <CropUploadSection />
        </DashboardSection>
      </div>
    </>
  );
}

export function DashboardClient({ initialHealthScore }: DashboardClientProps) {
  return (
    <CropAnalysisProvider initialHealthScore={initialHealthScore}>
      <DashboardBody />
    </CropAnalysisProvider>
  );
}
