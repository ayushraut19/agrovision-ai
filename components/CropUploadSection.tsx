"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

type Phase = "idle" | "scanning" | "complete";
type DetectionLabel =
  | "Healthy"
  | "Leaf Blight"
  | "Rust Disease"
  | "Nutrient Deficiency"
  | "Invalid Crop Image";

type AnalysisResult = {
  disease: DetectionLabel;
  severity: "Low" | "Moderate" | "High";
  confidence: number;
  recommendation: string;
  healthLabel: string;
  healthScore: number;
  cropPresenceConfidence: number;
  diseaseConfidence: number;
  qualityWarning: boolean;
};

type ImageFeatures = {
  greenRatio: number;
  yellowRatio: number;
  brownRatio: number;
  orangeRatio: number;
  darkRatio: number;
  paleRatio: number;
  lowSaturationRatio: number;
  textureDamage: number;
  edgeDamage: number;
  edgeDensity: number;
  edgeConsistency: number;
  greenVariation: number;
  organicContourScore: number;
  cropColorDiversity: number;
  darkStreakScore: number;
  scatteredSpotScore: number;
  signature: number;
};

type ClassScore = {
  label: Exclude<DetectionLabel, "Invalid Crop Image">;
  score: number;
  health: number;
};

type CropPresenceResult = {
  isCrop: boolean;
  confidence: number;
  qualityWarning: boolean;
};

const SCAN_DURATION_MS = 900;
const SAMPLE_SIZE = 192;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const clamp01 = (value: number) => clamp(value, 0, 1);

const lerp = (min: number, max: number, value: number) =>
  min + (max - min) * clamp01(value);

function healthBarColor(score: number) {
  if (score >= 82) return "bg-green-500";
  if (score >= 58) return "bg-yellow-500";
  return "bg-red-500";
}

function softScore(value: number, start: number, end: number) {
  if (start === end) return value >= end ? 1 : 0;
  return clamp01((value - start) / (end - start));
}

function computeWeightedHealthScore(features: ImageFeatures) {
  const greenScore = softScore(features.greenRatio, 0.34, 0.74);
  const brownScore = softScore(
    features.brownRatio + features.orangeRatio * 0.7 + features.yellowRatio * 0.35,
    0.035,
    0.22,
  );
  const darkDamage = softScore(
    features.darkRatio + features.darkStreakScore * 0.18,
    0.025,
    0.22,
  );
  const textureDamage = softScore(
    features.textureDamage + features.edgeDamage * 0.35,
    0.1,
    0.46,
  );

  return Math.round(
    clamp(
      55 +
        greenScore * 45 -
        brownScore * 25 -
        darkDamage * 20 -
        textureDamage * 10,
      30,
      98,
    ),
  );
}

