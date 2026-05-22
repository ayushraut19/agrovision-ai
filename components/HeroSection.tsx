const badges = [
  { label: "AI Powered", dot: "bg-green-400" },
  { label: "Real-Time Monitoring", dot: "bg-emerald-400" },
  { label: "Smart Alerts", dot: "bg-lime-400" },
] as const;

export function HeroSection() {
  return (
    <header className="relative mb-8 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 sm:p-10">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-green-500/15 blur-3xl sm:h-64 sm:w-64"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 left-1/4 h-40 w-72 rounded-full bg-emerald-600/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(39_39_42/0.4)_1px,transparent_1px),linear-gradient(to_bottom,rgb(39_39_42/0.4)_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_0%,#000_50%,transparent_100%)]"
        aria-hidden
      />

      <div className="relative">
        <ul className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <li key={badge.label}>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/25 bg-green-950/50 px-3 py-1 text-xs font-medium text-green-300/90 sm:text-sm">
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${badge.dot}`}
                  aria-hidden
                />
                {badge.label}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-500/80 sm:text-sm">
              Agriculture Intelligence Platform
            </p>
            <h1 className="mt-2 bg-gradient-to-br from-green-200 via-green-400 to-emerald-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl lg:text-6xl">
              AgroVision AI
            </h1>
            <p className="mt-3 text-lg font-medium text-green-400/90 sm:text-xl">
              Smart Crop Health Monitoring System
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              Monitor fields, detect crop diseases early, and act on irrigation
              and weather alerts — all from one AI-powered dashboard built for
              modern farming teams.
            </p>
          </div>

          <div
            className="flex shrink-0 items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 sm:px-5"
            aria-hidden
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-500/15 text-2xl ring-1 ring-green-500/30">
              🌾
            </span>
            <div className="text-left text-xs text-zinc-500 sm:text-sm">
              <p className="font-medium text-zinc-300">Field-ready insights</p>
              <p className="mt-0.5 text-green-400/80">24/7 crop intelligence</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
