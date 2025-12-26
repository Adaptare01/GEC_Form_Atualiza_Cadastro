import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { FormData } from '../contexts/FormContext';
import { FooterLogo } from '../components/FooterLogo';

interface SummaryScreenProps {
    id: string;
}

export const SummaryScreen: React.FC<SummaryScreenProps> = ({ id }) => {
    const [data, setData] = useState<FormData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: registration, error } = await supabase
                    .from('registrations')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;

                // Map DB columns back to FormData structure
                const mappedData: FormData = {
                    fullName: registration.full_name,
                    cpf: registration.cpf,
                    rg: registration.rg,
                    dob: registration.dob,
                    street: registration.street,
                    neighborhood: registration.neighborhood,
                    city: registration.city,
                    observation: registration.address_obs,
                    whatsapp: registration.whatsapp,
                    email: registration.email,
                    profession: registration.professional_data?.profession || '',
                    company: registration.professional_data?.company || '',
                    workAddress: registration.professional_data?.workAddress || '',
                    workPhone: registration.professional_data?.workPhone || '',
                    hasSpouse: !!registration.spouse_data,
                    spouseName: registration.spouse_data?.name || '',
                    spouseEmail: registration.spouse_data?.email || '',
                    spouseDob: registration.spouse_data?.dob || '',
                    dependents: registration.dependents_data || []
                };

                setData(mappedData);
            } catch (err: any) {
                console.error('Error fetching data:', err);
                setError('Não foi possível carregar os dados. Link inválido ou expirado.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark text-gray-900 dark:text-white p-4 text-center">
                <span className="material-symbols-outlined text-4xl text-red-500 mb-4">error</span>
                <h1 className="text-xl font-bold mb-2">Erro</h1>
                <p className="text-gray-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen text-gray-900 dark:text-gray-100 font-display">
            <div className="max-w-2xl mx-auto p-6">
                <div className="text-center mb-8">
                    <FooterLogo />
                    <h1 className="text-2xl font-bold mt-6 text-primary">Resumo do Cadastro</h1>
                    <p className="text-gray-500 dark:text-gray-400">Confira os dados enviados.</p>
                </div>

                <div className="space-y-6">
                    <Section title="Dados Pessoais">
                        <Field label="Nome" value={data.fullName} />
                        <Field label="CPF" value={data.cpf} />
                        <Field label="RG" value={data.rg} />
                        <Field label="Nascimento" value={new Date(data.dob).toLocaleDateString('pt-BR')} />
                        <Field label="WhatsApp" value={data.whatsapp} />
                        <Field label="E-mail" value={data.email} />
                    </Section>

                    <Section title="Endereço">
                        <Field label="Rua" value={data.street} />
                        <Field label="Bairro" value={data.neighborhood} />
                        <Field label="Cidade" value={data.city} />
                        {data.observation && <Field label="Obs" value={data.observation} />}
                    </Section>

                    <Section title="Dados Profissionais">
                        <Field label="Profissão" value={data.profession} />
                        <Field label="Empresa" value={data.company} />
                        {data.workPhone && <Field label="Tel. Comercial" value={data.workPhone} />}
                    </Section>

                    {data.hasSpouse && (
                        <Section title="Cônjuge">
                            <Field label="Nome" value={data.spouseName} />
                            <Field label="E-mail" value={data.spouseEmail} />
                        </Section>
                    )}

                    {data.dependents.length > 0 && (
                        <Section title={`Dependentes (${data.dependents.length})`}>
                            {data.dependents.map((dep, idx) => (
                                <div key={idx} className="mb-2 pb-2 last:mb-0 last:pb-0 border-b border-gray-100 dark:border-white/5 last:border-0">
                                    <p className="font-medium">{dep.name}</p>
                                    <p className="text-sm text-gray-500">{new Date(dep.dob).toLocaleDateString('pt-BR')} • {dep.relationship}</p>
                                </div>
                            ))}
                        </Section>
                    )}
                </div>
            </div>
        </div>
    );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-5 shadow-sm border border-gray-100 dark:border-white/5">
        <h3 className="text-lg font-bold mb-4 text-primary border-b border-primary/10 pb-2">{title}</h3>
        <div className="space-y-3">{children}</div>
    </div>
);

const Field: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
        <dd className="text-sm font-semibold text-gray-900 dark:text-white sm:col-span-2">{value || '-'}</dd>
    </div>
);
