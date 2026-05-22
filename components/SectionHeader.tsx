type SectionHeaderProps = {
  id: string;
  title: string;
  subtitle?: string;
  accent?: string;
  meta?: string;
};

export function SectionHeader({
  id,
  title,
  subtitle,
  accent = "text-green-400",
  meta,
}: SectionHeaderProps) {
  return (
    <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 id={id} className={`text-xl font-bold sm:text-2xl ${accent}`}>
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
        ) : null}
      </div>
      {meta ? <p className="text-xs text-zinc-600">{meta}</p> : null}
    </div>
  );
}
