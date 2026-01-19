// Types for the Physics-Based Vision System

export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D extends Point2D {
  z: number;
}

export interface LightSource {
  direction: Point3D;
  intensity: number;
  position: Point2D; // For manual mode UI
  isManual: boolean;
}

export interface HandLandmarks {
  landmarks: Point3D[];
  handedness: 'Left' | 'Right';
  confidence: number;
}

export interface FaceLandmarks {
  landmarks: Point3D[];
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  mouthRegion: Point3D[];
}

export interface ShadowAnalysis {
  occludedArea: number;
  shadowBoundary: Point2D[];
  shadowSharpness: number;
  shadowCentroid: Point2D;
  intensityMatrix: number[][];
}

export interface DepthEstimation {
  distance: number; // in cm
  confidence: number;
  formula: string;
  rawValues: {
    shadowArea: number;
    shadowSharpness: number;
    lightAngle: number;
  };
}

export interface ActionClassification {
  action: 'safe' | 'approaching' | 'touching' | 'eating';
  confidence: number;
  timestamp: number;
}

export interface DetectionState {
  isActive: boolean;
  fps: number;
  handDetected: boolean;
  faceDetected: boolean;
  lightSource: LightSource;
  shadowAnalysis: ShadowAnalysis | null;
  depthEstimation: DepthEstimation | null;
  actionClassification: ActionClassification;
}

export interface Settings {
  distanceThreshold: number; // in cm
  shadowSensitivity: number; // 0-1
  lightMode: 'auto' | 'manual';
  viewMode: 'overlay' | 'split';
  showHeatmap: boolean;
  showLightVector: boolean;
  showDebugInfo: boolean;
  soundEnabled: boolean;
}
