import React, { useState } from 'react';
import { Header } from '../components/Header';
import { ProgressBar } from '../components/ProgressBar';
import { Button } from '../components/ui/Button';

interface ConsentScreenProps {
  onNext: () => void;
  onBack: () => void;
  checked: boolean;
  setChecked: (val: boolean) => void;
}

export const ConsentScreen: React.FC<ConsentScreenProps> = ({ onNext, onBack, checked, setChecked }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden shadow-2xl bg-background-light dark:bg-background-dark group/design-root">
      <Header title="Recadastramento" onBack={onBack} />
      <ProgressBar step={2} total={6} percentage={30} />

      <div className="flex-1 flex flex-col px-6 pt-6 pb-2">
        <div className="mb-2">
          <h1 className="text-[#1c0d0d] dark:text-white tracking-tight text-[28px] font-extrabold leading-tight text-left pb-2">
            Transparência e Segurança
          </h1>
          <p className="text-neutral-600 dark:text-neutral-300 text-base font-medium leading-normal text-left">
            Antes de prosseguir, precisamos do seu de acordo.
          </p>
        </div>
        <div className="h-6"></div>
        <div className="relative w-full rounded-xl bg-white dark:bg-[#2a1515] shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-neutral-100 dark:border-neutral-800 p-6 overflow-hidden">
          <div className="absolute -top-10 -right-10 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
            <span className="material-symbols-outlined text-[180px] text-primary">gavel</span>
          </div>
          <div className="flex flex-col gap-4 relative z-10">
            <div className="flex items-center gap-3 border-b border-neutral-100 dark:border-neutral-700 pb-4">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined">verified_user</span>
              </div>
              <div>
                <p className="text-[#1c0d0d] dark:text-white text-lg font-bold leading-tight">Uso de Dados</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Política de Privacidade 2025</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-neutral-600 dark:text-neutral-300 text-sm font-normal leading-relaxed text-justify">
                Seus dados serão utilizados <strong>exclusivamente</strong> para fins de atualização cadastral e comunicação interna do clube. Nenhuma informação será compartilhada com terceiros sem sua autorização expressa.
              </p>
              <p className="text-neutral-600 dark:text-neutral-300 text-sm font-normal leading-relaxed text-justify">
                Ao prosseguir, você confirma estar ciente de que suas informações estão protegidas conforme a Lei Geral de Proteção de Dados (LGPD).
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-1 text-primary text-xs font-bold mt-1 hover:underline w-fit cursor-pointer"
              >
                Ler termo completo
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto bg-background-light dark:bg-background-dark p-6 pt-2">
        <div className="mb-6">
          <label className="flex items-center gap-4 p-4 rounded-xl border border-transparent bg-white dark:bg-[#2a1515] shadow-sm hover:border-primary/20 cursor-pointer transition-all group">
            <div className="relative flex items-center justify-center shrink-0">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => setChecked(!checked)}
                className="peer size-6 appearance-none rounded border-2 border-neutral-300 dark:border-neutral-600 checked:bg-primary checked:border-primary transition-all cursor-pointer"
              />
              <span className="material-symbols-outlined absolute text-white text-base opacity-0 peer-checked:opacity-100 pointer-events-none transform scale-90 peer-checked:scale-100 transition-all">check</span>
            </div>
            <span className="text-[#1c0d0d] dark:text-white text-sm font-bold leading-tight select-none group-hover:text-primary transition-colors">
              Li e concordo com os termos de uso e privacidade.
            </span>
          </label>
        </div>
        <Button
          onClick={onNext}
          disabled={!checked}
          rightIcon={<span className="material-symbols-outlined text-white text-xl">arrow_forward</span>}
        >
          Avançar
        </Button>
        <div className="flex justify-center items-center gap-2 mt-6 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="h-8 flex items-center justify-center">
            <div className="text-neutral-900 dark:text-white font-black tracking-[0.2em] text-xs flex items-center gap-1">
              <span className="material-symbols-outlined text-lg">security</span>
              GEC PRIVACIDADE
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Termo Completo */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background-light dark:bg-background-dark animate-in fade-in slide-in-from-bottom-10 duration-200">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/10 bg-surface-light dark:bg-surface-dark shadow-sm shrink-0">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Termo de Consentimento</h2>
            <button
              onClick={() => setShowModal(false)}
              className="size-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
            <div className="max-w-2xl mx-auto text-gray-700 dark:text-gray-300 text-sm leading-relaxed space-y-6 pb-12">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 uppercase">Termo de Consentimento para Tratamento de Dados Pessoais (LGPD)</h3>
                <p className="text-justify">
                  Este documento estabelece as condições para o tratamento de dados pessoais pelo <strong>GRÊMIO ESPORTIVO COMERCIAL</strong>, inscrito no CNPJ sob nº 82.779.901/0001-98, com sede na Rua Elza Matos de Souza, s/n, Loteamento Joviva, Joaçaba/SC, em conformidade com a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais - LGPD).
                </p>
              </div>

              <div>
                <h4 className="font-bold text-primary mb-1">1. DADOS COLETADOS</h4>
                <p className="mb-2">Para viabilizar a proposta de associação, o Clube coleta os seguintes dados do proponente:</p>
                <ul className="list-disc pl-5 space-y-1 marker:text-primary">
                  <li><strong>Identificação:</strong> Nome completo, data de nascimento, naturalidade, CPF e Carteira de Identidade (RG).</li>
                  <li><strong>Profissional e Contato:</strong> Profissão, endereço residencial e comercial, telefones e e-mail.</li>
                  <li><strong>Núcleo Familiar:</strong> Nome do cônjuge e nome/data de nascimento de filhos e demais dependentes.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-primary mb-1">2. FINALIDADE DO TRATAMENTO</h4>
                <p className="mb-2">Os dados coletados serão utilizados exclusivamente para:</p>
                <ul className="list-disc pl-5 space-y-1 marker:text-primary">
                  <li>Análise e processamento da proposta de sócio e inclusão no quadro social.</li>
                  <li>Controle de acesso físico às dependências da Sede Própria no Loteamento Joviva.</li>
                  <li>Gestão financeira, incluindo emissão de boletos de mensalidades e cobranças.</li>
                  <li>Cumprimento das obrigações estabelecidas no Estatuto do Clube.</li>
                  <li>Envio de comunicações oficiais, convocações para assembleias e informativos sociais.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-primary mb-1">3. TRATAMENTO DE DADOS DE MENORES</h4>
                <p className="text-justify">
                  O tratamento de dados de filhos e dependentes menores de idade é realizado visando o seu melhor interesse, para permitir o usufruto das atividades do Clube. Ao fornecer estes dados e aceitar este termo, o proponente declara ser o pai/mãe ou responsável legal pelos menores informados, autorizando o tratamento nos termos do Art. 14 da LGPD.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-primary mb-1">4. SEGURANÇA E COMPARTILHAMENTO</h4>
                <p className="text-justify mb-2">
                  O Clube compromete-se a adotar medidas de segurança para proteger os dados pessoais contra acessos não autorizados. Os dados não serão vendidos ou compartilhados com terceiros para fins de publicidade. O compartilhamento ocorrerá apenas:
                </p>
                <ul className="list-disc pl-5 space-y-1 marker:text-primary">
                  <li>Com instituições financeiras para emissão e registro de boletos.</li>
                  <li>Com empresas de software de gestão utilizadas pela secretaria do Clube.</li>
                  <li>Por determinação legal ou ordem judicial.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-primary mb-1">5. DIREITOS DO TITULAR E RETENÇÃO</h4>
                <p className="text-justify">
                  O titular dos dados tem o direito de confirmar a existência de tratamento, acessar, corrigir dados incompletos ou inexatos e revogar este consentimento a qualquer momento. Os dados serão mantidos enquanto durar o vínculo associativo ou pelos prazos legais de guarda de documentos após o desligamento do sócio.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-primary mb-1">6. ACEITE DIGITAL</h4>
                <p className="text-justify">
                  Ao clicar em "Aceito" no formulário de inscrição, o proponente atesta a veracidade das informações e confirma sua livre vontade em fornecer os dados para as finalidades aqui descritas.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-background-light dark:bg-background-dark border-t border-gray-100 dark:border-white/10 shrink-0">
            <Button
              onClick={() => {
                setShowModal(false);
                if (!checked) setChecked(true);
              }}
            >
              Li e Concordo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};