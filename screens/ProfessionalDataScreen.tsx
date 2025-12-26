import React, { useState } from 'react';
import { Header } from '../components/Header';
import { ProgressBar } from '../components/ProgressBar';
import { FooterLogo } from '../components/FooterLogo';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useFormContext } from '../contexts/FormContext';

interface ProfessionalDataScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export const ProfessionalDataScreen: React.FC<ProfessionalDataScreenProps> = ({ onNext, onBack }) => {
  const { formData, updateFormData } = useFormContext();
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const handleChange = (field: string, value: string) => {
    updateFormData({ [field]: value });
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: false }));
  };

  const handleWorkPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    // Mask for (XX) XXXXX-XXXX or (XX) XXXX-XXXX
    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
    value = value.replace(/(\d)(\d{4})$/, '$1-$2');

    handleChange('workPhone', value);
  };

  const validateAndNext = () => {
    const newErrors: Record<string, boolean> = {};
    let isValid = true;

    if (!formData.profession.trim()) newErrors.profession = true;
    if (!formData.workAddress.trim()) newErrors.workAddress = true;
    if (formData.workPhone.length < 14) newErrors.workPhone = true; // Min length for landline or cell

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      isValid = false;
      alert("Por favor, preencha todos os campos profissionais.");
    }

    if (isValid) {
      onNext();
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-gray-100 selection:bg-primary/20 min-h-screen">
      <div className="relative max-w-md mx-auto min-h-screen flex flex-col">
        <Header title="Recadastramento 2025" onBack={onBack} />
        <ProgressBar step={4} total={6} percentage={66} />

        <main className="flex-1 w-full px-4 pt-6 pb-40">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">Dados do Titular</h1>
            <p className="text-base text-gray-500 dark:text-gray-400">Parte 2 de 2: Informações Profissionais</p>
          </div>

          <section className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-white/5 p-5 mb-4">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-white/5">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">work</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Dados Profissionais</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Ocupação e contato comercial</p>
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <Input
                label="Profissão"
                placeholder="Ex: Engenheiro Civil"
                value={formData.profession}
                onChange={(e) => handleChange('profession', e.target.value)}
                error={errors.profession}
              />
              <Input
                label="Endereço Comercial"
                placeholder="Digite o endereço da empresa"
                value={formData.workAddress}
                onChange={(e) => handleChange('workAddress', e.target.value)}
                error={errors.workAddress}
              />
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Telefone Comercial</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-[20px] z-10">call</span>
                  <Input
                    placeholder="(00) 0000-0000"
                    value={formData.workPhone}
                    onChange={handleWorkPhoneChange}
                    maxLength={15}
                    error={errors.workPhone}
                    className="pl-11 pr-4"
                    fullWidth={false}
                  />
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="fixed bottom-0 z-40 w-full max-w-md bg-surface-light/80 dark:bg-background-dark/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 pb-safe">
          <div className="px-4 py-4 flex flex-col gap-4">
            <Button
              onClick={validateAndNext}
              rightIcon={<span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>}
            >
              Próximo
            </Button>
            <FooterLogo />
          </div>
        </footer>
      </div>
    </div>
  );
};