const navItems = [
  {
    href: "#condition-tracking",
    label: "Crop Condition",
    icon: "📈",
    description: "Health trends & weather",
  },
  {
    href: "#issue-alerts",
    label: "Issue Alerts",
    icon: "🔔",
    description: "Disease & field warnings",
  },
  {
    href: "#field-management",
    label: "Field Management",
    icon: "🗺️",
    description: "Plots, irrigation, growth",
  },
  {
    href: "#crop-reports",
    label: "Monitoring Reports",
    icon: "📋",
    description: "Downloadable field summaries",
  },
  {
    href: "#ai-scan",
    label: "AI Disease Scan",
    icon: "🔬",
    description: "Upload & classify crops",
  },
] as const;

export function FarmerDashboardNav() {
  return (
    <nav
      className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 sm:p-5"
      aria-label="Farmer dashboard modules"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Farmer Dashboard
      </p>
      <p className="mt-1 text-sm text-zinc-400">
        Jump to crop condition tracking, alerts, reports, fields, or AI scan.
      </p>
      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {navItems.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className="flex h-full flex-col rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 transition-colors hover:border-green-600/40 hover:bg-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50"
            >
              <span className="text-lg" aria-hidden>
                {item.icon}
              </span>
              <span className="mt-2 text-sm font-semibold text-green-400">
                {item.label}
              </span>
              <span className="mt-1 text-xs text-zinc-500">
                {item.description}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
