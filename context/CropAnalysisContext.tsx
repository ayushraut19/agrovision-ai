"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CropAnalysisResult } from "@/lib/crop-model/types";
import {
  smartAlerts,
  type SmartAlert,
} from "@/lib/dashboard-data";

const AI_ALERT_ID = "alt-ai-scan";

type CropAnalysisContextValue = {
  analysis: CropAnalysisResult | null;
  setAnalysis: (result: CropAnalysisResult | null) => void;
  clearAnalysis: () => void;
  displayHealthScore: number;
  alerts: SmartAlert[];
  dismissAlert: (id: string) => void;
};

const CropAnalysisContext = createContext<CropAnalysisContextValue | null>(
  null,
);

function buildAiAlert(result: CropAnalysisResult): SmartAlert {
  return {
    id: AI_ALERT_ID,
    category: "disease",
    title: result.isHealthy
      ? "AI scan: crop appears healthy"
      : `AI scan: ${result.disease}`,
    message: `${result.isHealthy ? "No disease detected" : result.disease} — ${result.confidence}% confidence, ${result.riskLevel} risk, health ${result.healthScore}%.`,
    field: "Uploaded crop image",
    timestamp: "Just now",
    priority: result.alertPriority,
  };
}

type CropAnalysisProviderProps = {
  children: ReactNode;
  initialHealthScore: number;
};

export function CropAnalysisProvider({
  children,
  initialHealthScore,
}: CropAnalysisProviderProps) {
  const [analysis, setAnalysisState] = useState<CropAnalysisResult | null>(
    null,
  );
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set());

  const setAnalysis = useCallback((result: CropAnalysisResult | null) => {
    setAnalysisState(result);
    if (result) {
      setDismissed((prev) => {
        const next = new Set(prev);
        next.delete(AI_ALERT_ID);
        return next;
      });
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    setAnalysisState(null);
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
  }, []);

  const displayHealthScore = analysis?.healthScore ?? initialHealthScore;

  const alerts = useMemo(() => {
    const base = smartAlerts.filter((a) => !dismissed.has(a.id));
    if (!analysis || dismissed.has(AI_ALERT_ID)) return base;
    return [buildAiAlert(analysis), ...base];
  }, [analysis, dismissed]);

  const value = useMemo(
    () => ({
      analysis,
      setAnalysis,
      clearAnalysis,
      displayHealthScore,
      alerts,
      dismissAlert,
    }),
    [
      analysis,
      setAnalysis,
      clearAnalysis,
      displayHealthScore,
      alerts,
      dismissAlert,
    ],
  );

  return (
    <CropAnalysisContext.Provider value={value}>
      {children}
    </CropAnalysisContext.Provider>
  );
}

export function useCropAnalysis() {
  const ctx = useContext(CropAnalysisContext);
  if (!ctx) {
    throw new Error("useCropAnalysis must be used within CropAnalysisProvider");
  }
  return ctx;
}
