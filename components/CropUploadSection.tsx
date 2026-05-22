"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Phase = "idle" | "scanning" | "complete";

const SCAN_DURATION_MS = 2600;

const analysis = {
  disease: "Early Leaf Blight",
  severity: "Moderate",
  confidence: 94,
  recommendation:
    "Apply fungicide within 24 hours and monitor moisture levels daily. Reduce overhead irrigation until symptoms stabilize.",
  healthLabel: "Good — monitor closely",
};

type CropUploadSectionProps = {
  healthScore: number;
};

function healthBarColor(score: number) {
  if (score >= 80) return "bg-green-500";
  if (score >= 65) return "bg-yellow-500";
  return "bg-red-500";
}

export function CropUploadSection({ healthScore }: CropUploadSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const scanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewRef = useRef<string | null>(null);
  const dragCounterRef = useRef(0);

  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const clearPreview = useCallback(() => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    if (scanTimerRef.current) {
      clearTimeout(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    clearPreview();
    setPreview(null);
    setFileName("");
    setPhase("idle");
    setUploadSuccess(false);
    setIsDragging(false);
    dragCounterRef.current = 0;
    if (inputRef.current) inputRef.current.value = "";
  }, [clearPreview]);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file?.type.startsWith("image/")) return;

      clearPreview();
      const url = URL.createObjectURL(file);
      previewRef.current = url;
      setPreview(url);
      setFileName(file.name);
      setUploadSuccess(true);
      setPhase("scanning");
      setIsDragging(false);
      dragCounterRef.current = 0;

      if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
      scanTimerRef.current = setTimeout(() => {
        setPhase("complete");
        scanTimerRef.current = null;
      }, SCAN_DURATION_MS);
    },
    [clearPreview],
  );

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current += 1;
    if (phase === "idle") setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragging(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  useEffect(() => {
    return () => {
      if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
      clearPreview();
    };
  }, [clearPreview]);

  const showGlow = phase === "scanning";
  const showCompleteGlow = phase === "complete";
  const canDrop = phase === "idle" || (phase === "complete" && preview);

  return (
    <section
      className={`relative mt-8 overflow-hidden rounded-2xl border p-5 transition-colors duration-500 sm:p-6 ${
        showCompleteGlow
          ? "border-green-600/40 bg-zinc-900 shadow-lg shadow-green-950/25"
          : "border-zinc-800 bg-zinc-900"
      }`}
      aria-labelledby="upload-heading"
    >
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-green-500/10 blur-3xl"
        aria-hidden
      />

      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2
              id="upload-heading"
              className="bg-gradient-to-r from-green-300 to-emerald-500 bg-clip-text text-xl font-bold text-transparent sm:text-2xl"
            >
              AI Crop Analysis
            </h2>
            <span className="rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400">
              Neural Scan
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Drag, drop, or browse — instant disease detection and health scoring
          </p>
        </div>
        {phase === "complete" && (
          <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
            Analysis complete
          </span>
        )}
      </div>

      <div
        className={`relative mt-5 overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ${
          isDragging && canDrop
            ? "border-green-400 bg-green-950/30 ai-glow"
            : showGlow
              ? "border-green-500/60 bg-zinc-950/90 ai-glow"
              : preview
                ? "border-green-600/40 bg-zinc-950/80"
                : "border-zinc-700 bg-zinc-950/50 hover:border-zinc-600"
        }`}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => handleFile(e.target.files?.[0])}
          aria-label="Upload crop image"
        />

        {!preview && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center gap-3 px-6 py-12 text-center transition-colors hover:bg-zinc-900/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50 sm:py-16"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-green-500/20 bg-green-500/5 text-3xl ring-1 ring-green-500/20">
              📷
            </span>
            <span className="text-sm font-semibold text-zinc-100 sm:text-base">
              {isDragging ? "Release to upload crop image" : "Drag & drop crop image"}
            </span>
            <span className="text-xs text-zinc-500">
              or click to browse · PNG, JPG, WEBP
            </span>
            <span className="mt-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-green-900/40 hover:bg-green-500">
              Choose Image
            </span>
          </button>
        )}

        {preview && (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Uploaded crop preview"
              className="max-h-80 w-full object-cover sm:max-h-96"
            />

            {phase === "scanning" && (
              <div className="scan-sweep pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-80" />
            )}

            {uploadSuccess && (
              <div
                className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-600/90 px-3 py-1.5 text-xs font-medium text-white shadow-lg shadow-green-900/50"
                role="status"
              >
                <span aria-hidden>✓</span>
                Uploaded
              </div>
            )}

            {phase === "scanning" && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-black/75 backdrop-blur-[3px]"
                role="status"
                aria-live="polite"
                aria-busy="true"
              >
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
                    AI Scanning Crop...
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    Analyzing leaf patterns and health markers
                  </p>
                </div>
                <div className="h-1.5 w-56 overflow-hidden rounded-full bg-zinc-800 sm:w-64">
                  <div className="scan-line h-full w-2/5 rounded-full bg-gradient-to-r from-green-600 to-emerald-400" />
                </div>
              </div>
            )}

            {phase !== "scanning" && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent px-4 pb-3 pt-10">
                <p className="truncate text-xs text-zinc-400">{fileName}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {preview && phase !== "scanning" && (
        <div className="relative mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-green-600/40 hover:bg-zinc-800"
          >
            Replace Image
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800"
          >
            Clear & Reset
          </button>
        </div>
      )}

      <div
        className={`mt-6 grid grid-cols-1 gap-4 transition-all duration-700 ease-out md:grid-cols-3 ${
          phase === "complete"
            ? "result-reveal translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
        aria-hidden={phase !== "complete"}
      >
        <article className="rounded-xl border border-green-600/30 bg-zinc-950/80 p-4 shadow-inner shadow-green-950/20 sm:p-5">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/15 text-lg ring-1 ring-green-500/25">
              📊
            </span>
            <h3 className="text-sm font-semibold text-green-400">
              Crop Health Score
            </h3>
          </div>
          <p className="mt-4 text-4xl font-bold tabular-nums text-green-400">
            {healthScore}%
          </p>
          <p className="mt-1 text-xs text-zinc-500">{analysis.healthLabel}</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${healthBarColor(healthScore)}`}
              style={{ width: `${healthScore}%` }}
            />
          </div>
        </article>

        <article className="rounded-xl border border-red-500/25 bg-zinc-950/80 p-4 shadow-inner shadow-red-950/10 sm:p-5">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/15 text-lg ring-1 ring-red-500/25">
              🦠
            </span>
            <h3 className="text-sm font-semibold text-red-400">
              Detected Disease
            </h3>
          </div>
          <p className="mt-4 text-lg font-semibold text-zinc-100">
            {analysis.disease}
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            Severity:{" "}
            <span className="font-medium text-orange-400">
              {analysis.severity}
            </span>
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            AI confidence: {analysis.confidence}%
          </p>
        </article>

        <article className="rounded-xl border border-emerald-600/25 bg-zinc-950/80 p-4 md:col-span-1 sm:p-5">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-lg ring-1 ring-emerald-500/25">
              💡
            </span>
            <h3 className="text-sm font-semibold text-emerald-400">
              Recommendation
            </h3>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-zinc-300">
            {analysis.recommendation}
          </p>
        </article>
      </div>

      {phase === "idle" && !preview && (
        <p className="relative mt-4 text-center text-xs text-zinc-600">
          Results appear automatically after the AI scan completes
        </p>
      )}
    </section>
  );
}