async function fileToImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);

  try {
    const image = new Image();
    image.decoding = "async";
    image.src = url;

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Image could not be decoded"));
    });

    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function getImageData(file: File) {
  const image = await fileToImage(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  if (!ctx || image.naturalWidth <= 0 || image.naturalHeight <= 0) {
    throw new Error("Canvas image analysis is unavailable");
  }

  const scale = Math.min(
    1,
    SAMPLE_SIZE / Math.max(image.naturalWidth, image.naturalHeight),
  );
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  return {
    data: ctx.getImageData(0, 0, canvas.width, canvas.height).data,
    width: canvas.width,
    height: canvas.height,
  };
}

function extractFeatures(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): ImageFeatures {
  const pixels = Math.max(1, width * height);
  const brightnessMap = new Float32Array(pixels);
  const greenMap = new Float32Array(pixels);
  const damageMap = new Uint8Array(pixels);
  const darkMap = new Uint8Array(pixels);

  let green = 0;
  let yellow = 0;
  let brown = 0;
  let orange = 0;
  let dark = 0;
  let pale = 0;
  let lowSaturation = 0;
  let textureTotal = 0;
  let saturationTotal = 0;
  let signature = 17;

  for (let i = 0, pixel = 0; i < data.length; i += 4, pixel += 1) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const brightness = (r + g + b) / 3;
    const saturation = max === 0 ? 0 : (max - min) / max;

    const isGreen = g > r * 1.08 && g > b * 1.08 && g > 0.24 && saturation > 0.16;
    const isYellow =
      r > 0.43 && g > 0.42 && b < 0.42 && Math.abs(r - g) < 0.24;
    const isOrange =
      r > 0.43 && g > 0.2 && g < 0.55 && b < 0.34 && r > g * 1.12;
    const isBrown =
      r > 0.28 && g > 0.18 && g < 0.56 && b < 0.38 && r > g * 1.08;
    const isDark = brightness < 0.23 && !isGreen;
    const isPale = brightness > 0.48 && g >= r * 0.85 && saturation < 0.22;
    const isLowSaturation = saturation < 0.18 && brightness > 0.28;
    const isDamaged = isBrown || isOrange || isDark;

    if (isGreen) green += 1;
    if (isYellow) yellow += 1;
    if (isBrown) brown += 1;
    if (isOrange) orange += 1;
    if (isDark) dark += 1;
    if (isPale) pale += 1;
    if (isLowSaturation) lowSaturation += 1;

    textureTotal += Math.abs(g - r) * 0.45 + Math.abs(r - b) * 0.3 + saturation * (1 - brightness) * 0.25;
    saturationTotal += saturation;
    brightnessMap[pixel] = brightness;
    greenMap[pixel] = clamp01(g - (r + b) * 0.5 + 0.35);
    damageMap[pixel] = isDamaged ? 1 : 0;
    darkMap[pixel] = isDark ? 1 : 0;

    if (pixel % 19 === 0) {
      signature = (signature * 31 + Math.round((r * 3 + g * 5 + b * 7) * 1000) + pixel) % 1000003;
    }
  }

  const textureDamage = computeTextureDamage(brightnessMap, width, height, textureTotal / pixels);
  const edgeStats = computeEdgeStats(brightnessMap, width, height);
  const greenVariation = computeGreenVariation(greenMap, width, height);

  return {
    greenRatio: green / pixels,
    yellowRatio: yellow / pixels,
    brownRatio: brown / pixels,
    orangeRatio: orange / pixels,
    darkRatio: dark / pixels,
    paleRatio: pale / pixels,
    lowSaturationRatio: lowSaturation / pixels,
    textureDamage,
    edgeDamage: computeEdgeDamage(brightnessMap, damageMap, width, height),
    edgeDensity: edgeStats.edgeDensity,
    edgeConsistency: edgeStats.edgeConsistency,
    greenVariation,
    organicContourScore: edgeStats.organicContourScore,
    cropColorDiversity: clamp01(saturationTotal / pixels + greenVariation * 2.2),
    darkStreakScore: computeDarkStreakScore(darkMap, width, height),
    scatteredSpotScore: computeScatteredSpotScore(damageMap, width, height),
    signature: signature / 1000003,
  };
}

function computeGreenVariation(
  greenMap: Float32Array,
  width: number,
  height: number,
) {
  const blocks = 6;
  const values: number[] = [];

  for (let by = 0; by < blocks; by += 1) {
    for (let bx = 0; bx < blocks; bx += 1) {
      const startX = Math.floor((bx * width) / blocks);
      const endX = Math.max(startX + 1, Math.floor(((bx + 1) * width) / blocks));
      const startY = Math.floor((by * height) / blocks);
      const endY = Math.max(startY + 1, Math.floor(((by + 1) * height) / blocks));
      let sum = 0;
      let count = 0;

      for (let y = startY; y < endY; y += 1) {
        for (let x = startX; x < endX; x += 1) {
          sum += greenMap[y * width + x];
          count += 1;
        }
      }

      values.push(sum / Math.max(1, count));
    }
  }

  const mean = values.reduce((total, value) => total + value, 0) / values.length;
  const variance =
    values.reduce((total, value) => total + (value - mean) ** 2, 0) / values.length;

  return clamp01(Math.sqrt(variance));
}

