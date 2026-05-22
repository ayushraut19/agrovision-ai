import { weeklyHealth } from "@/lib/dashboard-data";
import { SectionHeader } from "@/components/SectionHeader";

function barColor(value: number) {
  if (value >= 75) return "bg-green-500";
  if (value >= 65) return "bg-yellow-500";
  return "bg-red-500";
}

export function CropHealthSection() {
  const current = weeklyHealth[weeklyHealth.length - 1].value;

  return (
    <section aria-labelledby="health-heading">
      <SectionHeader
        id="health-heading"
        title="Crop Health"
        subtitle="Weekly health trend"
        accent="text-green-400"
        meta={`Current ${current}%`}
      />

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6">
        <div className="mb-6 flex items-end justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Today
            </p>
            <p className="mt-1 text-4xl font-bold tabular-nums text-green-400">
              {current}%
            </p>
          </div>
          <p className="text-right text-xs text-zinc-500">
            7-day average{" "}
            <span className="font-semibold text-zinc-300">
              {Math.round(
                weeklyHealth.reduce((sum, d) => sum + d.value, 0) /
                  weeklyHealth.length,
              )}
              %
            </span>
          </p>
        </div>

        <ul className="space-y-4">
          {weeklyHealth.map((entry) => (
            <li key={entry.day}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="w-10 font-medium text-zinc-400">
                  {entry.day}
                </span>
                <span className="tabular-nums text-zinc-300">
                  {entry.value}%
                </span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-zinc-800"
                role="progressbar"
                aria-valuenow={entry.value}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${entry.day} crop health`}
              >
                <div
                  className={`h-full rounded-full transition-none ${barColor(entry.value)}`}
                  style={{ width: `${entry.value}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
