import React from 'react';
import { cn } from '@/lib/utils';
import type { DetectionState } from '@/types/vision';
import { Activity, Eye, Hand, Zap } from 'lucide-react';

interface DistanceOverlayProps {
  detectionState: DetectionState;
  className?: string;
}

export function DistanceOverlay({ detectionState, className }: DistanceOverlayProps) {
  const { fps, handDetected, faceDetected, depthEstimation, actionClassification } = detectionState;
  const distance = depthEstimation?.distance ?? null;
  const isActive = distance !== null && distance !== Infinity;

  const getDistanceColor = () => {
    if (!isActive) return 'text-muted-foreground';
    if (actionClassification.action === 'safe') return 'text-status-safe';
    if (actionClassification.action === 'approaching') return 'text-status-warning';
    return 'text-status-danger';
  };

  return (
    <div className={cn('absolute inset-0 pointer-events-none', className)}>
      {/* Top-left: FPS and status */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border">
          <Zap className="w-4 h-4 text-glow-cyan" />
          <span className="text-sm font-mono text-foreground">{fps} FPS</span>
        </div>
        
        <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border">
          <Eye className={cn('w-4 h-4', faceDetected ? 'text-glow-green' : 'text-muted-foreground')} />
          <span className="text-sm text-foreground">
            {faceDetected ? 'Face ✓' : 'No face'}
          </span>
        </div>
        
        <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border">
          <Hand className={cn('w-4 h-4', handDetected ? 'text-glow-cyan' : 'text-muted-foreground')} />
          <span className="text-sm text-foreground">
            {handDetected ? 'Hand ✓' : 'No hand'}
          </span>
        </div>
      </div>

      {/* Top-right: Distance readout */}
      <div className="absolute top-4 right-4">
        <div className={cn(
          'bg-card/90 backdrop-blur-sm px-4 py-3 rounded-xl border-2 transition-all duration-300',
          isActive && actionClassification.action !== 'safe' 
            ? 'border-status-danger shadow-lg shadow-status-danger/20' 
            : 'border-border'
        )}>
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
            <Activity className="w-3 h-3" />
            Hand → Mouth Distance
          </div>
          <div className={cn(
            'text-4xl font-bold font-mono tabular-nums transition-colors',
            getDistanceColor()
          )}>
            {isActive ? (
              <>
                {distance!.toFixed(1)}
                <span className="text-lg ml-1">cm</span>
              </>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom center: Action indicator */}
      {isActive && actionClassification.action !== 'safe' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <div className={cn(
            'px-6 py-2 rounded-full font-bold text-lg animate-pulse-glow',
            actionClassification.action === 'eating' 
              ? 'bg-status-danger text-white' 
              : actionClassification.action === 'touching'
              ? 'bg-status-danger text-white'
              : 'bg-status-warning text-black'
          )}>
            {actionClassification.action === 'eating' && '🍽️ EATING DETECTED'}
            {actionClassification.action === 'touching' && '✋ TOUCHING FACE'}
            {actionClassification.action === 'approaching' && '⚠️ APPROACHING'}
          </div>
        </div>
      )}
    </div>
  );
}
