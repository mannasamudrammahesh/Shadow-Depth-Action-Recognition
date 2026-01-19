import React from 'react';
import { cn } from '@/lib/utils';
import type { ActionClassification, DepthEstimation } from '@/types/vision';
import { Shield, AlertTriangle, Hand, Utensils } from 'lucide-react';

interface ActionClassifierProps {
  classification: ActionClassification;
  depthEstimation: DepthEstimation | null;
  threshold: number;
  className?: string;
}

const ACTION_CONFIG = {
  safe: {
    icon: Shield,
    label: 'Safe',
    color: 'text-status-safe',
    bgColor: 'bg-status-safe/20',
    borderColor: 'border-status-safe/50',
    glowColor: 'shadow-status-safe/30',
  },
  approaching: {
    icon: AlertTriangle,
    label: 'Approaching',
    color: 'text-status-warning',
    bgColor: 'bg-status-warning/20',
    borderColor: 'border-status-warning/50',
    glowColor: 'shadow-status-warning/30',
  },
  touching: {
    icon: Hand,
    label: 'Touching Face',
    color: 'text-status-danger',
    bgColor: 'bg-status-danger/20',
    borderColor: 'border-status-danger/50',
    glowColor: 'shadow-status-danger/30',
  },
  eating: {
    icon: Utensils,
    label: 'Eating Detected',
    color: 'text-status-danger',
    bgColor: 'bg-status-danger/20',
    borderColor: 'border-status-danger/50',
    glowColor: 'shadow-status-danger/30',
  },
};

export function ActionClassifier({ 
  classification, 
  depthEstimation, 
  threshold,
  className 
}: ActionClassifierProps) {
  const config = ACTION_CONFIG[classification.action];
  const Icon = config.icon;
  const distance = depthEstimation?.distance ?? Infinity;
  const isActive = distance !== Infinity;

  return (
    <div className={cn('relative', className)}>
      {/* Glow effect for danger states */}
      {(classification.action === 'touching' || classification.action === 'eating') && (
        <div className="absolute inset-0 bg-status-danger/20 rounded-lg blur-xl animate-pulse-glow" />
      )}
      
      <div className={cn(
        'relative rounded-lg p-4 border-2 transition-all duration-300',
        config.bgColor,
        config.borderColor,
        classification.action !== 'safe' && 'shadow-lg',
        classification.action !== 'safe' && config.glowColor
      )}>
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className={cn(
            'w-14 h-14 rounded-full flex items-center justify-center',
            config.bgColor,
            classification.action !== 'safe' && 'animate-pulse-glow'
          )}>
            <Icon className={cn('w-7 h-7', config.color)} />
          </div>
          
          {/* Status info */}
          <div className="flex-1">
            <div className={cn('text-lg font-bold', config.color)}>
              {config.label}
            </div>
            <div className="text-sm text-muted-foreground">
              Confidence: {(classification.confidence * 100).toFixed(0)}%
            </div>
          </div>
          
          {/* Distance display */}
          <div className="text-right">
            <div className={cn(
              'text-3xl font-bold font-mono tabular-nums',
              isActive ? config.color : 'text-muted-foreground'
            )}>
              {isActive ? distance.toFixed(1) : '—'}
            </div>
            <div className="text-xs text-muted-foreground">
              cm to mouth
            </div>
          </div>
        </div>
        
        {/* Distance bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Distance</span>
            <span>Threshold: {threshold}cm</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                'h-full transition-all duration-200 rounded-full',
                distance <= threshold ? 'bg-status-danger' :
                distance <= threshold * 2 ? 'bg-status-warning' :
                'bg-status-safe'
              )}
              style={{ 
                width: isActive ? `${Math.min(100, (1 - distance / (threshold * 5)) * 100)}%` : '0%' 
              }}
            />
          </div>
        </div>
        
        {/* Physics formula (when active) */}
        {depthEstimation && isActive && (
          <div className="mt-3 p-2 bg-muted/50 rounded text-xs font-mono text-muted-foreground overflow-x-auto">
            {depthEstimation.formula}
          </div>
        )}
      </div>
    </div>
  );
}
