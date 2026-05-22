"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadImageElement, sleep } from "@/lib/crop-model/image-utils";
import { loadCropModel } from "@/lib/crop-model/load-model";
import { mapPredictionToAnalysis } from "@/lib/crop-model/labels";
import type { CropAnalysisResult } from "@/lib/crop-model/types";
import type { CropModel } from "@/lib/crop-model/types";

const MIN_SCAN_MS = 900;

export type ModelLoadState = "idle" | "loading" | "ready" | "error";

export function useCropClassifier() {
  const modelRef = useRef<CropModel | null>(null);
  const [modelState, setModelState] = useState<ModelLoadState>("idle");
  const [modelKind, setModelKind] = useState<"mock" | "teachable-machine" | null>(
    null,
  );
  const [isPredicting, setIsPredicting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setModelState("loading");
      setError(null);
      try {
        const model = await loadCropModel();
        if (cancelled) {
          model.dispose();
          return;
        }
        modelRef.current = model;
        setModelKind(model.kind);
        setModelState("ready");
      } catch (err) {
        if (!cancelled) {
          setModelState("error");
          setError(
            err instanceof Error ? err.message : "Failed to load AI model",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
      modelRef.current?.dispose();
      modelRef.current = null;
    };
  }, []);

  const predictFromUrl = useCallback(
    async (imageUrl: string): Promise<CropAnalysisResult> => {
      if (!modelRef.current) {
        throw new Error("AI model is not ready yet");
      }

      setIsPredicting(true);
      setError(null);
      const started = Date.now();

      try {
        const img = await loadImageElement(imageUrl);
        const prediction = await modelRef.current.predict(img);

        const analysis =
          prediction.analysis ??
          (prediction.features
            ? mapPredictionToAnalysis(
                prediction.className,
                prediction.probability,
                prediction.features,
                prediction.predictions.map((p) => p.probability),
              )
            : null);

        if (!analysis) {
          throw new Error("Analysis result missing from model output");
        }

        const elapsed = Date.now() - started;
        if (elapsed < MIN_SCAN_MS) {
          await sleep(MIN_SCAN_MS - elapsed);
        }

        return analysis;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Prediction failed";
        setError(message);
        throw err;
      } finally {
        setIsPredicting(false);
      }
    },
    [],
  );

  return {
    modelState,
    modelKind,
    isPredicting,
    error,
    predictFromUrl,
  };
}
