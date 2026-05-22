"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Phase = "idle" | "scanning" | "complete";
type DetectionLabel = "Healthy" | "Leaf Blight" | "Rust Disease" | "Nutrient Deficiency";

type AnalysisResult = {
  disease: DetectionLabel;
  severity: "Low" | "Moderate" | "High";
  confidence: number;
  recommendation: string;
  healthLabel: string;
  healthScore: number;
};

const SCAN_DURATION_MS = 900;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function healthBarColor(score: number) {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  return "bg-red-500";
}

async function analyzeImage(file: File): Promise<AnalysisResult> {
  const imageBitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas context unavailable");

  const maxSize = 256;
  const scale = Math.min(1, maxSize / Math.max(imageBitmap.width, imageBitmap.height));
  canvas.width = Math.max(1, Math.round(imageBitmap.width * scale));
  canvas.height = Math.max(1, Math.round(imageBitmap.height * scale));
  ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = canvas.width * canvas.height;

  let green = 0;
  let yellow = 0;
  let brown = 0;
  let dark = 0;
  let texture = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightness = (r + g + b) / 3;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;

    if (g > r * 1.12 && g > b * 1.12 && g > 70) green += 1;
    if (r > 130 && g > 120 && b < 130 && Math.abs(r - g) < 55) yellow += 1;
    if (r > 85 && g > 45 && g < 160 && b < g * 0.9 && r > g * 1.12) brown += 1;
    if (brightness < 55) dark += 1;

    texture += saturation * (1 - brightness / 255);
  }

  const greenRatio = green / pixels;
  const yellowRatio = yellow / pixels;
  const brownRatio = brown / pixels;
  const darkRatio = dark / pixels;
  const damageRatio = yellowRatio + brownRatio;
  const textureDamage = clamp(texture / pixels, 0, 1);

  let disease: DetectionLabel = "Healthy";
  if (greenRatio > 0.57 && damageRatio < 0.1 && darkRatio < 0.2) disease = "Healthy";
  else if (yellowRatio > brownRatio && yellowRatio > 0.14) disease = "Nutrient Deficiency";
  else if (brownRatio > 0.15 || (brownRatio > 0.08 && darkRatio > 0.19)) disease = "Leaf Blight";
  else if (damageRatio > 0.12) disease = "Rust Disease";
  else if (greenRatio < 0.34 && yellowRatio > 0.1) disease = "Nutrient Deficiency";

  const healthScore = clamp(
    Math.round(100 - damageRatio * 160 - darkRatio * 65 - textureDamage * 55 + greenRatio * 18),
    32,
    98,
  );

  const severity = healthScore >= 78 ? "Low" : healthScore >= 58 ? "Moderate" : "High";
  const confidence = clamp(
    Math.round(68 + Math.abs(greenRatio - damageRatio) * 42 + Math.min(textureDamage, 0.4) * 20),
    70,
    97,
  );

  const recommendationMap: Record<DetectionLabel, string> = {
    Healthy:
      "Crop appears healthy. Maintain current irrigation schedule and continue weekly scouting for early symptoms.",
    "Leaf Blight":
      "Leaf blight-like brown damage detected. Remove affected leaves and apply targeted fungicide in the next spray cycle.",
    "Rust Disease":
      "Rust-like spotting detected. Improve airflow, avoid overhead watering, and monitor spread over the next 48 hours.",
    "Nutrient Deficiency":
      "Pale/yellow tissue suggests nutrient stress. Review nitrogen and micronutrient balance and adjust feeding plan gradually.",
  };

  imageBitmap.close();

  return {
    disease,
    severity,
    confidence,
    recommendation: recommendationMap[disease],
    healthLabel: healthScore >= 80 ? "Strong health" : healthScore >= 60 ? "Needs monitoring" : "At risk",
    healthScore,
  };
}

