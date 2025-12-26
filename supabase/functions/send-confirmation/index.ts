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
          <p>Recebemos seus dados com sucesso.</p>
          <p>Você pode conferir as informações enviadas acessando o link abaixo:</p>
          <p>
            <a href="http://localhost:5173/?id=${record.id}" style="padding: 12px 24px; background-color: #A4161A; color: white; text-decoration: none; border-radius: 5px;">
              Ver Meu Cadastro
            </a>
          </p>
          <p>Atenciosamente,<br>Equipe GEC</p>
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
