import mysql from 'mysql2/promise';

let pool;
export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'footfisio_app',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'footfisio',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4'
    });
  }
  return pool;
}
export async function closePool() {
  if (pool) { await pool.end(); pool = undefined; }
}
