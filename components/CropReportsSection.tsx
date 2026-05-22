import { cropReports, type CropReport, type ReportStatus } from "@/lib/dashboard-data";
import { SectionHeader } from "@/components/SectionHeader";

const statusBadge: Record<
  ReportStatus,
  { label: string; className: string }
> = {
  ready: {
    label: "Ready",
    className: "bg-green-500/15 text-green-400 ring-green-500/30",
  },
  processing: {
    label: "Processing",
    className: "bg-yellow-500/15 text-yellow-400 ring-yellow-500/30",
  },
  review: {
    label: "Needs Review",
    className: "bg-orange-500/15 text-orange-400 ring-orange-500/30",
  },
  archived: {
    label: "Archived",
    className: "bg-zinc-500/15 text-zinc-400 ring-zinc-500/30",
  },
};

const healthBadge: Record<
  CropReport["healthStatus"],
  { className: string }
> = {
  Healthy: { className: "text-green-400" },
  Moderate: { className: "text-yellow-400" },
  "At Risk": { className: "text-orange-400" },
  Critical: { className: "text-red-400" },
};

function healthBarColor(value: number) {
  if (value >= 80) return "bg-green-500";
  if (value >= 65) return "bg-yellow-500";
  return "bg-red-500";
}

function ReportCard({ report }: { report: CropReport }) {
  const badge = statusBadge[report.status];
  const health = healthBadge[report.healthStatus];

  return (
    <li className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-zinc-100 sm:text-base">
            {report.cropName}
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            Monitored {report.dateMonitored}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div>
          <dt className="text-xs text-zinc-500">Health Status</dt>
          <dd className={`mt-0.5 font-medium ${health.className}`}>
            {report.healthStatus}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500">Disease Detected</dt>
          <dd className="mt-0.5 font-medium text-zinc-300">
            {report.diseaseDetected}
          </dd>
        </div>
      </dl>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-zinc-500">Health</span>
          <span className="font-semibold tabular-nums text-green-400">
            {report.healthPercentage}%
          </span>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-zinc-800"
          role="progressbar"
          aria-valuenow={report.healthPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`h-full rounded-full ${healthBarColor(report.healthPercentage)}`}
            style={{ width: `${report.healthPercentage}%` }}
          />
        </div>
      </div>

      <button
        type="button"
        className="mt-4 w-full rounded-lg border border-green-600/40 bg-green-600/10 px-4 py-2 text-sm font-medium text-green-400 transition-colors hover:bg-green-600/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50"
        aria-label={`Download report for ${report.cropName}`}
      >
        Download Report
      </button>
    </li>
  );
}

export function CropReportsSection() {
  const readyCount = cropReports.filter((r) => r.status === "ready").length;

  return (
    <section aria-labelledby="reports-heading">
      <SectionHeader
        id="reports-heading"
        title="Crop Monitoring Reports"
        subtitle="Recent field analysis summaries"
        accent="text-green-400"
        meta={`${readyCount} ready to download`}
      />

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cropReports.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </ul>
    </section>
  );
}
