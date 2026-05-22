import { SmartAlertsSection } from "@/components/SmartAlertsSection";
import { HeroSection } from "@/components/HeroSection";
import { CropHealthSection } from "@/components/CropHealthSection";
import { CropReportsSection } from "@/components/CropReportsSection";
import { CropUploadSection } from "@/components/CropUploadSection";
import { FieldManagementSection } from "@/components/FieldManagementSection";
import { WeatherSection } from "@/components/WeatherSection";
import { summary, weather } from "@/lib/dashboard-data";

const kpis = [
  {
    label: "Crop Health",
    value: `${summary.cropHealth}%`,
    hint: "Today",
    accent: "text-green-400",
  },
  {
    label: "Alerts",
    value: String(summary.alertCount),
    hint: "Active notifications",
    accent: "text-yellow-400",
  },
  {
    label: "Weather",
    value: `${weather.temperature}°C`,
    hint: weather.condition,
    accent: "text-blue-400",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white sm:px-10 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <HeroSection />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6"
            >
              <h2 className={`text-lg font-semibold sm:text-xl ${kpi.accent}`}>
                {kpi.label}
              </h2>
              <p className="mt-3 text-3xl font-bold tabular-nums sm:text-4xl">
                {kpi.value}
              </p>
              <p className="mt-2 text-sm text-zinc-500">{kpi.hint}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <CropHealthSection />
          <SmartAlertsSection />
        </div>

        <div className="mt-8">
          <WeatherSection />
        </div>

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">
          <FieldManagementSection />
        </div>

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">
          <CropReportsSection />
        </div>

        <CropUploadSection healthScore={summary.cropHealth} />
      </div>
    </main>
  );
}
