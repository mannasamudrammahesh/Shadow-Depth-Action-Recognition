import React from 'react';
import { cn } from '@/lib/utils';
import type { DetectionState } from '@/types/vision';
import { Code, Activity, Lightbulb, Target, Ruler } from 'lucide-react';

interface DebugPanelProps {
  detectionState: DetectionState;
  isVisible: boolean;
  className?: string;
}

export function DebugPanel({ detectionState, isVisible, className }: DebugPanelProps) {
  if (!isVisible) return null;

  const { lightSource, shadowAnalysis, depthEstimation } = detectionState;

  return (
    <div className={cn(
      'bg-card/90 backdrop-blur-sm rounded-lg p-4 border border-border',
      className
    )}>
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
        <Code className="w-4 h-4 text-glow-cyan" />
        Debug Information
      </h3>

      <div className="space-y-3 text-xs font-mono">
        {/* Light Source */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Lightbulb className="w-3 h-3" />
            Light Source
          </div>
          <div className="bg-muted/50 rounded p-2 text-foreground overflow-x-auto">
            <div>direction: ({lightSource.direction.x.toFixed(3)}, {lightSource.direction.y.toFixed(3)}, {lightSource.direction.z.toFixed(3)})</div>
            <div>intensity: {lightSource.intensity.toFixed(2)}</div>
            <div>mode: {lightSource.isManual ? 'manual' : 'auto'}</div>
          </div>
        </div>

        {/* Shadow Analysis */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Target className="w-3 h-3" />
            Shadow Analysis
          </div>
          <div className="bg-muted/50 rounded p-2 text-foreground overflow-x-auto">
            {shadowAnalysis ? (
              <>
                <div>occludedArea: {shadowAnalysis.occludedArea.toFixed(2)}%</div>
                <div>sharpness: {shadowAnalysis.shadowSharpness.toFixed(3)}</div>
                <div>centroid: ({shadowAnalysis.shadowCentroid.x.toFixed(1)}, {shadowAnalysis.shadowCentroid.y.toFixed(1)})</div>
                <div>boundaryPoints: {shadowAnalysis.shadowBoundary.length}</div>
              </>
            ) : (
              <div className="text-muted-foreground">No shadow detected</div>
            )}
          </div>
        </div>

        {/* Depth Estimation */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Ruler className="w-3 h-3" />
            Depth Estimation
          </div>
          <div className="bg-muted/50 rounded p-2 text-foreground overflow-x-auto">
            {depthEstimation ? (
              <>
                <div>distance: {depthEstimation.distance.toFixed(2)} cm</div>
                <div>confidence: {(depthEstimation.confidence * 100).toFixed(1)}%</div>
                <div className="text-glow-purple break-all">{depthEstimation.formula}</div>
                <div className="mt-1 pt-1 border-t border-border">
                  <div>shadowArea: {depthEstimation.rawValues.shadowArea.toFixed(2)}</div>
                  <div>sharpness: {depthEstimation.rawValues.shadowSharpness.toFixed(3)}</div>
                  <div>lightAngle: {depthEstimation.rawValues.lightAngle.toFixed(1)}°</div>
                </div>
              </>
            ) : (
              <div className="text-muted-foreground">No estimation available</div>
            )}
          </div>
        </div>

        {/* Performance */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Activity className="w-3 h-3" />
            Performance
          </div>
          <div className="bg-muted/50 rounded p-2 text-foreground">
            <div>fps: {detectionState.fps}</div>
            <div>handDetected: {detectionState.handDetected ? 'true' : 'false'}</div>
            <div>faceDetected: {detectionState.faceDetected ? 'true' : 'false'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
