import {
  fields,
  type Field,
  type IrrigationStatus,
} from "@/lib/dashboard-data";
import { SectionHeader } from "@/components/SectionHeader";

const activeBadge = {
  true: {
    label: "Active",
    className: "bg-green-500/15 text-green-400 ring-green-500/30",
  },
  false: {
    label: "Inactive",
    className: "bg-zinc-500/15 text-zinc-400 ring-zinc-500/30",
  },
} as const;

const irrigationStyle: Record<IrrigationStatus, string> = {
  Active: "text-cyan-400",
  Scheduled: "text-blue-400",
  Paused: "text-yellow-400",
  Offline: "text-zinc-500",
};

function moistureBarColor(value: number) {
  if (value >= 60) return "bg-green-500";
  if (value >= 45) return "bg-yellow-500";
  return "bg-red-500";
}

function FieldCard({ field }: { field: Field }) {
  const status = field.active ? activeBadge.true : activeBadge.false;

  return (
    <li className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-zinc-100 sm:text-base">
            {field.name}
          </h3>
          <p className="mt-1 text-xs text-zinc-500">{field.cropType}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div>
          <dt className="text-xs text-zinc-500">Field Size</dt>
          <dd className="mt-0.5 font-medium tabular-nums text-zinc-200">
            {field.sizeAcres} ac
          </dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500">Growth Stage</dt>
          <dd className="mt-0.5 font-medium text-green-400">
            {field.growthStage}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500">Irrigation</dt>
          <dd
            className={`mt-0.5 font-medium ${irrigationStyle[field.irrigationStatus]}`}
          >
            {field.irrigationStatus}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500">Crop Type</dt>
          <dd className="mt-0.5 font-medium text-zinc-300">
            {field.cropType}
          </dd>
        </div>
      </dl>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-zinc-500">Soil Moisture</span>
          <span className="font-semibold tabular-nums text-cyan-400">
            {field.soilMoisture}%
          </span>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-zinc-800"
          role="progressbar"
          aria-valuenow={field.soilMoisture}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${field.name} soil moisture`}
        >
          <div
            className={`h-full rounded-full ${moistureBarColor(field.soilMoisture)}`}
            style={{ width: `${field.soilMoisture}%` }}
          />
        </div>
      </div>

      <button
        type="button"
        className="mt-4 w-full rounded-lg border border-zinc-700 bg-zinc-800/80 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50"
        aria-label={`Edit field ${field.name}`}
      >
        Edit Field
      </button>
    </li>
  );
}

export function FieldManagementSection() {
  const activeCount = fields.filter((f) => f.active).length;

  return (
    <section aria-labelledby="fields-heading">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader
          id="fields-heading"
          title="Field Management"
          subtitle="Monitor plots, crops, and irrigation"
          accent="text-green-400"
          meta={`${activeCount} of ${fields.length} active`}
        />
        <button
          type="button"
          className="shrink-0 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50 sm:px-5"
          aria-label="Add new field"
        >
          + Add Field
        </button>
      </div>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {fields.map((field) => (
          <FieldCard key={field.id} field={field} />
        ))}
      </ul>
    </section>
  );
}
