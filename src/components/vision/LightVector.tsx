import React from 'react';
import { cn } from '@/lib/utils';
import type { LightSource } from '@/types/vision';
import { Sun, Move } from 'lucide-react';

interface LightVectorProps {
  lightSource: LightSource;
  onPositionChange?: (position: { x: number; y: number }) => void;
  isManualMode: boolean;
  className?: string;
}

export function LightVector({ 
  lightSource, 
  onPositionChange, 
  isManualMode,
  className 
}: LightVectorProps) {
  const handleDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isManualMode || !onPositionChange) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    onPositionChange({ 
      x: Math.max(0, Math.min(1, x)), 
      y: Math.max(0, Math.min(1, y)) 
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isManualMode) return;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (moveEvent.clientX - rect.left) / rect.width;
      const y = (moveEvent.clientY - rect.top) / rect.height;
      
      onPositionChange?.({ 
        x: Math.max(0, Math.min(1, x)), 
        y: Math.max(0, Math.min(1, y)) 
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Calculate arrow angle from direction
  const angle = Math.atan2(lightSource.direction.y, lightSource.direction.x) * (180 / Math.PI);
  const intensity = lightSource.intensity * 100;

  // Position for the light source indicator
  const lightX = isManualMode ? lightSource.position.x * 100 : 
                 (0.5 - lightSource.direction.x * 0.4) * 100;
  const lightY = isManualMode ? lightSource.position.y * 100 : 
                 (0.5 - lightSource.direction.y * 0.4) * 100;

  return (
    <div className={cn('relative', className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-glow-orange/20 to-glow-pink/20 rounded-lg blur-xl" />
      
      <div className="relative bg-card/80 backdrop-blur-sm rounded-lg p-4 border border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Sun className="w-4 h-4 text-glow-orange" />
            Light Source Vector
          </h3>
          <span className={cn(
            'text-xs px-2 py-0.5 rounded-full',
            isManualMode ? 'bg-glow-pink/20 text-glow-pink' : 'bg-glow-cyan/20 text-glow-cyan'
          )}>
            {isManualMode ? 'Manual' : 'Auto'}
          </span>
        </div>
        
        {/* Light source visualization */}
        <div 
          className={cn(
            'relative aspect-square rounded-lg bg-muted/50 overflow-hidden',
            isManualMode && 'cursor-move'
          )}
          onClick={handleDrag}
          onMouseDown={handleMouseDown}
        >
          {/* Grid lines */}
          <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
            {Array(16).fill(null).map((_, i) => (
              <div key={i} className="border border-border/30" />
            ))}
          </div>
          
          {/* Center point (face) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-8 rounded-full border-2 border-glow-purple/50 bg-glow-purple/20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-glow-purple" />
            </div>
          </div>
          
          {/* Light source indicator */}
          <div 
            className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-100"
            style={{ left: `${lightX}%`, top: `${lightY}%` }}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-glow-orange/30 animate-pulse-glow flex items-center justify-center">
                <Sun className="w-6 h-6 text-glow-orange drop-shadow-lg" />
              </div>
              {isManualMode && (
                <Move className="absolute -bottom-1 -right-1 w-3 h-3 text-muted-foreground" />
              )}
            </div>
          </div>
          
          {/* Direction arrow */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon 
                  points="0 0, 10 3.5, 0 7" 
                  fill="hsl(var(--glow-orange))" 
                />
              </marker>
              <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--glow-orange))" stopOpacity="0.3" />
                <stop offset="100%" stopColor="hsl(var(--glow-orange))" stopOpacity="1" />
              </linearGradient>
            </defs>
            <line
              x1={lightX}
              y1={lightY}
              x2="50"
              y2="50"
              stroke="url(#arrowGradient)"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
          </svg>
        </div>
        
        {/* Vector info */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <div className="bg-muted/50 rounded px-2 py-1 text-center">
            <div className="text-muted-foreground">X</div>
            <div className="text-foreground font-mono">
              {lightSource.direction.x.toFixed(2)}
            </div>
          </div>
          <div className="bg-muted/50 rounded px-2 py-1 text-center">
            <div className="text-muted-foreground">Y</div>
            <div className="text-foreground font-mono">
              {lightSource.direction.y.toFixed(2)}
            </div>
          </div>
          <div className="bg-muted/50 rounded px-2 py-1 text-center">
            <div className="text-muted-foreground">Angle</div>
            <div className="text-foreground font-mono">
              {angle.toFixed(0)}°
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
