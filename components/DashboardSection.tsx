import type { ReactNode } from "react";

type DashboardSectionProps = {
  id: string;
  featureLabel: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function DashboardSection({
  id,
  featureLabel,
  title,
  description,
  children,
}: DashboardSectionProps) {
  return (
    <section
      id={id}
      className="scroll-mt-28"
      aria-labelledby={`${id}-title`}
    >
      <div className="mb-5 flex flex-col gap-2 border-b border-zinc-800/80 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-500/80">
            {featureLabel}
          </p>
          <h2
            id={`${id}-title`}
            className="mt-1 text-xl font-bold text-zinc-100 sm:text-2xl"
          >
            {title}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-zinc-500">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
