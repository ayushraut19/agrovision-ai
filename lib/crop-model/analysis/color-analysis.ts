import type {
  DominantColor,
  ImageAnalysisProfile,
} from "@/lib/crop-model/analysis/types";

export type { ImageAnalysisProfile, DominantColor } from "@/lib/crop-model/analysis/types";

export const ANALYSIS_SIZE = 128;
const BLOCKS = 8;

/**
 * Browser-only image feature extraction. It intentionally avoids TensorFlow so
 * hackathon demos stay light, deterministic, and offline-friendly.
 */
export async function analyzeImageColors(
  image: HTMLImageElement,
): Promise<ImageAnalysisProfile> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  if (!ctx || image.naturalWidth <= 0 || image.naturalHeight <= 0) {
    throw new Error("Image analysis failed. Try another crop photo.");
  }

  const scale = Math.min(
    1,
    ANALYSIS_SIZE / Math.max(image.naturalWidth, image.naturalHeight),
  );
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return extractImageFeaturesFromPixels(data, canvas.width, canvas.height);
}

function extractImageFeaturesFromPixels(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): ImageAnalysisProfile {
  const pixels = Math.max(1, width * height);
  const brightnessMap = new Float32Array(pixels);
  const damageMap = new Uint8Array(pixels);

  let rSum = 0;
  let gSum = 0;
  let bSum = 0;
  let brightnessSum = 0;
  let saturationSum = 0;
  let green = 0;
  let brown = 0;
  let yellow = 0;
  let orange = 0;
  let pale = 0;
  let dark = 0;
  let dryness = 0;
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
    const isBrown =
      r > 0.28 && g > 0.18 && g < 0.56 && b < 0.38 && r > g * 1.08 && !isGreen;
    const isYellow =
      r > 0.43 && g > 0.42 && b < 0.42 && Math.abs(r - g) < 0.24 && !isGreen;
    const isOrange =
      r > 0.43 && g > 0.2 && g < 0.55 && b < 0.34 && r > g * 1.12 && !isGreen;
    const isPale = brightness > 0.48 && g >= r * 0.85 && saturation < 0.22;
    const isDark = brightness < 0.23 && !isGreen;
    const isDamaged = isBrown || isOrange || isDark || isPale;

    rSum += r;
    gSum += g;
    bSum += b;
    brightnessSum += brightness;
    saturationSum += saturation;
    brightnessMap[pixel] = brightness;
    damageMap[pixel] = isDamaged ? 1 : 0;

    if (isGreen) green += 1;
    if (isBrown) brown += 1;
    if (isYellow) yellow += 1;
    if (isOrange) orange += 1;
    if (isPale) pale += 1;
    if (isDark) dark += 1;
    if (isBrown) dryness += 1 - saturation;

    if (pixel % 19 === 0) {
      signature =
        (signature * 31 + Math.round((r * 3 + g * 5 + b * 7) * 1000) + pixel) %
        1000003;
    }
  }

  const greenPixelRatio = green / pixels;
  const brownPatchRatio = brown / pixels;
  const yellowPatchRatio = yellow / pixels;
  const orangeRustRatio = orange / pixels;
  const paleRegionRatio = pale / pixels;
  const darkLesionRatio = dark / pixels;
  const unhealthyColorRatio = Math.min(
    1,
    brownPatchRatio + orangeRustRatio + paleRegionRatio + darkLesionRatio,
  );
  const textureIrregularity = computeTextureIrregularity(brightnessMap, width, height);
  const edgeDamageRatio = computeEdgeDamage(brightnessMap, damageMap, width, height);
  const colorClusterSpread = computeClusterSpread(data, width, height);

  return {
    meanR: rSum / pixels,
    meanG: gSum / pixels,
    meanB: bSum / pixels,
    brightness: brightnessSum / pixels,
    saturation: saturationSum / pixels,
    dominantColor: pickDominantColor({
      green: greenPixelRatio,
      brown: brownPatchRatio,
      yellow: yellowPatchRatio + paleRegionRatio,
      dark: darkLesionRatio,
    }),
    greenPixelRatio,
    brownPatchRatio,
    yellowPatchRatio,
    orangeRustRatio,
    paleRegionRatio,
    darkLesionRatio,
    unhealthyColorRatio,
    drynessIndex: dryness / pixels,
    textureIrregularity,
    edgeDamageRatio,
    colorClusterSpread,
    patternStrength: clamp01(
      Math.max(
        greenPixelRatio,
        brownPatchRatio,
        orangeRustRatio,
        darkLesionRatio,
        paleRegionRatio,
      ) -
        Math.min(
          greenPixelRatio,
          brownPatchRatio,
          orangeRustRatio,
          darkLesionRatio,
          paleRegionRatio,
        ) *
          0.5,
    ),
    imageSignature: signature / 1000003,
  };
}

function computeTextureIrregularity(
  brightnessMap: Float32Array,
  width: number,
  height: number,
) {
  const values: number[] = [];

  for (let row = 0; row < BLOCKS; row += 1) {
    for (let col = 0; col < BLOCKS; col += 1) {
      const startX = Math.floor((col * width) / BLOCKS);
      const endX = Math.max(startX + 1, Math.floor(((col + 1) * width) / BLOCKS));
      const startY = Math.floor((row * height) / BLOCKS);
      const endY = Math.max(startY + 1, Math.floor(((row + 1) * height) / BLOCKS));
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

  return clamp01(Math.sqrt(variance) * 2.5);
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

  return edgeTotal === 0 ? 0 : clamp01(edgeDamaged / edgeTotal);
}

function computeClusterSpread(
  data: Uint8ClampedArray,
  width: number,
  height: number,
) {
  const quadrants = [
    { x0: 0, y0: 0, x1: Math.floor(width / 2), y1: Math.floor(height / 2) },
    { x0: Math.floor(width / 2), y0: 0, x1: width, y1: Math.floor(height / 2) },
    { x0: 0, y0: Math.floor(height / 2), x1: Math.floor(width / 2), y1: height },
    { x0: Math.floor(width / 2), y0: Math.floor(height / 2), x1: width, y1: height },
  ];

  const values = quadrants.map((quad) => {
    let sum = 0;
    let count = 0;

    for (let y = quad.y0; y < quad.y1; y += 1) {
      for (let x = quad.x0; x < quad.x1; x += 1) {
        const i = (y * width + x) * 4;
        sum += (data[i] + data[i + 1] + data[i + 2]) / (255 * 3);
        count += 1;
      }
    }

    return sum / Math.max(1, count);
  });

  const mean = values.reduce((total, value) => total + value, 0) / values.length;
  const variance =
    values.reduce((total, value) => total + (value - mean) ** 2, 0) / values.length;

  return clamp01(Math.sqrt(variance));
}

function pickDominantColor(ratios: {
  green: number;
  brown: number;
  yellow: number;
  dark: number;
}): DominantColor {
  const entries: [DominantColor, number][] = [
    ["green", ratios.green],
    ["brown", ratios.brown],
    ["yellow", ratios.yellow],
    ["dark", ratios.dark],
  ];
  entries.sort((a, b) => b[1] - a[1]);

  if (entries[0][1] - entries[1][1] < 0.06) return "mixed";
  return entries[0][0];
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

/** @deprecated Use ImageAnalysisProfile - kept for imports */
export type ImageFeatures = ImageAnalysisProfile;

export const extractImageFeatures = analyzeImageColors;
