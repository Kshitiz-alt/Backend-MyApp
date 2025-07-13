import {app} from "./app.js";
import dotenv from 'dotenv';
import { pool } from "./config/db.js";
dotenv.config();

// default port 
const PORT = process.env.PORT || 5000


app.get('/test-db', async (req, res) => {
  try {
    console.log('Trying to connect to DB with:', {
      user: process.env.PGUSER,
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      port: process.env.PGPORT,
    });

    const result = await pool.query('SELECT NOW()');
    res.json(result.rows[0]);
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.listen(PORT, ()=>{
    console.log(`Server is working on port ${PORT}`)
})

