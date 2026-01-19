import React, { useState, useCallback, useEffect } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { useMediaPipe } from '@/hooks/useMediaPipe';
import { useDetectionLoop } from '@/hooks/useDetectionLoop';
import type { Settings } from '@/types/vision';
import { CameraButton } from '@/components/vision/CameraButton';
import { ControlPanel } from '@/components/vision/ControlPanel';
import { ShadowHeatmap } from '@/components/vision/ShadowHeatmap';
import { LightVector } from '@/components/vision/LightVector';
import { ActionClassifier } from '@/components/vision/ActionClassifier';
import { DistanceOverlay } from '@/components/vision/DistanceOverlay';
import { DebugPanel } from '@/components/vision/DebugPanel';
import { HowItWorksPanel } from '@/components/vision/HowItWorksPanel';
import { Loader2, Sparkles } from 'lucide-react';

const DEFAULT_SETTINGS: Settings = {
  distanceThreshold: 2,
  shadowSensitivity: 0.5,
  lightMode: 'auto',
  viewMode: 'overlay',
  showHeatmap: true,
  showLightVector: true,
  showDebugInfo: false,
  soundEnabled: false,
};

const Index = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [manualLightPosition, setManualLightPosition] = useState({ x: 0.2, y: 0.2 });

  const { videoRef, canvasRef, stream, isLoading: cameraLoading, error: cameraError, startCamera, stopCamera, captureFrame } = useCamera({ width: 640, height: 480 });
  const { isLoading: mediaPipeLoading, isReady: mediaPipeReady, error: mediaPipeError, handResults, faceResults, detectFrame, drawResults } = useMediaPipe();

  const { detectionState, isRunning, start, stop } = useDetectionLoop({
    videoRef,
    canvasRef,
    handResults,
    faceResults,
    settings,
    isMediaPipeReady: mediaPipeReady,
    detectFrame,
    drawResults,
    captureFrame,
    manualLightPosition,
  });

  const handleStart = useCallback(async () => {
    await startCamera();
    start();
  }, [startCamera, start]);

  const handleStop = useCallback(() => {
    stop();
    stopCamera();
  }, [stop, stopCamera]);

  const handleSettingsChange = useCallback((newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const handleReset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    setManualLightPosition({ x: 0.2, y: 0.2 });
  }, []);

  const isLoading = cameraLoading || mediaPipeLoading;
  const error = cameraError || mediaPipeError;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-glow-purple to-glow-cyan flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-glow-purple to-glow-cyan bg-clip-text text-transparent">
                  Shadow-Depth Vision
                </h1>
                <p className="text-xs text-muted-foreground">Physics-Based Action Recognition</p>
              </div>
            </div>
            <CameraButton
              isLoading={isLoading}
              isActive={!!stream}
              error={error}
              onStart={handleStart}
              onStop={handleStop}
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Area */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative aspect-video bg-card rounded-xl overflow-hidden border border-border">
              {/* Hidden video element */}
              <video ref={videoRef} className="hidden" playsInline muted />
              
              {/* Canvas with overlays */}
              <canvas ref={canvasRef} className="w-full h-full object-contain" />
              
              {/* Overlay UI */}
              {isRunning && <DistanceOverlay detectionState={detectionState} />}
              
              {/* Placeholder when not running */}
              {!stream && !isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/50">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-glow-purple/20 to-glow-cyan/20 flex items-center justify-center mb-4">
                    <Sparkles className="w-10 h-10 text-glow-purple" />
                  </div>
                  <p className="text-muted-foreground text-center max-w-xs">
                    Click "Start Camera" to begin physics-based shadow depth analysis
                  </p>
                </div>
              )}
              
              {/* Loading state */}
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
                  <Loader2 className="w-10 h-10 text-glow-purple animate-spin mb-4" />
                  <p className="text-muted-foreground">
                    {mediaPipeLoading ? 'Loading AI models...' : 'Starting camera...'}
                  </p>
                </div>
              )}
            </div>

            {/* Action Classification */}
            <ActionClassifier
              classification={detectionState.actionClassification}
              depthEstimation={detectionState.depthEstimation}
              threshold={settings.distanceThreshold}
            />

            {/* How It Works */}
            <HowItWorksPanel />
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            <ControlPanel
              settings={settings}
              onSettingsChange={handleSettingsChange}
              onReset={handleReset}
              isRunning={isRunning}
            />

            {settings.showHeatmap && (
              <ShadowHeatmap intensityMatrix={detectionState.shadowAnalysis?.intensityMatrix ?? null} />
            )}

            {settings.showLightVector && (
              <LightVector
                lightSource={detectionState.lightSource}
                onPositionChange={setManualLightPosition}
                isManualMode={settings.lightMode === 'manual'}
              />
            )}

            <DebugPanel detectionState={detectionState} isVisible={settings.showDebugInfo} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
