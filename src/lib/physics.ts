// Physics-Based Shadow Analysis and Depth Estimation

import type { 
  Point2D, 
  Point3D, 
  LightSource, 
  ShadowAnalysis, 
  DepthEstimation 
} from '@/types/vision';

/**
 * Calculate shadow projection using the Inverse Square Law
 * Light intensity diminishes with the square of the distance
 * I = I₀ / d²
 */
export function calculateInverseSquareLaw(
  intensity: number,
  distance: number
): number {
  if (distance <= 0) return intensity;
  return intensity / (distance * distance);
}

/**
 * Estimate light source direction from facial shading gradients
 * Analyzes the brightness distribution across the face
 */
export function estimateLightDirection(
  faceLandmarks: Point3D[],
  imageData: ImageData
): Point3D {
  if (faceLandmarks.length === 0) {
    return { x: -0.5, y: -0.5, z: 0.7 }; // Default: top-left light
  }

  const width = imageData.width;
  const data = imageData.data;
  
  // Sample brightness at key facial regions
  let leftBrightness = 0;
  let rightBrightness = 0;
  let topBrightness = 0;
  let bottomBrightness = 0;
  let samples = 0;

  // Use facial landmarks to sample brightness
  faceLandmarks.forEach((point, index) => {
    const px = Math.floor(point.x * width);
    const py = Math.floor(point.y * imageData.height);
    const idx = (py * width + px) * 4;
    
    if (idx >= 0 && idx < data.length - 4) {
      const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      
      // Categorize by position on face
      if (point.x < 0.5) leftBrightness += brightness;
      else rightBrightness += brightness;
      
      if (point.y < 0.5) topBrightness += brightness;
      else bottomBrightness += brightness;
      
      samples++;
    }
  });

  if (samples === 0) {
    return { x: -0.5, y: -0.5, z: 0.7 };
  }

  // Normalize and calculate direction
  const horizontalGradient = (rightBrightness - leftBrightness) / samples;
  const verticalGradient = (bottomBrightness - topBrightness) / samples;

  // Light comes from the brighter side
  const lightX = -horizontalGradient / 255;
  const lightY = -verticalGradient / 255;
  const lightZ = Math.sqrt(1 - lightX * lightX - lightY * lightY) || 0.7;

  return { x: lightX, y: lightY, z: lightZ };
}

/**
 * Detect shadow regions on the face caused by hand occlusion
 */
export function detectShadowRegion(
  handLandmarks: Point3D[],
  faceBoundingBox: { x: number; y: number; width: number; height: number },
  lightSource: LightSource,
  canvasWidth: number,
  canvasHeight: number
): ShadowAnalysis {
  // Calculate hand centroid
  const handCentroid = handLandmarks.reduce(
    (acc, point) => ({
      x: acc.x + point.x / handLandmarks.length,
      y: acc.y + point.y / handLandmarks.length,
      z: acc.z + (point.z || 0) / handLandmarks.length,
    }),
    { x: 0, y: 0, z: 0 }
  );

  // Project shadow based on light direction
  const shadowOffset: Point2D = {
    x: lightSource.direction.x * 0.1 * (1 - handCentroid.z),
    y: lightSource.direction.y * 0.1 * (1 - handCentroid.z),
  };

  // Calculate shadow boundary (simplified convex hull of hand)
  const shadowBoundary: Point2D[] = handLandmarks.map((point) => ({
    x: (point.x + shadowOffset.x) * canvasWidth,
    y: (point.y + shadowOffset.y) * canvasHeight,
  }));

  // Calculate occluded area (intersection with face region)
  const faceRect = {
    left: faceBoundingBox.x * canvasWidth,
    top: faceBoundingBox.y * canvasHeight,
    right: (faceBoundingBox.x + faceBoundingBox.width) * canvasWidth,
    bottom: (faceBoundingBox.y + faceBoundingBox.height) * canvasHeight,
  };

  let occludedPoints = 0;
  shadowBoundary.forEach((point) => {
    if (
      point.x >= faceRect.left &&
      point.x <= faceRect.right &&
      point.y >= faceRect.top &&
      point.y <= faceRect.bottom
    ) {
      occludedPoints++;
    }
  });

  const occludedArea = (occludedPoints / shadowBoundary.length) * 100;

  // Calculate shadow sharpness based on hand-face distance
  const handFaceDistance = Math.abs(handCentroid.z);
  const shadowSharpness = Math.max(0, 1 - handFaceDistance * 5);

  // Generate intensity matrix (16x16 grid for heatmap)
  const matrixSize = 16;
  const intensityMatrix: number[][] = [];
  
  for (let y = 0; y < matrixSize; y++) {
    const row: number[] = [];
    for (let x = 0; x < matrixSize; x++) {
      // Calculate position in face region
      const posX = faceRect.left + (x / matrixSize) * (faceRect.right - faceRect.left);
      const posY = faceRect.top + (y / matrixSize) * (faceRect.bottom - faceRect.top);
      
      // Calculate distance from hand centroid
      const dx = posX / canvasWidth - handCentroid.x;
      const dy = posY / canvasHeight - handCentroid.y;
      const distFromHand = Math.sqrt(dx * dx + dy * dy);
      
      // Apply inverse square law for shadow intensity
      const intensity = Math.min(1, distFromHand * 3);
      row.push(intensity);
    }
    intensityMatrix.push(row);
  }

  return {
    occludedArea,
    shadowBoundary,
    shadowSharpness,
    shadowCentroid: {
      x: (handCentroid.x + shadowOffset.x) * canvasWidth,
      y: (handCentroid.y + shadowOffset.y) * canvasHeight,
    },
    intensityMatrix,
  };
}

