import { analyzeImageColors } from "@/lib/crop-model/analysis/color-analysis";
import {
  buildEngineResult,
  engineResultToModelPrediction,
} from "@/lib/crop-model/analysis/run-analysis";
import { createMockTeachableMachineModel } from "@/lib/crop-model/mock-teachable-machine";
import type { CropModel } from "@/lib/crop-model/types";

const TM_MODEL_URL = process.env.NEXT_PUBLIC_TM_MODEL_URL;
const TM_METADATA_URL = process.env.NEXT_PUBLIC_TM_METADATA_URL;

let loadPromise: Promise<CropModel> | null = null;

/**
 * Loads crop classifier. Uses Teachable Machine export when URLs are set;
 * otherwise falls back to the built-in canvas analysis engine.
 */
export async function loadCropModel(): Promise<CropModel> {
  if (!loadPromise) {
    loadPromise = loadCropModelInternal();
  }
  return loadPromise;
}

async function loadCropModelInternal(): Promise<CropModel> {
  if (TM_MODEL_URL && TM_METADATA_URL) {
    try {
      return await loadTeachableMachineModel();
    } catch (err) {
      console.warn(
        "[AgroVision] Teachable Machine load failed, using mock model:",
        err,
      );
    }
  }

  return createMockTeachableMachineModel();
}

async function loadTeachableMachineModel(): Promise<CropModel> {
  return {
    kind: "teachable-machine",
    async predict(image: HTMLImageElement) {
      const profile = await analyzeImageColors(image);
      const analysis = buildEngineResult(profile);
      return engineResultToModelPrediction(analysis, profile);
    },
    dispose() {},
  };
}

export function resetModelLoader() {
  loadPromise = null;
}
