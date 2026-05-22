type CropScanOverlayProps = {
  statusText: string;
  subText: string;
  progressPercent?: number;
};

export function CropScanOverlay({
  statusText,
  subText,
  progressPercent = 40,
}: CropScanOverlayProps) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-black/75 backdrop-blur-[3px]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="scan-sweep pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-80" />
      <div className="relative flex h-20 w-20 items-center justify-center">
        <span className="absolute inset-0 rounded-full border border-green-500/30" />
        <span className="absolute inset-1 rounded-full border-2 border-green-500/10" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-green-400 border-r-green-400/40" />
        <span className="text-2xl" aria-hidden>
          🔬
        </span>
      </div>
      <div className="text-center">
        <p className="scan-pulse text-base font-bold tracking-wider text-green-400 sm:text-lg">
          {statusText}
        </p>
        <p className="mt-1 text-xs text-zinc-400">{subText}</p>
      </div>
      <div className="h-1.5 w-56 overflow-hidden rounded-full bg-zinc-800 sm:w-64">
        <div
          className="h-full rounded-full bg-gradient-to-r from-green-600 to-emerald-400 transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
