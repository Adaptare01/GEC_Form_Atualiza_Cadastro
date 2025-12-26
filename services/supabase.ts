import { createClient } from '@supabase/supabase-js';
import { FormData } from '../contexts/FormContext';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase keys are missing in environment variables');
}

// Prevent app crash if keys are missing
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const submitRegistration = async (data: FormData) => {
    if (!supabase) {
        console.error('Supabase client is not initialized. Check your .env.local file.');
        throw new Error('Configuração do Supabase ausente. Reinicie o servidor.');
    }

    const { data: result, error } = await supabase
        .from('registrations')
        .insert([
            {
                full_name: data.fullName,
                cpf: data.cpf,
                rg: data.rg,
                dob: data.dob || null,
                street: data.street,
                neighborhood: data.neighborhood,
                city: data.city,
                address_obs: data.observation,
                // address: data.address, // Legacy field, not used
                whatsapp: data.whatsapp,
                email: data.email,
                professional_data: {
                    profession: data.profession,
                    company: data.company,
                    workAddress: data.workAddress,
                    workPhone: data.workPhone
                },
                spouse_data: data.hasSpouse ? {
                    name: data.spouseName,
                    email: data.spouseEmail,
                    dob: data.spouseDob // Optional/Legacy
                } : null,
                dependents_data: data.dependents
            }
        ])
        .select()
        .single();

    if (error) {
        throw error;
    }

    return result;
};

export const checkCpfExists = async (cpf: string): Promise<boolean> => {
    if (!supabase) return false;

    const { data, error } = await supabase.rpc('check_cpf_exists', {
        cpf_input: cpf
    });

    if (error) {
        console.error('Error checking CPF:', error);
        return false;
    }

    return !!data;
};


