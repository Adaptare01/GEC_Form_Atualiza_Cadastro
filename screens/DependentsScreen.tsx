import React, { useState } from 'react';
import { ProgressBar } from '../components/ProgressBar';
import { useFormContext, FormData } from '../contexts/FormContext';
import { submitRegistration, sendConfirmationEmail } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { DateInput } from '../components/ui/DateInput';

interface DependentsScreenProps {
  onNext: () => void;
  onBack: () => void;
}

interface Dependent {
  id: number;
  name: string;
  dob: string;
}

export const DependentsScreen: React.FC<DependentsScreenProps> = ({ onNext, onBack }) => {
  const { formData, updateFormData } = useFormContext();
  const [showForm, setShowForm] = useState(false);

  // Local state for new dependent form
  const [newDepName, setNewDepName] = useState('');
  const [newDepDob, setNewDepDob] = useState('');
  const [formError, setFormError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cast context dependents to local type if needed, but they should match if I update context types appropriately in my head
  // In FormContext: dependents: Array<{ name: string; dob: string; relationship: string; }>;
  // Here: Dependent { id: number; name: string; dob: string; }
  // The context definition assumes relationship, but UI doesn't ask for it.
  // I will adapt. I'll store ID in context as well or just generate it.
  // Actually, I should update FormContext definition to match reality or adapt here.
  // For simplicity, I will map the types.

  const dependents = formData.dependents || [];

  const handleSaveDependent = () => {
    if (!newDepName.trim() || !newDepDob) {
      setFormError(true);
      alert("Preencha Nome e Data de Nascimento para adicionar um dependente.");
      return;
    }

    const newDep = {
      name: newDepName,
      dob: newDepDob,
      relationship: 'Filho/Dependente' // Defaulting as UI doesn't ask
    };

    updateFormData({ dependents: [...dependents, newDep] });

    // Reset form
    setNewDepName('');
    setNewDepDob('');
    setFormError(false);
    setShowForm(false);
  };

  const removeDependent = (index: number) => {
    const newList = [...dependents];
    newList.splice(index, 1);
    updateFormData({ dependents: newList });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true);
      const result = await submitRegistration(formData);

      // Send confirmation email asynchronously (fire and forget)
      if (result && result.id) {
        sendConfirmationEmail(result);
      }

      onNext(); // Go to Success Screen
    } catch (error: any) {
      console.error('Error submitting:', error);
      // Show actual error to help debugging
      alert(`Erro ao enviar cadastro: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl bg-background-light dark:bg-background-dark">
      <div className="flex items-center justify-between px-4 pt-6 pb-2 bg-background-light dark:bg-background-dark sticky top-0 z-20">
        <button onClick={onBack} aria-label="Voltar" className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-text-main dark:text-white">
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        <h2 className="text-text-main dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">
          Dependentes
        </h2>
      </div>

      <ProgressBar step={6} total={6} percentage={100} />

      <main className="flex-1 px-5 pb-48">
        <div className="pt-2 pb-6">
          <h1 className="text-text-main dark:text-white text-[28px] font-extrabold leading-tight mb-2">Seus Filhos/<br />Dependentes</h1>
          <p className="text-text-secondary dark:text-gray-300 text-base font-normal leading-relaxed">
            Adicione os dados dos seus filhos ou dependentes legais para atualizar seu cadastro.
          </p>
        </div>

        <div className="mb-8">
          {!showForm ? (
            <button onClick={() => setShowForm(true)} aria-label="Adicionar dependente" className="group w-full flex items-center justify-center gap-2 border-2 border-dashed border-primary/40 hover:border-primary bg-primary-light/50 hover:bg-primary-light dark:bg-primary/10 dark:hover:bg-primary/20 dark:border-primary/50 text-primary font-bold py-4 rounded-xl transition-all duration-300">
              <span className="material-symbols-outlined group-hover:scale-110 transition-transform">add_circle</span>
              <span>Adicionar Dependente</span>
            </button>
          ) : (
            <button onClick={() => setShowForm(false)} className="w-full flex items-center justify-center gap-2 border border-transparent hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 font-bold py-2 rounded-xl transition-all">
              <span className="material-symbols-outlined">close</span>
              <span>Cancelar Adição</span>
            </button>
          )}

          <p className="text-xs text-center text-text-secondary dark:text-gray-500 mt-2">
            Você pode adicionar até 6 dependentes.
          </p>
        </div>

        {showForm && (
          <div className="mb-6 p-5 bg-card-light dark:bg-card-dark rounded-xl border border-primary/20 shadow-lg relative animate-fade-in">
            <div className="absolute -top-3 left-4 bg-primary text-white text-xs font-bold px-2 py-1 rounded">Novo Dependente</div>
            <div className="flex flex-col gap-4 pt-2">
              <Input
                label="Nome Completo"
                placeholder="Ex: Ana Souza"
                value={newDepName}
                onChange={(e) => setNewDepName(e.target.value)}
                error={formError && !newDepName}
              />
              <DateInput
                label="Data de Nascimento"
                value={newDepDob}
                onChange={(date) => setNewDepDob(date)}
                error={formError && !newDepDob}
              />
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-text-secondary dark:text-gray-300 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-white/5">Cancelar</button>
                <button onClick={handleSaveDependent} className="flex-1 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-md shadow-primary/20">Salvar</button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary dark:text-gray-400">Cadastrados ({dependents.length}/6)</h3>
          </div>

          {dependents.map((dep, index) => (
            <div key={index} className="relative group overflow-hidden bg-card-light dark:bg-card-dark rounded-xl shadow-soft border border-border-light/50 dark:border-border-dark flex items-center p-4 gap-4 transition-transform active:scale-[0.99]">
              <div className="shrink-0 bg-primary/10 rounded-full h-12 w-12 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">person</span>
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <p className="text-text-main dark:text-white text-base font-bold leading-tight truncate">{dep.name}</p>
                <div className="flex items-center gap-1 mt-1 text-sm text-text-secondary dark:text-gray-400">
                  <span className="material-symbols-outlined text-[16px]">cake</span>
                  <span>{formatDate(dep.dob)}</span>
                </div>
              </div>
              <div className="shrink-0 flex gap-1">
                <button onClick={() => removeDependent(index)} aria-label="Remover" className="p-2 text-text-secondary hover:text-red-600 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/20">
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            </div>
          ))}

          {dependents.length === 0 && (
            <div className="text-center py-8 text-gray-400 dark:text-gray-600 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
              Nenhum dependente cadastrado.
            </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-0 w-full max-w-md bg-white/80 dark:bg-[#1a0f0f]/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 p-5 pb-8 z-30">
        <Button
          onClick={handleFinalSubmit}
          isLoading={isSubmitting}
          rightIcon={<span className="material-symbols-outlined">check_circle</span>}
        >
          Enviar Cadastro Completo
        </Button>
        <div className="flex justify-center mt-6 opacity-60">
          <div className="h-8 w-auto flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-gradient-to-tr from-primary to-red-800"></div>
            <span className="text-xs font-bold tracking-widest text-text-secondary dark:text-gray-500">GEC 2025</span>
          </div>
        </div>
      </div>
    </div>
  );
};