"use client";

import { cropReports, smartAlerts, summary } from "@/lib/dashboard-data";
import { SectionHeader } from "@/components/SectionHeader";
import { useLanguage } from "@/context/LanguageContext";

type ReportRisk = "Low" | "Medium" | "High";
type ReportStatus = "Healthy" | "Moderate" | "At Risk" | "Critical";

const highRiskReports = cropReports.filter((report) =>
  report.healthStatus === "At Risk" || report.healthStatus === "Critical"
);

const averageHealth = Math.round(
  cropReports.reduce((sum, report) => sum + report.healthPercentage, 0) /
    cropReports.length,
);

const reportRows = cropReports.slice(0, 4).map((report) => ({
  field: report.cropName.replace(" - ", " ").replace("â€”", "-"),
  status: report.healthStatus as ReportStatus,
  risk:
    report.healthStatus === "Healthy"
      ? "Low"
      : report.healthStatus === "Moderate"
        ? "Medium"
        : "High" as ReportRisk,
  lastScan: report.dateMonitored,
}));

function riskClass(risk: ReportRisk) {
  if (risk === "High") return "text-red-400";
  if (risk === "Medium") return "text-yellow-400";
  return "text-green-400";
}

export function FarmerDashboardSection() {
  const { t } = useLanguage();
  const dashboardCards = [
    {
      label: t.dashboard.fields,
      value: String(summary.activeFieldCount),
      detail: `${summary.fieldCount} ${t.dashboard.totalFields}`,
    },
    {
      label: t.dashboard.activeAlerts,
      value: String(smartAlerts.length),
      detail: `${smartAlerts.filter((alert) => alert.priority === "High").length} ${t.dashboard.highPriority}`,
    },
    {
      label: t.dashboard.avgHealth,
      value: `${averageHealth}%`,
      detail: t.dashboard.latestScans,
    },
    {
      label: t.dashboard.highRisk,
      value: String(highRiskReports.length),
      detail: t.dashboard.needFollowUp,
    },
  ];

  return (
    <section aria-labelledby="farmer-dashboard-heading">
      <SectionHeader
        id="farmer-dashboard-heading"
        title={t.dashboard.title}
        subtitle={t.dashboard.subtitle}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {dashboardCards.map((card) => (
          <article
            key={card.label}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
          >
            <p className="text-xs font-medium text-zinc-500">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-zinc-100 sm:text-3xl">
              {card.value}
            </p>
            <p className="mt-1 text-xs text-zinc-500">{card.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function CropMonitoringReportsSection() {
  const { t } = useLanguage();

  return (
    <section aria-labelledby="crop-reports-heading">
      <SectionHeader
        id="crop-reports-heading"
        title={t.reports.title}
        subtitle={t.reports.subtitle}
        accent="text-emerald-400"
      />

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-950/70 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">{t.reports.field}</th>
                <th className="px-4 py-3 font-medium">{t.reports.status}</th>
                <th className="px-4 py-3 font-medium">{t.reports.risk}</th>
                <th className="px-4 py-3 font-medium">{t.reports.lastScan}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {reportRows.map((row) => (
                <tr key={`${row.field}-${row.lastScan}`}>
                  <td className="px-4 py-3 font-medium text-zinc-200">
                    {row.field}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {t.reports[row.status]}
                  </td>
                  <td className={`px-4 py-3 font-medium ${riskClass(row.risk)}`}>
                    {t.reports[row.risk]}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{row.lastScan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function FieldManagementSupportSection() {
  const { t } = useLanguage();
  const supportCards = [
    {
      title: t.support.irrigation,
      body: t.support.irrigationBody,
    },
    {
      title: t.support.fertilizer,
      body: t.support.fertilizerBody,
    },
    {
      title: t.support.prevention,
      body: t.support.preventionBody,
    },
  ];

  return (
    <section aria-labelledby="field-support-heading">
      <SectionHeader
        id="field-support-heading"
        title={t.support.title}
        subtitle={t.support.subtitle}
        accent="text-lime-400"
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {supportCards.map((card) => (
          <article
            key={card.title}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
          >
            <h3 className="text-sm font-semibold text-zinc-100">{card.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              {card.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
