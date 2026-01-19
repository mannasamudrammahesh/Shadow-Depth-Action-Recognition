import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface ShadowHeatmapProps {
  intensityMatrix: number[][] | null;
  className?: string;
}

export function ShadowHeatmap({ intensityMatrix, className }: ShadowHeatmapProps) {
  const cells = useMemo(() => {
    if (!intensityMatrix || intensityMatrix.length === 0) {
      // Generate placeholder grid
      return Array(16).fill(null).map(() => Array(16).fill(0.5));
    }
    return intensityMatrix;
  }, [intensityMatrix]);

  const getColor = (intensity: number): string => {
    // 0 = dark (shadow), 1 = bright (no shadow)
    if (intensity < 0.25) {
      return 'bg-heat-hot';
    } else if (intensity < 0.5) {
      return 'bg-heat-warm';
    } else if (intensity < 0.75) {
      return 'bg-heat-cool';
    }
    return 'bg-heat-cold';
  };

  const getOpacity = (intensity: number): number => {
    return 0.3 + (1 - intensity) * 0.7;
  };

  return (
    <div className={cn('relative', className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-glow-purple/20 to-glow-cyan/20 rounded-lg blur-xl" />
      
      <div className="relative bg-card/80 backdrop-blur-sm rounded-lg p-4 border border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-glow-orange animate-pulse-glow" />
            Shadow Intensity Matrix
          </h3>
          <span className="text-xs text-muted-foreground">16×16 grid</span>
        </div>
        
        <div 
          className="grid gap-0.5 rounded-md overflow-hidden"
          style={{ 
            gridTemplateColumns: `repeat(${cells[0]?.length || 16}, 1fr)`,
            aspectRatio: '1/1'
          }}
        >
          {cells.map((row, y) =>
            row.map((intensity, x) => (
              <div
                key={`${x}-${y}`}
                className={cn(
                  'aspect-square transition-all duration-150',
                  getColor(intensity)
                )}
                style={{ opacity: getOpacity(intensity) }}
                title={`Intensity: ${(intensity * 100).toFixed(0)}%`}
              />
            ))
          )}
        </div>
        
        {/* Legend */}
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-heat-hot" />
            <span>Shadow</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-heat-warm" />
            <span>Partial</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-heat-cool" />
            <span>Light</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-heat-cold" />
            <span>Bright</span>
          </div>
        </div>
      </div>
    </div>
  );
}