function computeEdgeStats(
  brightnessMap: Float32Array,
  width: number,
  height: number,
) {
  const blocks = 8;
  const blockEdges = new Array<number>(blocks * blocks).fill(0);
  const blockPixels = new Array<number>(blocks * blocks).fill(0);
  let edgeCount = 0;
  let strongEdgeCount = 0;
  let checked = 0;

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const i = y * width + x;
      const gradient =
        Math.abs(brightnessMap[i] - brightnessMap[i + 1]) +
        Math.abs(brightnessMap[i] - brightnessMap[i - 1]) +
        Math.abs(brightnessMap[i] - brightnessMap[i + width]) +
        Math.abs(brightnessMap[i] - brightnessMap[i - width]);
      const blockX = Math.min(blocks - 1, Math.floor((x / width) * blocks));
      const blockY = Math.min(blocks - 1, Math.floor((y / height) * blocks));
      const blockIndex = blockY * blocks + blockX;

      checked += 1;
      blockPixels[blockIndex] += 1;

      if (gradient > 0.055) {
        edgeCount += 1;
        blockEdges[blockIndex] += 1;
      }
      if (gradient > 0.18) strongEdgeCount += 1;
    }
  }

  const edgeDensity = edgeCount / Math.max(1, checked);
  const blockRatios = blockEdges.map(
    (count, index) => count / Math.max(1, blockPixels[index]),
  );
  const activeBlocks = blockRatios.filter((ratio) => ratio > 0.025).length;
  const mean =
    blockRatios.reduce((total, value) => total + value, 0) / blockRatios.length;
  const variance =
    blockRatios.reduce((total, value) => total + (value - mean) ** 2, 0) /
    blockRatios.length;
  const consistency = clamp01(1 - Math.sqrt(variance) * 7);
  const organicContourScore = clamp01(
    softScore(edgeDensity, 0.025, 0.13) * 0.45 +
      softScore(strongEdgeCount / Math.max(1, checked), 0.006, 0.06) * 0.25 +
      (activeBlocks / blockRatios.length) * 0.3,
  );

  return {
    edgeDensity: clamp01(edgeDensity),
    edgeConsistency: edgeDensity < 0.012 ? 0 : consistency,
    organicContourScore,
  };
}

function computeTextureDamage(
  brightnessMap: Float32Array,
  width: number,
  height: number,
  colorTexture: number,
) {
  const blocks = 6;
  const values: number[] = [];

  for (let by = 0; by < blocks; by += 1) {
    for (let bx = 0; bx < blocks; bx += 1) {
      const startX = Math.floor((bx * width) / blocks);
      const endX = Math.max(startX + 1, Math.floor(((bx + 1) * width) / blocks));
      const startY = Math.floor((by * height) / blocks);
      const endY = Math.max(startY + 1, Math.floor(((by + 1) * height) / blocks));
      let sum = 0;
      let count = 0;

      for (let y = startY; y < endY; y += 1) {
        for (let x = startX; x < endX; x += 1) {
          sum += brightnessMap[y * width + x];
          count += 1;
        }
      }

      values.push(sum / Math.max(1, count));
    }
  }

  const mean = values.reduce((total, value) => total + value, 0) / values.length;
  const variance =
    values.reduce((total, value) => total + (value - mean) ** 2, 0) / values.length;

  return clamp01(Math.sqrt(variance) * 2.5 + colorTexture * 0.8);
}

function computeEdgeDamage(
  brightnessMap: Float32Array,
  damageMap: Uint8Array,
  width: number,
  height: number,
) {
  let edgeTotal = 0;
  let edgeDamaged = 0;

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const i = y * width + x;
      const gradient =
        Math.abs(brightnessMap[i] - brightnessMap[i + 1]) +
        Math.abs(brightnessMap[i] - brightnessMap[i - 1]) +
        Math.abs(brightnessMap[i] - brightnessMap[i + width]) +
        Math.abs(brightnessMap[i] - brightnessMap[i - width]);

      if (gradient > 0.18) {
        edgeTotal += 1;
        if (damageMap[i]) edgeDamaged += 1;
      }
    }
  }

  if (edgeTotal === 0) return 0;
  return clamp01(edgeDamaged / edgeTotal);
}

function computeDarkStreakScore(darkMap: Uint8Array, width: number, height: number) {
  let longestRun = 0;
  let runRows = 0;

  for (let y = 0; y < height; y += 1) {
    let run = 0;
    let rowBest = 0;

    for (let x = 0; x < width; x += 1) {
      if (darkMap[y * width + x]) {
        run += 1;
        rowBest = Math.max(rowBest, run);
      } else {
        run = 0;
      }
    }

    if (rowBest >= Math.max(4, width * 0.08)) runRows += 1;
    longestRun = Math.max(longestRun, rowBest);
  }

  for (let x = 0; x < width; x += 1) {
    let run = 0;

    for (let y = 0; y < height; y += 1) {
      if (darkMap[y * width + x]) {
        run += 1;
        longestRun = Math.max(longestRun, run);
      } else {
        run = 0;
      }
    }
  }

  return clamp01(longestRun / Math.max(width, height) + (runRows / height) * 0.7);
}

