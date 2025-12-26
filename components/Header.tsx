import React from 'react';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  showBack?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, onBack, showBack = true }) => {
  return (
    <div className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="flex items-center p-4 pb-2 justify-between">
        {showBack ? (
          <button 
            onClick={onBack}
            className="text-[#1c0d0d] dark:text-white flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Voltar"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back_ios_new</span>
          </button>
        ) : (
          <div className="size-12"></div>
        )}
        <h2 className="text-[#1c0d0d] dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-12">
          {title}
        </h2>
      </div>
    </div>
  );
};