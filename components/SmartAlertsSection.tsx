"use client";

import { useMemo, useState } from "react";
import {
  smartAlerts,
  type AlertCategory,
  type AlertPriority,
  type SmartAlert,
} from "@/lib/dashboard-data";
import { SectionHeader } from "@/components/SectionHeader";
import { useLanguage } from "@/context/LanguageContext";

const categoryMeta: Record<
  AlertCategory,
  { icon: string; border: string; iconBg: string }
> = {
  disease: {
    icon: "D",
    border: "border-red-500/30",
    iconBg: "bg-red-500/15 text-red-400",
  },
  irrigation: {
    icon: "I",
    border: "border-cyan-500/30",
    iconBg: "bg-cyan-500/15 text-cyan-400",
  },
  weather: {
    icon: "W",
    border: "border-yellow-500/30",
    iconBg: "bg-yellow-500/15 text-yellow-400",
  },
  fertilizer: {
    icon: "F",
    border: "border-lime-500/30",
    iconBg: "bg-lime-500/15 text-lime-400",
  },
};

const priorityBadge: Record<AlertPriority, { className: string }> = {
  High: {
    className: "bg-red-500/15 text-red-400 ring-red-500/30",
  },
  Medium: {
    className: "bg-yellow-500/15 text-yellow-400 ring-yellow-500/30",
  },
  Low: {
    className: "bg-zinc-500/15 text-zinc-400 ring-zinc-500/30",
  },
};

function AlertCard({
  alert,
  onDismiss,
}: {
  alert: SmartAlert;
  onDismiss: (id: string) => void;
}) {
  const { t } = useLanguage();
  const meta = categoryMeta[alert.category];
  const priority = priorityBadge[alert.priority];
  const translatedAlert = t.alerts.items[alert.id as keyof typeof t.alerts.items];

  return (
    <li className={`rounded-xl border bg-zinc-950/60 p-4 ${meta.border}`}>
      <div className="flex gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${meta.iconBg}`}
          aria-hidden
        >
          {meta.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                {t.alerts.categories[alert.category]}
              </p>
              <h3 className="mt-0.5 text-sm font-semibold text-zinc-100 sm:text-base">
                {translatedAlert?.title ?? alert.title}
              </h3>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${priority.className}`}
            >
              {t.alerts.priority[alert.priority]}
            </span>
          </div>
          <p className="mt-2 text-sm text-zinc-400">
            {translatedAlert?.message ?? alert.message}
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            {alert.field} - {alert.timestamp}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onDismiss(alert.id)}
          className="shrink-0 rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50"
          aria-label={`${t.alerts.dismiss}: ${translatedAlert?.title ?? alert.title}`}
        >
          <span aria-hidden className="text-lg leading-none">
            x
          </span>
        </button>
      </div>
    </li>
  );
}

export function SmartAlertsSection() {
  const { t } = useLanguage();
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set());

  const visible = useMemo(
    () => smartAlerts.filter((a) => !dismissed.has(a.id)),
    [dismissed],
  );

  const highCount = visible.filter((a) => a.priority === "High").length;

  const dismiss = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
  };

  return (
    <section aria-labelledby="smart-alerts-heading">
      <SectionHeader
        id="smart-alerts-heading"
        title={t.alerts.title}
        subtitle={t.alerts.subtitle}
        accent="text-yellow-400"
        meta={
          visible.length === 0
            ? t.alerts.allClear
            : `${visible.length} ${t.alerts.activeMeta} - ${highCount} ${t.alerts.highPriority}`
        }
      />

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-8 text-center text-sm text-zinc-500">
          {t.alerts.empty}
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {visible.map((alert) => (
            <AlertCard key={alert.id} alert={alert} onDismiss={dismiss} />
          ))}
        </ul>
      )}
    </section>
  );
}
