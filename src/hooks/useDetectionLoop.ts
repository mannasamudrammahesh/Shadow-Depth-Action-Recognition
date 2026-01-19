import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
  DetectionState, 
  Settings, 
  LightSource,
  ShadowAnalysis,
  DepthEstimation,
  ActionClassification 
} from '@/types/vision';
import { 
  estimateLightDirection, 
  detectShadowRegion, 
  calculateDepth, 
  classifyAction 
} from '@/lib/physics';
import type { HandLandmarks, FaceLandmarks } from '@/types/vision';

interface UseDetectionLoopProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  handResults: HandLandmarks | null;
  faceResults: FaceLandmarks | null;
  settings: Settings;
  isMediaPipeReady: boolean;
  detectFrame: (video: HTMLVideoElement, timestamp: number) => void;
  drawResults: (ctx: CanvasRenderingContext2D) => void;
  captureFrame: () => ImageData | null;
  manualLightPosition: { x: number; y: number };
}

interface UseDetectionLoopReturn {
  detectionState: DetectionState;
  isRunning: boolean;
  start: () => void;
  stop: () => void;
}

const DEFAULT_LIGHT_SOURCE: LightSource = {
  direction: { x: -0.5, y: -0.5, z: 0.7 },
  intensity: 1,
  position: { x: 0.2, y: 0.2 },
  isManual: false,
};

const DEFAULT_STATE: DetectionState = {
  isActive: false,
  fps: 0,
  handDetected: false,
  faceDetected: false,
  lightSource: DEFAULT_LIGHT_SOURCE,
  shadowAnalysis: null,
  depthEstimation: null,
  actionClassification: { action: 'safe', confidence: 0, timestamp: Date.now() },
};

export function useDetectionLoop({
  videoRef,
  canvasRef,
  handResults,
  faceResults,
  settings,
  isMediaPipeReady,
  detectFrame,
  drawResults,
  captureFrame,
  manualLightPosition,
}: UseDetectionLoopProps): UseDetectionLoopReturn {
  const [detectionState, setDetectionState] = useState<DetectionState>(DEFAULT_STATE);
  const [isRunning, setIsRunning] = useState(false);
  
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const fpsCounterRef = useRef<number[]>([]);

  const processFrame = useCallback(() => {
    if (!isRunning || !videoRef.current || !canvasRef.current || !isMediaPipeReady) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.readyState !== 4) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const now = performance.now();
    
    // Calculate FPS
    fpsCounterRef.current.push(now);
    fpsCounterRef.current = fpsCounterRef.current.filter(t => now - t < 1000);
    const fps = fpsCounterRef.current.length;

    // Run MediaPipe detection
    detectFrame(video, now);

    // Set canvas size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame
    ctx.drawImage(video, 0, 0);

    // Draw detection results
    drawResults(ctx);

    // Calculate physics
    let lightSource = detectionState.lightSource;
    let shadowAnalysis: ShadowAnalysis | null = null;
    let depthEstimation: DepthEstimation | null = null;
    let actionClassification: ActionClassification = { action: 'safe', confidence: 0, timestamp: now };

    // Update light source
    if (settings.lightMode === 'manual') {
      lightSource = {
        ...lightSource,
        direction: {
          x: manualLightPosition.x - 0.5,
          y: manualLightPosition.y - 0.5,
          z: 0.7,
        },
        position: manualLightPosition,
        isManual: true,
      };
    } else if (faceResults) {
      const imageData = captureFrame();
      if (imageData) {
        const direction = estimateLightDirection(faceResults.landmarks, imageData);
        lightSource = {
          ...lightSource,
          direction,
          isManual: false,
        };
      }
    }

    // Calculate shadow and depth if both hand and face are detected
    if (handResults && faceResults) {
      shadowAnalysis = detectShadowRegion(
        handResults.landmarks,
        faceResults.boundingBox,
        lightSource,
        canvas.width,
        canvas.height
      );

      depthEstimation = calculateDepth(
        handResults.landmarks,
        faceResults.mouthRegion,
        shadowAnalysis,
        lightSource
      );

      const classification = classifyAction(depthEstimation.distance, settings.distanceThreshold);
      actionClassification = {
        ...classification,
        timestamp: now,
      };

      // Draw connection line from hand to mouth
      if (handResults.landmarks.length > 8 && faceResults.mouthRegion.length > 0) {
        const handTip = handResults.landmarks[8]; // Index finger tip
        const mouthCenter = faceResults.mouthRegion.reduce(
          (acc, p) => ({ x: acc.x + p.x / faceResults.mouthRegion.length, y: acc.y + p.y / faceResults.mouthRegion.length }),
          { x: 0, y: 0 }
        );

        ctx.beginPath();
        ctx.moveTo(handTip.x * canvas.width, handTip.y * canvas.height);
        ctx.lineTo(mouthCenter.x * canvas.width, mouthCenter.y * canvas.height);
        
        // Color based on distance
        const hue = actionClassification.action === 'safe' ? 160 : 
                    actionClassification.action === 'approaching' ? 60 :
                    actionClassification.action === 'touching' ? 30 : 0;
        ctx.strokeStyle = `hsla(${hue}, 100%, 50%, 0.8)`;
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Update state
    setDetectionState({
      isActive: true,
      fps,
      handDetected: !!handResults,
      faceDetected: !!faceResults,
      lightSource,
      shadowAnalysis,
      depthEstimation,
      actionClassification,
    });

    lastTimeRef.current = now;
    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, [
    isRunning,
    videoRef,
    canvasRef,
    isMediaPipeReady,
    detectFrame,
    drawResults,
    handResults,
    faceResults,
    settings,
    captureFrame,
    manualLightPosition,
    detectionState.lightSource,
  ]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setDetectionState(DEFAULT_STATE);
  }, []);

  // Start/stop detection loop
  useEffect(() => {
    if (isRunning) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, processFrame]);

  return {
    detectionState,
    isRunning,
    start,
    stop,
  };
}
