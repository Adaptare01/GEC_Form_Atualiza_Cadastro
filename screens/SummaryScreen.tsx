import React from 'react';
import { FooterLogo } from '../components/FooterLogo';

interface SummaryScreenProps {
    id: string;
}

export const SummaryScreen: React.FC<SummaryScreenProps> = ({ id }) => {
    return (
        <div className="w-full max-w-2xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-[#e8cece]">
                {/* Ícone de Sucesso */}
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-4xl text-green-600">
                        check_circle
                    </span>
                </div>

                <h2 className="text-3xl font-bold text-[#f20d0d] mb-4">
                    Cadastro Realizado com Sucesso!
                </h2>

                <p className="text-gray-600 text-lg mb-8">
                    Seus dados foram gravados com segurança no nosso novo sistema.
                    <br />
                    Não é necessário fazer mais nada.
                </p>

                {/* Mostra o ID do cadastro como protocolo */}
                <div className="bg-gray-50 p-4 rounded-lg inline-block mb-8 border border-gray-200">
                    <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Protocolo de Registro</p>
                    <p className="text-xl font-mono text-gray-800">{id}</p>
                </div>

                <div className="pt-6 border-t border-gray-100">
                    <p className="text-sm text-gray-400">
                        Grêmio Esportivo Comercial - GEC 2025
                    </p>
                </div>
            </div>

            <div className="mt-8 flex justify-center">
                <FooterLogo />
            </div>
        </div>
    );
};