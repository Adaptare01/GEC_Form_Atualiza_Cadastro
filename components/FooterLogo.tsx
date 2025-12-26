import React from 'react';

export const FooterLogo: React.FC = () => {
  return (
    <div className="flex justify-center items-center gap-2 mt-6 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center font-black text-[10px] text-gray-900 dark:text-white">GEC</div>
        <span className="text-xs font-bold tracking-widest text-gray-900 dark:text-white">GRÊMIO ESPORTIVO COMERCIAL</span>
      </div>
    </div>
  );
};