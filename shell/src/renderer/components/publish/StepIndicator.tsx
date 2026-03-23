import React from 'react';

const STEPS = [
  { num: 1, label: 'Drop' },
  { num: 2, label: 'Review' },
  { num: 3, label: 'Perms' },
  { num: 4, label: 'Validate' },
  { num: 5, label: 'Submit' },
];

interface StepIndicatorProps {
  current: number;
}

export function StepIndicator({ current }: StepIndicatorProps): React.ReactElement {
  return (
    <div className="flex items-center gap-2 mb-6">
      {STEPS.map((step, i) => (
        <React.Fragment key={step.num}>
          {i > 0 && (
            <div
              className={`flex-1 h-0.5 ${
                step.num <= current ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          )}
          <div className="flex items-center gap-1.5">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                step.num < current
                  ? 'bg-blue-500 text-white'
                  : step.num === current
                    ? 'bg-blue-500 text-white ring-2 ring-blue-200 dark:ring-blue-800'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}
            >
              {step.num < current ? '✓' : step.num}
            </div>
            <span
              className={`text-xs font-medium hidden sm:inline ${
                step.num === current
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {step.label}
            </span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