export function CropUploadSection() {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string | null>(null);
  const scanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragCounterRef = useRef(0);

  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const clearPreview = useCallback(() => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = null;
  }, []);

  const reset = useCallback(() => {
    if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
    clearPreview();
    setPreview(null);
    setFileName("");
    setPhase("idle");
    setIsDragging(false);
    setError(null);
    setAnalysis(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [clearPreview]);

  const handleFile = useCallback(async (file?: File) => {
    if (!file?.type.startsWith("image/")) return setError("Please upload a valid image file.");

    setError(null);
    setAnalysis(null);
    clearPreview();

    const url = URL.createObjectURL(file);
    previewRef.current = url;
    setPreview(url);
    setFileName(file.name);
    setPhase("scanning");

    try {
      const result = await analyzeImage(file);
      if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
      scanTimerRef.current = setTimeout(() => {
        setAnalysis(result);
        setPhase("complete");
      }, SCAN_DURATION_MS);
    } catch {
      setError("Image analysis failed. Please try another image.");
      setPhase("idle");
    }
  }, [clearPreview]);

  useEffect(() => () => clearPreview(), [clearPreview]);

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6" aria-labelledby="upload-heading">
      <h2 id="upload-heading" className="text-xl font-bold text-green-400">Crop Upload & Analysis</h2>
      <p className="mt-1 text-sm text-zinc-500">Canvas-based disease detection without TensorFlow.js.</p>

      <div className="mt-5 rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-950/50" onDragEnter={(e)=>{e.preventDefault();dragCounterRef.current+=1;setIsDragging(true);}} onDragLeave={(e)=>{e.preventDefault();dragCounterRef.current-=1;if(dragCounterRef.current<=0){dragCounterRef.current=0;setIsDragging(false);}}} onDragOver={(e)=>e.preventDefault()} onDrop={(e)=>{e.preventDefault();dragCounterRef.current=0;setIsDragging(false);void handleFile(e.dataTransfer.files?.[0]);}}>
        <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={(e)=>void handleFile(e.target.files?.[0])} />
        {!preview ? (
          <button type="button" onClick={() => inputRef.current?.click()} className="flex w-full flex-col items-center gap-3 px-6 py-14">
            <span className="text-3xl">📷</span>
            <span className="text-sm text-zinc-200">{isDragging ? "Release to upload" : "Drag & drop crop image"}</span>
          </button>
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Uploaded crop preview" className="max-h-80 w-full object-cover" />
            <p className="px-4 py-2 text-xs text-zinc-500">{fileName}</p>
          </>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      {preview && <div className="mt-4 flex gap-3"><button type="button" onClick={() => inputRef.current?.click()} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300">Replace</button><button type="button" onClick={reset} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400">Reset</button></div>}

      {phase === "complete" && analysis && (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-green-600/30 bg-zinc-950/80 p-4"><h3 className="text-sm text-green-400">Crop Health Score</h3><p className="mt-2 text-4xl font-bold text-green-400">{analysis.healthScore}%</p><p className="mt-1 text-xs text-zinc-500">{analysis.healthLabel}</p><div className="mt-4 h-2 rounded-full bg-zinc-800"><div className={`h-full rounded-full ${healthBarColor(analysis.healthScore)}`} style={{ width: `${analysis.healthScore}%` }} /></div></article>
          <article className="rounded-xl border border-red-500/25 bg-zinc-950/80 p-4"><h3 className="text-sm text-red-400">Detected Disease</h3><p className="mt-2 text-lg font-semibold text-zinc-100">{analysis.disease}</p><p className="mt-2 text-sm text-zinc-400">Severity: <span className="text-orange-400">{analysis.severity}</span></p><p className="mt-2 text-xs text-zinc-500">Confidence: {analysis.confidence}%</p></article>
          <article className="rounded-xl border border-emerald-600/25 bg-zinc-950/80 p-4"><h3 className="text-sm text-emerald-400">Recommendation</h3><p className="mt-2 text-sm text-zinc-300">{analysis.recommendation}</p></article>
        </div>
      )}
    </section>
  );
}