function computeScatteredSpotScore(
  damageMap: Uint8Array,
  width: number,
  height: number,
) {
  const blocks = 8;
  let activeBlocks = 0;
  let sparseBlocks = 0;

  for (let by = 0; by < blocks; by += 1) {
    for (let bx = 0; bx < blocks; bx += 1) {
      const startX = Math.floor((bx * width) / blocks);
      const endX = Math.max(startX + 1, Math.floor(((bx + 1) * width) / blocks));
      const startY = Math.floor((by * height) / blocks);
      const endY = Math.max(startY + 1, Math.floor(((by + 1) * height) / blocks));
      let damaged = 0;
      let count = 0;

      for (let y = startY; y < endY; y += 1) {
        for (let x = startX; x < endX; x += 1) {
          damaged += damageMap[y * width + x];
          count += 1;
        }
      }

      const ratio = damaged / Math.max(1, count);
      if (ratio > 0.015) activeBlocks += 1;
      if (ratio > 0.015 && ratio < 0.28) sparseBlocks += 1;
    }
  }

  return clamp01((activeBlocks / (blocks * blocks)) * 0.65 + (sparseBlocks / Math.max(1, activeBlocks)) * 0.35);
}

function scoreImage(features: ImageFeatures): ClassScore[] {
  const yellowStress = Math.max(features.yellowRatio, features.paleRatio);
  const brownDarkRatio = features.brownRatio + features.darkRatio;
  const totalDamage =
    features.brownRatio + features.orangeRatio + features.darkRatio + features.yellowRatio * 0.55;
  const weightedHealth = computeWeightedHealthScore(features);

  const healthySignals =
    softScore(features.greenRatio, 0.55, 0.78) * 0.28 +
    (1 - softScore(totalDamage, 0.035, 0.12)) * 0.26 +
    (1 - softScore(features.textureDamage, 0.08, 0.22)) * 0.2 +
    (1 - softScore(features.edgeDamage, 0.06, 0.22)) * 0.16 +
    softScore(weightedHealth, 82, 94) * 0.1;

  const rustSignals =
    softScore(features.orangeRatio + features.brownRatio * 0.58, 0.018, 0.14) * 0.34 +
    features.scatteredSpotScore * 0.3 +
    softScore(features.textureDamage, 0.1, 0.32) * 0.13 +
    softScore(features.darkRatio, 0.012, 0.1) * 0.08 +
    (1 - features.darkStreakScore) * 0.07 +
    softScore(features.greenRatio, 0.18, 0.56) * 0.08;

  const blightSignals =
    features.darkStreakScore * 0.32 +
    softScore(features.edgeDamage, 0.08, 0.38) * 0.22 +
    softScore(brownDarkRatio, 0.045, 0.24) * 0.2 +
    softScore(features.textureDamage, 0.14, 0.4) * 0.14 +
    softScore(features.brownRatio, 0.035, 0.18) * 0.12;

  const nutrientSignals =
    softScore(yellowStress + features.lowSaturationRatio * 0.32, 0.1, 0.34) * 0.36 +
    (1 - softScore(features.greenRatio, 0.34, 0.64)) * 0.18 +
    (1 - softScore(features.textureDamage, 0.1, 0.34)) * 0.16 +
    (1 - softScore(brownDarkRatio, 0.04, 0.2)) * 0.16 +
    softScore(features.paleRatio, 0.045, 0.26) * 0.14;

  const scores: ClassScore[] = [
    {
      label: "Healthy",
      score: healthySignals,
      health: clamp(weightedHealth, 85, 98),
    },
    {
      label: "Rust Disease",
      score: rustSignals,
      health: clamp(Math.min(weightedHealth, lerp(75, 45, rustSignals)), 45, 75),
    },
    {
      label: "Leaf Blight",
      score: blightSignals,
      health: clamp(Math.min(weightedHealth, lerp(65, 30, blightSignals)), 30, 65),
    },
    {
      label: "Nutrient Deficiency",
      score: nutrientSignals,
      health: clamp(Math.min(weightedHealth, lerp(80, 55, nutrientSignals)), 55, 80),
    },
  ];

  return scores.sort((a, b) => b.score - a.score);
}

