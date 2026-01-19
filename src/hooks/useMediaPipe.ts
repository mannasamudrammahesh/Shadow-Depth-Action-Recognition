import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  FaceLandmarker, 
  HandLandmarker, 
  FilesetResolver,
  DrawingUtils
} from '@mediapipe/tasks-vision';
import type { HandLandmarks, FaceLandmarks, Point3D } from '@/types/vision';

interface UseMediaPipeReturn {
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  handResults: HandLandmarks | null;
  faceResults: FaceLandmarks | null;
  detectFrame: (video: HTMLVideoElement, timestamp: number) => void;
  drawResults: (ctx: CanvasRenderingContext2D) => void;
}

// Mouth landmark indices in MediaPipe Face Mesh
const MOUTH_INDICES = [
  61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291,
  375, 321, 405, 314, 17, 84, 181, 91, 146
];

export function useMediaPipe(): UseMediaPipeReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [handResults, setHandResults] = useState<HandLandmarks | null>(null);
  const [faceResults, setFaceResults] = useState<FaceLandmarks | null>(null);

  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const lastHandResultRef = useRef<any>(null);
  const lastFaceResultRef = useRef<any>(null);

  // Initialize MediaPipe
  useEffect(() => {
    let isMounted = true;

    async function initializeMediaPipe() {
      try {
        setIsLoading(true);
        setError(null);

        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        // Initialize Face Landmarker
        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
        });

        // Initialize Hand Landmarker
        const handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
        });

        if (isMounted) {
          faceLandmarkerRef.current = faceLandmarker;
          handLandmarkerRef.current = handLandmarker;
          setIsReady(true);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Failed to initialize MediaPipe';
          setError(message);
          setIsLoading(false);
          console.error('MediaPipe initialization error:', err);
        }
      }
    }

    initializeMediaPipe();

    return () => {
      isMounted = false;
      faceLandmarkerRef.current?.close();
      handLandmarkerRef.current?.close();
    };
  }, []);

  const detectFrame = useCallback((video: HTMLVideoElement, timestamp: number) => {
    if (!faceLandmarkerRef.current || !handLandmarkerRef.current || !isReady) {
      return;
    }

    try {
      // Detect hands
      const handResult = handLandmarkerRef.current.detectForVideo(video, timestamp);
      lastHandResultRef.current = handResult;

      if (handResult.landmarks && handResult.landmarks.length > 0) {
        const landmarks: Point3D[] = handResult.landmarks[0].map((lm: any) => ({
          x: lm.x,
          y: lm.y,
          z: lm.z || 0,
        }));

        setHandResults({
          landmarks,
          handedness: handResult.handednesses?.[0]?.[0]?.categoryName === 'Left' ? 'Left' : 'Right',
          confidence: handResult.handednesses?.[0]?.[0]?.score || 0.5,
        });
      } else {
        setHandResults(null);
      }

      // Detect face
      const faceResult = faceLandmarkerRef.current.detectForVideo(video, timestamp);
      lastFaceResultRef.current = faceResult;

      if (faceResult.faceLandmarks && faceResult.faceLandmarks.length > 0) {
        const allLandmarks: Point3D[] = faceResult.faceLandmarks[0].map((lm: any) => ({
          x: lm.x,
          y: lm.y,
          z: lm.z || 0,
        }));

        // Extract mouth region
        const mouthRegion = MOUTH_INDICES
          .filter(i => i < allLandmarks.length)
          .map(i => allLandmarks[i]);

        // Calculate bounding box
        const xs = allLandmarks.map(p => p.x);
        const ys = allLandmarks.map(p => p.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        setFaceResults({
          landmarks: allLandmarks,
          boundingBox: {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
          },
          mouthRegion,
        });
      } else {
        setFaceResults(null);
      }
    } catch (err) {
      console.error('Detection error:', err);
    }
  }, [isReady]);

  const drawResults = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!lastHandResultRef.current && !lastFaceResultRef.current) return;

    const drawingUtils = new DrawingUtils(ctx);

    // Draw face landmarks (minimal, just mouth region)
    if (lastFaceResultRef.current?.faceLandmarks) {
      for (const landmarks of lastFaceResultRef.current.faceLandmarks) {
        // Draw mouth region only
        const mouthPoints = MOUTH_INDICES.map(i => landmarks[i]).filter(Boolean);
        if (mouthPoints.length > 0) {
          ctx.beginPath();
          ctx.moveTo(mouthPoints[0].x * ctx.canvas.width, mouthPoints[0].y * ctx.canvas.height);
          mouthPoints.forEach((point: any) => {
            ctx.lineTo(point.x * ctx.canvas.width, point.y * ctx.canvas.height);
          });
          ctx.closePath();
          ctx.strokeStyle = 'hsl(270, 100%, 65%)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    }

    // Draw hand landmarks with connections
    if (lastHandResultRef.current?.landmarks) {
      for (const landmarks of lastHandResultRef.current.landmarks) {
        // Draw landmarks as points
        landmarks.forEach((point: any, index: number) => {
          const x = point.x * ctx.canvas.width;
          const y = point.y * ctx.canvas.height;
          
          // Fingertips are larger
          const isFingertip = [4, 8, 12, 16, 20].includes(index);
          const radius = isFingertip ? 6 : 3;
          
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, 2 * Math.PI);
          ctx.fillStyle = isFingertip ? 'hsl(185, 100%, 55%)' : 'hsl(160, 100%, 50%)';
          ctx.fill();
          
          if (isFingertip) {
            ctx.shadowColor = 'hsl(185, 100%, 55%)';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        });

        // Draw hand connections
        const connections = [
          [0, 1], [1, 2], [2, 3], [3, 4],
          [0, 5], [5, 6], [6, 7], [7, 8],
          [0, 9], [9, 10], [10, 11], [11, 12],
          [0, 13], [13, 14], [14, 15], [15, 16],
          [0, 17], [17, 18], [18, 19], [19, 20],
          [5, 9], [9, 13], [13, 17]
        ];

        ctx.strokeStyle = 'rgba(0, 255, 200, 0.6)';
        ctx.lineWidth = 2;
        connections.forEach(([start, end]) => {
          if (landmarks[start] && landmarks[end]) {
            ctx.beginPath();
            ctx.moveTo(
              landmarks[start].x * ctx.canvas.width,
              landmarks[start].y * ctx.canvas.height
            );
            ctx.lineTo(
              landmarks[end].x * ctx.canvas.width,
              landmarks[end].y * ctx.canvas.height
            );
            ctx.stroke();
          }
        });
      }
    }
  }, []);

  return {
    isLoading,
    isReady,
    error,
    handResults,
    faceResults,
    detectFrame,
    drawResults,
  };
}
