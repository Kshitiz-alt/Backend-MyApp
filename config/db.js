import pkg from 'pg'
import dotenv from 'dotenv'


dotenv.config({ path: './config/.env'})

const { Pool } = pkg;



export const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT),
  ssl: {
    rejectUnauthorized: false,
  },
});