function detectCropPresence(features: ImageFeatures): CropPresenceResult {
  const greenPresence = softScore(
    features.greenRatio + features.yellowRatio * 0.35 + features.paleRatio * 0.25,
    0.1,
    0.38,
  );
  const greenVariation = softScore(features.greenVariation, 0.018, 0.075);
  const texturePattern = softScore(features.textureDamage, 0.045, 0.18);
  const edgeDensity = softScore(features.edgeDensity, 0.025, 0.12);
  const colorDiversity = softScore(features.cropColorDiversity, 0.16, 0.42);
  const organicContours =
    features.organicContourScore * 0.7 + features.edgeConsistency * 0.3;

  const flatPenalty =
    (features.greenRatio > 0.82 &&
      features.greenVariation < 0.025 &&
      features.edgeDensity < 0.04) ||
    (features.textureDamage < 0.045 && features.edgeDensity < 0.018) ||
    features.cropColorDiversity < 0.08
      ? 24
      : 0;

  const confidence = Math.round(
    clamp(
      (greenPresence * 0.22 +
        greenVariation * 0.2 +
        texturePattern * 0.18 +
        edgeDensity * 0.16 +
        organicContours * 0.14 +
        colorDiversity * 0.1) *
        100 -
        flatPenalty,
      0,
      99,
    ),
  );

  const tooFlat =
    features.textureDamage < 0.045 ||
    features.edgeDensity < 0.018 ||
    features.greenVariation < 0.014;
  const artificialSolidGreen =
    features.greenRatio > 0.82 &&
    features.greenVariation < 0.025 &&
    features.edgeDensity < 0.04;

  return {
    confidence,
    isCrop:
      confidence >= 48 &&
      !artificialSolidGreen &&
      !(tooFlat && features.cropColorDiversity < 0.14),
    qualityWarning: confidence < 62 || tooFlat,
  };
}

function validateWinner(winner: ClassScore, scores: ClassScore[], features: ImageFeatures) {
  const totalDamage =
    features.brownRatio + features.orangeRatio + features.darkRatio + features.yellowRatio * 0.55;
  const weightedHealth = computeWeightedHealthScore(features);
  const hasDiseaseTrigger =
    features.darkStreakScore > 0.14 ||
    features.brownRatio > 0.08 ||
    features.orangeRatio > 0.035 ||
    features.scatteredSpotScore > 0.42;

  if (hasDiseaseTrigger) {
    const diseaseScores = scores.filter((score) => score.label !== "Healthy");
    return diseaseScores[0] ?? winner;
  }

  if (
    weightedHealth > 82 &&
    features.greenRatio > 0.58 &&
    features.greenVariation > 0.035 &&
    features.brownRatio < 0.08 &&
    features.orangeRatio < 0.035 &&
    features.yellowRatio < 0.12 &&
    features.darkRatio < 0.07 &&
    totalDamage < 0.12 &&
    features.textureDamage >= 0.045 &&
    features.textureDamage < 0.2 &&
    features.edgeDamage < 0.22 &&
    features.cropColorDiversity > 0.18
  ) {
    return scores.find((score) => score.label === "Healthy") ?? winner;
  }

  if (
    winner.label === "Healthy" &&
    (weightedHealth <= 82 ||
      features.brownRatio >= 0.08 ||
      features.textureDamage >= 0.2 ||
      features.edgeDamage >= 0.22 ||
      features.yellowRatio >= 0.12)
  ) {
    return scores.find((score) => score.label !== "Healthy") ?? winner;
  }

  if (
    winner.label === "Rust Disease" &&
    features.darkStreakScore > 0.28 &&
    features.brownRatio + features.darkRatio > features.orangeRatio + 0.04
  ) {
    return scores.find((score) => score.label === "Leaf Blight") ?? winner;
  }

  if (
    winner.label === "Leaf Blight" &&
    features.orangeRatio > 0.055 &&
    features.scatteredSpotScore > 0.45 &&
    features.darkStreakScore < 0.24
  ) {
    return scores.find((score) => score.label === "Rust Disease") ?? winner;
  }

  return winner;
}