/**
 * Calculate 3D distance between hand and mouth using shadow physics
 * Formula: Z = k * sqrt(Shadow_Area) * (1 / Shadow_Sharpness) * cos(θ)
 */
export function calculateDepth(
  handLandmarks: Point3D[],
  mouthLandmarks: Point3D[],
  shadowAnalysis: ShadowAnalysis,
  lightSource: LightSource
): DepthEstimation {
  if (handLandmarks.length === 0 || mouthLandmarks.length === 0) {
    return {
      distance: Infinity,
      confidence: 0,
      formula: 'No detection',
      rawValues: { shadowArea: 0, shadowSharpness: 0, lightAngle: 0 },
    };
  }

  // Calculate hand fingertip centroid (tips of fingers)
  const fingertipIndices = [4, 8, 12, 16, 20]; // Thumb, Index, Middle, Ring, Pinky tips
  const fingertips = fingertipIndices
    .filter((i) => i < handLandmarks.length)
    .map((i) => handLandmarks[i]);

  const handPoint = fingertips.reduce(
    (acc, p) => ({
      x: acc.x + p.x / fingertips.length,
      y: acc.y + p.y / fingertips.length,
      z: acc.z + (p.z || 0) / fingertips.length,
    }),
    { x: 0, y: 0, z: 0 }
  );

  // Calculate mouth centroid
  const mouthPoint = mouthLandmarks.reduce(
    (acc, p) => ({
      x: acc.x + p.x / mouthLandmarks.length,
      y: acc.y + p.y / mouthLandmarks.length,
      z: acc.z + (p.z || 0) / mouthLandmarks.length,
    }),
    { x: 0, y: 0, z: 0 }
  );

  // 2D distance (normalized)
  const dx = handPoint.x - mouthPoint.x;
  const dy = handPoint.y - mouthPoint.y;
  const distance2D = Math.sqrt(dx * dx + dy * dy);

  // Z-distance from landmarks (if available)
  const dz = Math.abs((handPoint.z || 0) - (mouthPoint.z || 0));

  // Calculate light angle factor
  const lightAngle = Math.atan2(
    lightSource.direction.y,
    lightSource.direction.x
  );

  // Physics-based depth estimation
  // Using shadow sharpness and area to estimate Z
  const k = 30; // Calibration constant (adjustable)
  const shadowFactor = shadowAnalysis.shadowSharpness > 0 
    ? 1 / shadowAnalysis.shadowSharpness 
    : 10;
  const areaFactor = Math.sqrt(Math.max(1, shadowAnalysis.occludedArea));
  const angleFactor = Math.abs(Math.cos(lightAngle)) + 0.1;

  // Combined depth estimation
  const zEstimate = k * (distance2D + dz * 0.3) * shadowFactor * angleFactor / areaFactor;
  
  // Convert to centimeters (approximate, assuming 50cm face-to-camera distance)
  const distanceCm = Math.max(0.5, zEstimate * 50);

  // Confidence based on detection quality
  const confidence = Math.min(
    1,
    (shadowAnalysis.shadowSharpness + 0.5) * 
    (shadowAnalysis.occludedArea / 50 + 0.5) * 
    (1 - distance2D)
  );

  return {
    distance: Math.round(distanceCm * 10) / 10,
    confidence: Math.max(0, Math.min(1, confidence)),
    formula: `Z = ${k} × √(${shadowAnalysis.occludedArea.toFixed(1)}) × (1/${shadowAnalysis.shadowSharpness.toFixed(2)}) × cos(${(lightAngle * 180 / Math.PI).toFixed(0)}°)`,
    rawValues: {
      shadowArea: shadowAnalysis.occludedArea,
      shadowSharpness: shadowAnalysis.shadowSharpness,
      lightAngle: lightAngle * 180 / Math.PI,
    },
  };
}

/**
 * Classify action based on calculated distance
 */
export function classifyAction(
  distance: number,
  threshold: number
): { action: 'safe' | 'approaching' | 'touching' | 'eating'; confidence: number } {
  if (distance === Infinity) {
    return { action: 'safe', confidence: 0 };
  }

  if (distance <= threshold) {
    return { action: 'eating', confidence: 0.9 };
  } else if (distance <= threshold * 2) {
    return { action: 'touching', confidence: 0.8 };
  } else if (distance <= threshold * 4) {
    return { action: 'approaching', confidence: 0.7 };
  }

  return { action: 'safe', confidence: 1 };
}
