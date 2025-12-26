import React from 'react';

interface SuccessScreenProps {
  onRestart: () => void;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({ onRestart }) => {
  return (
    <div className="bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 font-display min-h-screen flex flex-col antialiased selection:bg-primary/30 max-w-md mx-auto shadow-2xl">
      <header className="sticky top-0 z-50 flex items-center justify-center p-4 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50">
        <h2 className="text-gray-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] text-center">
          Recadastramento 2025
        </h2>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8 w-full animate-enter">
        <div className="flex flex-col items-center gap-8 w-full">
          <div className="relative group">
            <div className="absolute inset-0 bg-green-500 blur-xl opacity-20 rounded-full scale-110 group-hover:scale-125 transition-transform duration-500"></div>
            <div className="relative bg-white dark:bg-surface-dark rounded-full p-6 shadow-xl shadow-green-500/10 ring-1 ring-black/5 dark:ring-white/10">
              <span className="material-symbols-outlined text-green-500 !text-7xl" style={{fontSize: '80px', fontVariationSettings: "'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 48"}}>
                check_circle
              </span>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-3 text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Recadastramento<br/>Concluído!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-base font-medium leading-relaxed max-w-[320px]">
              Obrigado por atualizar seus dados. Nossa secretaria irá analisar as informações enviadas em breve.
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 mt-2">
              <span className="material-symbols-outlined !text-sm">mark_email_read</span>
              E-mail de confirmação enviado
            </div>
          </div>

          <div className="h-4"></div>

          <button className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors py-2">
            Ver status da solicitação
          </button>
        </div>
      </main>

      <footer className="mt-auto py-8 px-4 flex flex-col items-center justify-center gap-4 border-t border-gray-100 dark:border-white/5 bg-background-light dark:bg-background-dark">
        <div className="h-12 w-12 rounded-full bg-white dark:bg-surface-dark border-2 border-primary p-0.5 shadow-sm overflow-hidden">
          <img 
            alt="Grêmio Esportivo Comercial Logo abstract representation" 
            className="w-full h-full object-cover rounded-full" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLBwzrra3XWlXPWNeWPugBtRLSYzhNvMz8vFIZAIUq14K-MzcYAkwdZuZgeGxtIKHle9taM9l8wn8hHSWMPvA8YpPoGp9XvGuOVVzw5GjLCWhpV4-7WgBqEH7Sjr9fGIWLD7dUFvS-V2nEJertw_tdBYN7VLr-F9ggekNfAiVxivrzp0TxQ3ockVYb-WPtSvqw9z1N-VYj2zRa9vWR0hLqpN28R02B_O_u6UHVp9SKE1Q4u0n3HJv0uA9eoDjLM3kKVyOu9jlziqZe"
          />
        </div>
        <p className="text-gray-400 dark:text-gray-500 text-xs font-medium text-center">
          Grêmio Esportivo Comercial © 2025<br/>
          Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
};