function computeConfidence(scores: ClassScore[], winner: ClassScore, features: ImageFeatures) {
  const runnerUp = scores.find((score) => score.label !== winner.label) ?? scores[1];
  const margin = Math.max(0, winner.score - (runnerUp?.score ?? 0));
  const evidence = clamp01(winner.score);
  const imageQuality = clamp01(0.55 + features.greenRatio * 0.18 + features.textureDamage * 0.12);
  const ambiguityPenalty =
    margin < 0.08 ? 9 : margin < 0.16 ? 5 : 0;

  return Math.round(clamp(64 + evidence * 22 + margin * 36 + imageQuality * 6 - ambiguityPenalty, 58, 96));
}

function buildRecommendation(
  disease: DetectionLabel,
  severity: AnalysisResult["severity"],
  healthScore: number,
) {
  if (disease === "Invalid Crop Image") {
    return "Please upload a clearer crop or leaf image.";
  }

  if (disease === "Healthy") {
    return healthScore > 90
      ? "Crop looks healthy. Maintain irrigation, nutrition, and weekly scouting."
      : "Crop appears stable. Keep monitoring new leaves and avoid overwatering.";
  }

  const urgency =
    severity === "High"
      ? "Act within 24 hours."
      : severity === "Moderate"
        ? "Treat soon and rescan after 48 hours."
        : "Monitor closely before it spreads.";

  const advice: Record<Exclude<DetectionLabel, "Invalid Crop Image">, string> = {
    Healthy: "",
    "Leaf Blight":
      "Remove affected leaves, avoid overhead watering, and apply a suitable fungicide.",
    "Rust Disease":
      "Improve airflow, separate heavily affected plants, and use rust-focused treatment.",
    "Nutrient Deficiency":
      "Check soil nutrients and apply balanced NPK with micronutrients gradually.",
  };

  return `${urgency} ${advice[disease]}`;
}

async function analyzeImage(file: File): Promise<AnalysisResult> {
  const { data, width, height } = await getImageData(file);
  const features = extractFeatures(data, width, height);
  const cropPresence = detectCropPresence(features);

  if (!cropPresence.isCrop) {
    return {
      disease: "Invalid Crop Image",
      severity: "Low",
      confidence: cropPresence.confidence,
      recommendation: buildRecommendation("Invalid Crop Image", "Low", 0),
      healthLabel: "Needs clearer crop image",
      healthScore: 0,
      cropPresenceConfidence: cropPresence.confidence,
      diseaseConfidence: 0,
      qualityWarning: true,
    };
  }

  const scores = scoreImage(features);
  const winner = validateWinner(scores[0], scores, features);
  const diseaseConfidence = computeConfidence(scores, winner, features);
  const healthScore = Math.round(clamp(winner.health, 30, 98));
  const severity = healthScore >= 78 ? "Low" : healthScore >= 58 ? "Moderate" : "High";

  return {
    disease: winner.label,
    severity,
    confidence: diseaseConfidence,
    recommendation: buildRecommendation(winner.label, severity, healthScore),
    healthLabel:
      healthScore >= 85
        ? "Strong health"
        : healthScore >= 65
          ? "Needs monitoring"
          : "At risk",
    healthScore,
    cropPresenceConfidence: cropPresence.confidence,
    diseaseConfidence,
    qualityWarning: cropPresence.qualityWarning,
  };
}

