import React from 'react';
import { Header } from '../components/Header';
import { ProgressBar } from '../components/ProgressBar';
import { Button } from '../components/ui/Button';

interface StartScreenProps {
  onNext: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onNext }) => {
  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden shadow-xl bg-background-light dark:bg-background-dark">
      <Header title="Recadastramento 2025" showBack={false} />
      <ProgressBar step={1} total={6} percentage={5} />

      <main className="flex-1 flex flex-col px-6 pt-6 pb-48">
        <div className="flex flex-col items-center justify-center py-6">
          <div className="relative w-48 h-48 rounded-full bg-white shadow-lg flex items-center justify-center mb-4 overflow-hidden border-4 border-white dark:border-gray-800 p-4">
            <img
              src="/logo-gec.png"
              alt="Brasão GEC"
              className="w-full h-full object-contain drop-shadow-sm"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-[#1c0d0d] dark:text-white tracking-tight text-[32px] font-bold leading-tight pb-2">
            Atualização Cadastral GEC
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-base font-normal leading-relaxed pb-4">
            Prezado Sócio, a atualização dos seus dados é <span className="text-primary font-bold">vital</span>. É através dela que enviaremos comunicados oficiais e, principalmente, a liberação de acesso ao <span className="font-semibold text-gray-900 dark:text-white">App de Controle do Portão</span>.
          </p>
          <div className="bg-primary/5 dark:bg-primary/10 border border-primary/10 rounded-xl p-4 flex gap-3 text-left items-start mt-2">
            <span className="material-symbols-outlined text-primary shrink-0 mt-0.5">info</span>
            <p className="text-sm text-gray-700 dark:text-gray-200 font-medium leading-snug">
              Mantenha seu e-mail e WhatsApp em dia para não perder o acesso ao clube.
            </p>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md p-6 border-t border-gray-100 dark:border-gray-800 z-20 flex flex-col items-center gap-6">
        <Button
          onClick={onNext}
          rightIcon={<span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>}
        >
          Começar Atualização
        </Button>
        <div className="flex items-center justify-center opacity-60 pb-2">
          <span className="text-xs font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase">Grêmio Esportivo Comercial</span>
        </div>
      </div>
    </div>
  );
};