import { analyzeImageColors } from "@/lib/crop-model/analysis/color-analysis";
import {
  buildEngineResult,
  engineResultToModelPrediction,
  runCropImageAnalysis,
} from "@/lib/crop-model/analysis/run-analysis";
import type { CropModel } from "@/lib/crop-model/types";

/**
 * Frontend-only analysis engine (canvas preprocessing + rule-based classification).
 * Replace with Teachable Machine URLs when a trained model is available.
 */
export function createMockTeachableMachineModel(): CropModel {
  let disposed = false;

  return {
    kind: "mock",
    async predict(image) {
      if (disposed) throw new Error("Model has been disposed");

      const profile = await analyzeImageColors(image);
      const analysis = buildEngineResult(profile);
      return engineResultToModelPrediction(analysis, profile);
    },
    dispose() {
      disposed = true;
    },
  };
}

export { runCropImageAnalysis };
