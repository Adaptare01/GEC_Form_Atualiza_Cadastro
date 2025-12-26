import React, { useState } from 'react';
import { Header } from '../components/Header';
import { ProgressBar } from '../components/ProgressBar';
import { FooterLogo } from '../components/FooterLogo';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { useFormContext } from '../contexts/FormContext';
import { checkCpfExists } from '../services/supabase';

interface PersonalDataScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export const PersonalDataScreen: React.FC<PersonalDataScreenProps> = ({ onNext, onBack }) => {
  const { formData, updateFormData } = useFormContext();
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [isValidating, setIsValidating] = useState(false);

  const handleChange = (field: string, value: string) => {
    updateFormData({ [field]: value });
    // Limpa erro ao digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

    handleChange('cpf', value);
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
    value = value.replace(/(\d)(\d{4})$/, '$1-$2');

    handleChange('whatsapp', value);
  };

  const validateAndNext = async () => {
    const newErrors: Record<string, boolean> = {};
    let isValid = true;

    // Validações
    if (!formData.fullName.trim()) newErrors.fullName = true;
    if (formData.cpf.length < 14) newErrors.cpf = true;
    if (!formData.rg.trim()) newErrors.rg = true;
    if (!formData.dob) newErrors.dob = true;
    if (!formData.dob) newErrors.dob = true;
    if (!formData.street.trim()) newErrors.street = true;
    if (!formData.neighborhood.trim()) newErrors.neighborhood = true;
    if (!formData.city.trim()) newErrors.city = true;
    // observation is optional
    if (formData.whatsapp.length < 15) newErrors.whatsapp = true;

    // Validação simples de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) newErrors.email = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      isValid = false;
      // Scroll para o topo para ver erros se necessário, ou apenas um feedback visual
      alert("Por favor, preencha todos os campos corretamente.");
    }

    if (isValid) {
      // Async validation for CPF
      setIsValidating(true);
      try {
        const cpfExists = await checkCpfExists(formData.cpf);
        if (cpfExists) {
          setErrors(prev => ({ ...prev, cpf: true }));
          alert('Erro: Este CPF já foi cadastrado.');
        } else {
          onNext();
        }
      } catch (error) {
        console.error('Validation error:', error);
        alert('Erro ao validar CPF. Tente novamente.');
      } finally {
        setIsValidating(false);
      }
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-gray-100 selection:bg-primary/20 min-h-screen">
      <div className="relative max-w-md mx-auto min-h-screen flex flex-col">
        <Header title="Recadastramento 2025" onBack={onBack} />
        <ProgressBar step={3} total={6} percentage={50} />

        <main className="flex-1 w-full px-4 pt-6 pb-40">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">Dados do Titular</h1>
            <p className="text-base text-gray-500 dark:text-gray-400">Parte 1 de 2: Informações Pessoais</p>
          </div>

          <section className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-white/5 p-5 mb-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-white/5">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">person</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Dados Pessoais</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Informações de identificação</p>
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <Input
                label="Nome Completo"
                placeholder="Digite seu nome completo"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                error={errors.fullName}
              />

              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    label="CPF"
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={handleCpfChange}
                    maxLength={14}
                    error={errors.cpf}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    label="RG"
                    placeholder="00.000.000-0"
                    value={formData.rg}
                    onChange={(e) => handleChange('rg', e.target.value)}
                    error={errors.rg}
                  />
                </div>
              </div>

              <Input
                label="Data de Nascimento"
                type="date"
                value={formData.dob}
                onChange={(e) => handleChange('dob', e.target.value)}
                error={errors.dob}
                className="[color-scheme:light] dark:[color-scheme:dark]"
              />

              <Input
                label="Rua / Avenida / Número"
                placeholder="Ex: Av. Paulista, 1000, Apto 10"
                value={formData.street}
                onChange={(e) => handleChange('street', e.target.value)}
                error={errors.street}
              />

              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    label="Bairro"
                    placeholder="Ex: Centro"
                    value={formData.neighborhood}
                    onChange={(e) => handleChange('neighborhood', e.target.value)}
                    error={errors.neighborhood}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    label="Cidade"
                    placeholder="Ex: São Paulo"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    error={errors.city}
                  />
                </div>
              </div>

              <Textarea
                label="Observação de Endereço (Opcional)"
                placeholder="Ponto de referência, complemento extra..."
                rows={2}
                value={formData.observation}
                onChange={(e) => handleChange('observation', e.target.value)}
                error={errors.observation}
              />

              <div className="relative">
                {/* Manually handled icon integration for Input */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">WhatsApp</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-[20px] z-10">chat</span>
                    <Input
                      placeholder="(00) 00000-0000"
                      value={formData.whatsapp}
                      onChange={handleWhatsappChange}
                      maxLength={15}
                      error={errors.whatsapp}
                      className="pl-11 pr-4"
                      fullWidth={false} // Wrapper handles width
                    />
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">E-mail Principal</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-[20px] z-10">mail</span>
                    <Input
                      placeholder="exemplo@email.com"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      error={errors.email}
                      className="pl-11 pr-4"
                      fullWidth={false}
                    />
                  </div>
                </div>
              </div>

            </div>
          </section>
        </main>

        <footer className="fixed bottom-0 z-40 w-full max-w-md bg-surface-light/80 dark:bg-background-dark/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 pb-safe">
          <div className="px-4 py-4 flex flex-col gap-4">
            <Button
              onClick={validateAndNext}
              isLoading={isValidating}
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