import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, Loader2 } from 'lucide-react';

interface CameraButtonProps {
  isLoading: boolean;
  isActive: boolean;
  error: string | null;
  onStart: () => void;
  onStop: () => void;
  className?: string;
}

export function CameraButton({ 
  isLoading, 
  isActive, 
  error, 
  onStart, 
  onStop,
  className 
}: CameraButtonProps) {
  if (error) {
    return (
      <div className={cn('text-center', className)}>
        <div className="text-destructive text-sm mb-2">
          Camera Error: {error}
        </div>
        <Button onClick={onStart} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <Button disabled className={cn('min-w-[160px]', className)}>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Starting...
      </Button>
    );
  }

  if (isActive) {
    return (
      <Button 
        onClick={onStop} 
        variant="destructive"
        className={cn('min-w-[160px]', className)}
      >
        <CameraOff className="w-4 h-4 mr-2" />
        Stop Camera
      </Button>
    );
  }

  return (
    <Button 
      onClick={onStart}
      className={cn(
        'min-w-[160px] bg-gradient-to-r from-glow-purple to-glow-cyan hover:opacity-90',
        className
      )}
    >
      <Camera className="w-4 h-4 mr-2" />
      Start Camera
    </Button>
  );
}
