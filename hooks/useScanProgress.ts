"use client";

import { useEffect, useState } from "react";

const SCAN_STAGES = [
  "Initializing crop scan...",
  "Extracting leaf color signatures...",
  "Matching disease pattern library...",
  "Computing health and risk scores...",
] as const;

const STAGE_INTERVAL_MS = 650;

export function useScanProgress(active: boolean) {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    if (!active) return;

    const id = setInterval(() => {
      setStageIndex((i) => (i + 1) % SCAN_STAGES.length);
    }, STAGE_INTERVAL_MS);

    return () => clearInterval(id);
  }, [active]);

  return {
    statusText: active ? "AI Scanning Crop..." : "",
    subText: active ? SCAN_STAGES[stageIndex] : "",
    progress: active
      ? Math.min(95, 20 + ((stageIndex + 1) / SCAN_STAGES.length) * 70)
      : 0,
  };
}
