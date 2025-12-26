import React from 'react';

interface ProgressBarProps {
  step: number;
  total: number;
  percentage: number;
  label?: string;
  variant?: 'single' | 'segmented';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ step, total, percentage, label, variant = 'single' }) => {
  if (variant === 'segmented') {
    return (
      <div className="w-full px-6 py-4 bg-background-light dark:bg-background-dark sticky top-[60px] z-10">
        <div className="flex w-full flex-row items-center justify-between gap-2">
          {Array.from({ length: total }, (_, i) => i + 1).map((s) => (
            <div 
              key={s}
              className={`h-1.5 flex-1 rounded-full ${s <= step ? 'bg-primary' : 'bg-primary/30'}`}
            ></div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs font-medium text-text-secondary dark:text-gray-400">
          <span>Início</span>
          <span className="text-primary font-bold">Passo {step} de {total}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-4 pt-1">
      <div className="flex justify-between items-end mb-2">
        <p className="text-[#1c0d0d] dark:text-gray-300 text-sm font-medium leading-normal">
          {label || `Passo ${step} de ${total}`}
        </p>
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{percentage}%</span>
      </div>
      <div className="rounded-full bg-[#e8cece] dark:bg-gray-700 h-2 overflow-hidden w-full">
        <div 
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};