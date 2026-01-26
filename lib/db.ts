import { Pool } from 'pg';

// Cria a conexão com o banco (suporta SSL se precisar)
export const db = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: process.env.POSTGRES_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
}); 