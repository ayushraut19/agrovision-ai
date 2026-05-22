"use client";

import type { RefObject } from "react";
import { CropScanOverlay } from "@/components/crop-upload/CropScanOverlay";

type CropUploadZoneProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  preview: string | null;
  fileName: string;
  phase: "idle" | "scanning" | "complete" | "error";
  isDragging: boolean;
  uploadSuccess: boolean;
  scanStatusText: string;
  scanSubText: string;
  scanProgress?: number;
  onFile: (file: File | undefined) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
};

export function CropUploadZone({
  inputRef,
  preview,
  fileName,
  phase,
  isDragging,
  uploadSuccess,
  scanStatusText,
  scanSubText,
  scanProgress = 40,
  onFile,
  onDragEnter,
  onDragLeave,
  onDrop,
}: CropUploadZoneProps) {
  const showGlow = phase === "scanning";
  const canDrop = phase === "idle" || phase === "complete" || phase === "error";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ${
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
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => onFile(e.target.files?.[0])}
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

          {uploadSuccess && phase !== "idle" && (
            <div
              className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-600/90 px-3 py-1.5 text-xs font-medium text-white shadow-lg shadow-green-900/50"
              role="status"
            >
              <span aria-hidden>✓</span>
              Uploaded
            </div>
          )}

          {phase === "scanning" && (
            <CropScanOverlay
              statusText={scanStatusText}
              subText={scanSubText}
              progressPercent={scanProgress}
            />
          )}

          {phase !== "scanning" && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent px-4 pb-3 pt-10">
              <p className="truncate text-xs text-zinc-400">{fileName}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
