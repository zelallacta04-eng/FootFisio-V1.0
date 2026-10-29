import { getPool } from '../config/db.js';
export async function findUserByEmail(email) { const [rows] = await getPool().execute('SELECT id, nombre, correo, contrasena_hash, rol, activo FROM usuarios WHERE correo = ? LIMIT 1', [email]); return rows[0] || null; }
export async function createUser({ nombre, correo, contrasena_hash }) { const [result] = await getPool().execute("INSERT INTO usuarios (nombre, correo, contrasena_hash, rol) VALUES (?, ?, ?, 'recepcionista')", [nombre, correo, contrasena_hash]); return { id: result.insertId, nombre, correo, rol: 'recepcionista' }; }