export function CropUploadSection() {
  const { language, t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string | null>(null);
  const scanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragCounterRef = useRef(0);
  const analysisRunRef = useRef(0);

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
    analysisRunRef.current += 1;
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

  const handleFile = useCallback(
    async (file?: File) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        setError(t.upload.invalidFile);
        return;
      }

      const runId = analysisRunRef.current + 1;
      analysisRunRef.current = runId;
      if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
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
        scanTimerRef.current = setTimeout(() => {
          if (analysisRunRef.current !== runId) return;
          setAnalysis(result);
          setPhase("complete");
        }, SCAN_DURATION_MS);
      } catch {
        if (analysisRunRef.current !== runId) return;
        setError(t.upload.failed);
        setPhase("idle");
      }
    },
    [clearPreview, t.upload.failed, t.upload.invalidFile],
  );

  useEffect(
    () => () => {
      if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
      clearPreview();
    },
    [clearPreview],
  );

  return (
    <section
      className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6"
      aria-labelledby="upload-heading"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {t.upload.eyebrow}
          </p>
          <h2 id="upload-heading" className="text-xl font-bold text-green-400">
            {t.upload.title}
          </h2>
        </div>
        <p className="text-xs text-zinc-500">{t.upload.meta}</p>
      </div>

      <div
        className={`mt-5 overflow-hidden rounded-xl border-2 border-dashed transition-colors ${
          isDragging
            ? "border-green-400 bg-green-950/30"
            : preview
              ? "border-green-600/40 bg-zinc-950"
              : "border-zinc-700 bg-zinc-950/50 hover:border-zinc-600"
        }`}
        onDragEnter={(event) => {
          event.preventDefault();
          dragCounterRef.current += 1;
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          dragCounterRef.current -= 1;
          if (dragCounterRef.current <= 0) {
            dragCounterRef.current = 0;
            setIsDragging(false);
          }
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          dragCounterRef.current = 0;
          setIsDragging(false);
          void handleFile(event.dataTransfer.files?.[0]);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />

        {!preview ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center gap-3 px-6 py-14 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-zinc-700 text-xl text-zinc-300">
              +
            </span>
            <span className="text-sm font-medium text-zinc-200">
              {isDragging ? t.upload.release : t.upload.drop}
            </span>
            <span className="text-xs text-zinc-500">{t.upload.formats}</span>
          </button>
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Uploaded crop preview"
              className="max-h-80 w-full object-cover"
            />
            <p className="truncate px-4 py-2 text-xs text-zinc-500">{fileName}</p>
          </>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {preview && (
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
          >
            {t.upload.replace}
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800"
          >
            {t.upload.reset}
          </button>
          {phase === "scanning" && (
            <span className="self-center text-sm text-zinc-500">
              {t.upload.scanning}
            </span>
          )}
        </div>
      )}

      {phase === "complete" && analysis && (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-green-600/30 bg-zinc-950/80 p-4">
            <h3 className="text-sm text-green-400">{t.analysis.healthScore}</h3>
            <p className="mt-2 text-4xl font-bold text-green-400">
              {analysis.disease === "Invalid Crop Image"
                ? "--"
                : `${analysis.healthScore}%`}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {analysis.disease === "Invalid Crop Image"
                ? t.diseases["Invalid Crop Image"]
                : analysis.healthScore >= 85
                ? t.analysis.strong
                : analysis.healthScore >= 65
                  ? t.analysis.monitoring
                  : t.analysis.risk}
            </p>
            <div className="mt-4 h-2 rounded-full bg-zinc-800">
              <div
                className={`h-full rounded-full ${healthBarColor(analysis.healthScore)}`}
                style={{
                  width:
                    analysis.disease === "Invalid Crop Image"
                      ? "0%"
                      : `${analysis.healthScore}%`,
                }}
              />
            </div>
            <p className="mt-3 text-xs text-zinc-500">
              {t.analysis.cropPresenceConfidence}:{" "}
              {analysis.cropPresenceConfidence}%
            </p>
          </article>
          <article className="rounded-xl border border-zinc-700 bg-zinc-950/80 p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm text-zinc-400">{t.analysis.analysis}</h3>
              {analysis.qualityWarning ? (
                <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-400">
                  {t.analysis.poorQuality}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-lg font-semibold text-zinc-100">
              {t.diseases[analysis.disease]}
            </p>
            {analysis.disease !== "Invalid Crop Image" ? (
              <p className="mt-2 text-sm text-zinc-400">
                {t.analysis.severity}:{" "}
                <span className="text-yellow-400">
                  {analysis.severity === "Low"
                    ? t.analysis.low
                    : analysis.severity === "Moderate"
                      ? t.analysis.moderate
                      : t.analysis.high}
                </span>
              </p>
            ) : null}
            <p className="mt-2 text-xs text-zinc-500">
              {t.analysis.diseaseConfidence}: {analysis.diseaseConfidence}%
            </p>
          </article>
          <article className="rounded-xl border border-emerald-600/25 bg-zinc-950/80 p-4">
            <h3 className="text-sm text-emerald-400">
              {t.analysis.recommendation}
            </h3>
            <p className="mt-2 text-sm text-zinc-300">
              {language === "en"
                ? analysis.recommendation
                : t.recommendations[analysis.disease]}
            </p>
          </article>
        </div>
      )}
    </section>
  );
}
