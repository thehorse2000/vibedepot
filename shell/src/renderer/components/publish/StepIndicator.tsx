import React from 'react';
import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  current: number;
}

const steps = [
  { n: 1, label: 'Select' },
  { n: 2, label: 'Review' },
  { n: 3, label: 'Perms' },
  { n: 4, label: 'Validate' },
  { n: 5, label: 'Submit' },
];

export function StepIndicator({ current }: StepIndicatorProps): React.ReactElement {
  return (
    <div className="flex items-center justify-between w-full max-w-4xl mx-auto px-4">
      {steps.map((s, i) => (
        <React.Fragment key={s.n}>
          <div className="flex flex-col items-center gap-3 relative group">
            <div
              className={cn(
                "size-10 rounded-full flex items-center justify-center transition-all duration-500 font-bold text-sm shadow-md",
                current === s.n 
                  ? "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110" 
                  : current > s.n 
                    ? "bg-emerald-500 text-white" 
                    : "bg-muted text-muted-foreground border border-border"
              )}
            >
              {current > s.n ? <Check className="size-5" /> : s.n}
            </div>
            <span className={cn(
              "text-[11px] font-bold uppercase tracking-widest transition-colors duration-300",
              current === s.n ? "text-primary" : "text-muted-foreground"
            )}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="flex-1 h-[2px] mx-4 -mt-8 bg-muted overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-700 ease-in-out" 
                style={{ width: current > s.n ? '100%' : '0%' }}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
