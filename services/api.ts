// services/api.ts

// Função para verificar se o CPF já existe
export const checkCpfExists = async (cpf: string): Promise<boolean> => {
  try {
    // Atenção aqui: o uso correto da crase (backtick) sem barra antes
    const response = await fetch(`/api/check-cpf?cpf=${encodeURIComponent(cpf)}`);

    if (!response.ok) {
      console.error('Erro na verificação de CPF:', response.statusText);
      return false;
    }

    const data = await response.json();
    return data.exists;
  } catch (error) {
    console.error('Erro de conexão ao verificar CPF:', error);
    return false;
  }
};

// Função para enviar o cadastro completo
export const submitRegistration = async (formData: any) => {
  try {
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Erro ao processar cadastro');
    }

    return result;
  } catch (error) {
    console.error('Erro no envio:', error);
    throw error;
  }
};
