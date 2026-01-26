import { Pool } from 'pg';

// O arquivo começa com _ para a Vercel saber que é utilitário, não rota
export const db = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: process.env.POSTGRES_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
});