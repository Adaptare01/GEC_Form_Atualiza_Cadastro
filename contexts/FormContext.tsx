import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface FormData {
    // Personal Data
    fullName: string;
    cpf: string;
    rg: string;
    dob: string;

    // Address Data
    street: string;
    neighborhood: string;
    city: string;
    observation: string;

    whatsapp: string;
    email: string;

    // Professional Data
    profession: string;
    company: string;
    workAddress: string;
    workPhone: string;

    // Spouse Data
    hasSpouse: boolean;
    spouseName: string;
    spouseEmail: string;
    spouseDob: string;

    // Dependents Data
    dependents: Array<{
        name: string;
        dob: string;
        relationship: string;
    }>;
}

const initialFormData: FormData = {
    fullName: '',
    cpf: '',
    rg: '',
    dob: '',
    street: '',
    neighborhood: '',
    city: '',
    observation: '',
    whatsapp: '',
    email: '',
    profession: '',
    company: '',
    workAddress: '',
    workPhone: '',
    hasSpouse: false,
    spouseName: '',
    spouseEmail: '',
    spouseDob: '',
    dependents: []
};

interface FormContextType {
    formData: FormData;
    updateFormData: (data: Partial<FormData>) => void;
    resetForm: () => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [formData, setFormData] = useState<FormData>(initialFormData);

    const updateFormData = (data: Partial<FormData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const resetForm = () => {
        setFormData(initialFormData);
    };

    return (
        <FormContext.Provider value={{ formData, updateFormData, resetForm }}>
            {children}
        </FormContext.Provider>
    );
};

export const useFormContext = () => {
    const context = useContext(FormContext);
    if (context === undefined) {
        throw new Error('useFormContext must be used within a FormProvider');
    }
    return context;
};
