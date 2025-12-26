import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
    record: {
        id: string;
        full_name: string;
        email: string;
    };
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { record } = await req.json() as EmailRequest;

        if (!record || !record.email) {
            throw new Error("Dados incompletos para envio de email");
        }

        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'GEC Recadastramento <onboarding@resend.dev>', // User must verify domain to change this
                to: record.email,
                subject: 'Confirmação de Recadastramento 2025',
                html: `
          <h1>Olá, ${record.full_name}!</h1>
          <p>Recebemos seus dados com sucesso, conforme descrito abaixo:</p>

          <h3>Dados Completos</h3>
          <ul style="list-style: none; padding: 0;">
            ${Object.entries(record)
                        .filter(([key]) => !['id', 'created_at', 'updated_at', 'user_id', 'full_name'].includes(key))
                        .map(([key, value]) => {
                            const label = {
                                email: 'Email',
                                cpf: 'CPF',
                                rg: 'RG',
                                dob: 'Data de Nascimento',
                                street: 'Logradouro',
                                neighborhood: 'Bairro',
                                city: 'Cidade',
                                address_obs: 'Observação Endereço',
                                whatsapp: 'WhatsApp',
                                professional_data: 'Dados Profissionais',
                                spouse_data: 'Dados Cônjuge',
                                dependents_data: 'Dependentes'
                            }[key] || key;

                            let displayValue = value;
                            if (typeof value === 'object' && value !== null) {
                                displayValue = JSON.stringify(value, null, 2);
                                if (key === 'dependents_data' && Array.isArray(value)) {
                                    displayValue = value.map((d: any) => `${d.name} (${d.dob})`).join(', ');
                                    if (!value.length) displayValue = 'Nenhum';
                                } else if (key === 'spouse_data') {
                                    displayValue = `${(value as any).name}`;
                                } else if (key === 'professional_data') {
                                    displayValue = `${(value as any).profession} - ${(value as any).company}`;
                                }
                            }

                            return `<li style="margin-bottom: 8px;"><strong>${label}:</strong> ${displayValue || '-'}</li>`;
                        }).join('')}
          </ul>

          <p>Caso tenha alguma informação errada favor entrar em contato.</p>

          <p>Atenciosamente,<br>Diretoria GEC</p>
        `,
            }),
        });

        const data = await res.json();

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
