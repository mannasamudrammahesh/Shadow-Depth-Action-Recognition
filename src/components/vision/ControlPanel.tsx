import React from 'react';
import { cn } from '@/lib/utils';
import type { Settings } from '@/types/vision';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Settings as SettingsIcon, 
  Sun, 
  Zap, 
  Volume2, 
  VolumeX,
  Eye,
  Grid3X3,
  Bug,
  RotateCcw
} from 'lucide-react';

interface ControlPanelProps {
  settings: Settings;
  onSettingsChange: (settings: Partial<Settings>) => void;
  onReset: () => void;
  isRunning: boolean;
  className?: string;
}

export function ControlPanel({ 
  settings, 
  onSettingsChange, 
  onReset,
  isRunning,
  className 
}: ControlPanelProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-glow-purple" />
          Controls
        </h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onReset}
          className="text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
      </div>

      {/* Distance Threshold */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-glow-cyan" />
            Detection Threshold
          </Label>
          <span className="text-sm font-mono text-muted-foreground">
            {settings.distanceThreshold} cm
          </span>
        </div>
        <Slider
          value={[settings.distanceThreshold]}
          onValueChange={([value]) => onSettingsChange({ distanceThreshold: value })}
          min={0.5}
          max={10}
          step={0.5}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Actions closer than this distance trigger alerts
        </p>
      </div>

      {/* Shadow Sensitivity */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm flex items-center gap-2">
            <Eye className="w-4 h-4 text-glow-orange" />
            Shadow Sensitivity
          </Label>
          <span className="text-sm font-mono text-muted-foreground">
            {(settings.shadowSensitivity * 100).toFixed(0)}%
          </span>
        </div>
        <Slider
          value={[settings.shadowSensitivity]}
          onValueChange={([value]) => onSettingsChange({ shadowSensitivity: value })}
          min={0.1}
          max={1}
          step={0.1}
          className="w-full"
        />
      </div>

      {/* Light Mode */}
      <div className="flex items-center justify-between py-2">
        <Label className="text-sm flex items-center gap-2">
          <Sun className="w-4 h-4 text-glow-orange" />
          Manual Light Control
        </Label>
        <Switch
          checked={settings.lightMode === 'manual'}
          onCheckedChange={(checked) => 
            onSettingsChange({ lightMode: checked ? 'manual' : 'auto' })
          }
        />
      </div>

      {/* Show Heatmap */}
      <div className="flex items-center justify-between py-2">
        <Label className="text-sm flex items-center gap-2">
          <Grid3X3 className="w-4 h-4 text-glow-pink" />
          Show Heatmap
        </Label>
        <Switch
          checked={settings.showHeatmap}
          onCheckedChange={(checked) => onSettingsChange({ showHeatmap: checked })}
        />
      </div>

      {/* Show Light Vector */}
      <div className="flex items-center justify-between py-2">
        <Label className="text-sm flex items-center gap-2">
          <Sun className="w-4 h-4 text-glow-orange" />
          Show Light Vector
        </Label>
        <Switch
          checked={settings.showLightVector}
          onCheckedChange={(checked) => onSettingsChange({ showLightVector: checked })}
        />
      </div>

      {/* Sound */}
      <div className="flex items-center justify-between py-2">
        <Label className="text-sm flex items-center gap-2">
          {settings.soundEnabled ? (
            <Volume2 className="w-4 h-4 text-glow-green" />
          ) : (
            <VolumeX className="w-4 h-4 text-muted-foreground" />
          )}
          Sound Alerts
        </Label>
        <Switch
          checked={settings.soundEnabled}
          onCheckedChange={(checked) => onSettingsChange({ soundEnabled: checked })}
        />
      </div>

      {/* Debug Info */}
      <div className="flex items-center justify-between py-2">
        <Label className="text-sm flex items-center gap-2">
          <Bug className="w-4 h-4 text-muted-foreground" />
          Show Debug Info
        </Label>
        <Switch
          checked={settings.showDebugInfo}
          onCheckedChange={(checked) => onSettingsChange({ showDebugInfo: checked })}
        />
      </div>

      {/* Status indicator */}
      <div className={cn(
        'mt-4 p-3 rounded-lg border text-center text-sm',
        isRunning 
          ? 'bg-glow-green/10 border-glow-green/30 text-glow-green' 
          : 'bg-muted border-border text-muted-foreground'
      )}>
        {isRunning ? '● Detection Active' : '○ Detection Paused'}
      </div>
    </div>
  );
}
