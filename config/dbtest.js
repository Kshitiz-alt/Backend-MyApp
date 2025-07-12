import {pool} from './db.js';

async function test() {
  const res = await pool.query('SELECT NOW()');
  console.log('PostgreSQL connected at:', res.rows[0].now);
  process.exit(0);
}

test().catch(err => {
  console.error('DB connection error:', err);
  process.exit(1);
});