import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Lightbulb, Calculator, Camera, Zap } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface HowItWorksPanelProps {
  className?: string;
}

export function HowItWorksPanel({ className }: HowItWorksPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sections = [
    {
      icon: Camera,
      title: 'Hand & Face Detection',
      color: 'text-glow-cyan',
      content: 'Using MediaPipe, we detect 21 hand landmarks and 468 face landmarks in real-time. The mouth region is specifically identified for distance calculations.'
    },
    {
      icon: Lightbulb,
      title: 'Light Source Detection',
      color: 'text-glow-orange',
      content: 'We analyze the brightness gradient across the face to estimate where the light is coming from. Brighter areas indicate the light source direction. You can also manually set the light position.'
    },
    {
      icon: Calculator,
      title: 'Shadow Physics',
      color: 'text-glow-purple',
      content: 'The Inverse Square Law tells us that light intensity decreases with distance squared (I = I₀/d²). By analyzing shadow sharpness and area, we can estimate the Z-distance of the hand relative to the face.'
    },
    {
      icon: Zap,
      title: 'Depth Formula',
      color: 'text-glow-green',
      content: 'Z = k × √(Shadow_Area) × (1/Shadow_Sharpness) × cos(θ). As the hand moves closer to the face, the shadow becomes sharper and the occluded area increases, allowing us to estimate depth.'
    },
  ];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={cn(className)}>
      <CollapsibleTrigger asChild>
        <button className="w-full flex items-center justify-between p-4 bg-card/80 backdrop-blur-sm rounded-lg border border-border hover:bg-card transition-colors">
          <span className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Calculator className="w-4 h-4 text-glow-purple" />
            How It Works: Physics Behind the Magic
          </span>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="mt-2 p-4 bg-card/60 backdrop-blur-sm rounded-lg border border-border space-y-4">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div key={index} className="flex gap-3">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                  'bg-muted'
                )}>
                  <Icon className={cn('w-4 h-4', section.color)} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">
                    {section.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </div>
            );
          })}
          
          {/* Formula highlight */}
          <div className="mt-4 p-3 bg-glow-purple/10 rounded-lg border border-glow-purple/30">
            <div className="text-xs text-muted-foreground mb-1">Core Formula</div>
            <div className="text-sm font-mono text-glow-purple">
              Z_distance = k × √(Occluded_Area) × (1 / Shadow_Sharpness) × cos(Light_Angle)
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
