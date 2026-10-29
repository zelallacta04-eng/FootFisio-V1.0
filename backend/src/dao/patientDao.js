import { getPool } from '../config/db.js';

// DAO: único módulo responsable de las consultas SQL de pacientes.
export function createPatientDao(poolProvider = getPool) {
  return {
    async findAll(search = '') {
      const pool = poolProvider();
      const term = `%${search}%`;
      const [rows] = await pool.execute(
        `SELECT id, nombres, apellidos, dni, telefono, correo, fecha_nacimiento, condicion, creado_en
         FROM pacientes WHERE nombres LIKE ? OR apellidos LIKE ? OR dni LIKE ? ORDER BY apellidos, nombres`,
        [term, term, term]
      );
      return rows;
    },
    async findById(id) {
      const [rows] = await poolProvider().execute('SELECT id, nombres, apellidos, dni, telefono, correo, fecha_nacimiento, condicion, creado_en FROM pacientes WHERE id = ?', [id]);
      return rows[0] || null;
    },
    async create(patient) {
      const [result] = await poolProvider().execute(
        'INSERT INTO pacientes (nombres, apellidos, dni, telefono, correo, fecha_nacimiento, condicion) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [patient.nombres, patient.apellidos, patient.dni, patient.telefono, patient.correo, patient.fecha_nacimiento, patient.condicion]
      );
      return this.findById(result.insertId);
    },
    async update(id, patient) {
      const [result] = await poolProvider().execute(
        'UPDATE pacientes SET nombres=?, apellidos=?, dni=?, telefono=?, correo=?, fecha_nacimiento=?, condicion=? WHERE id=?',
        [patient.nombres, patient.apellidos, patient.dni, patient.telefono, patient.correo, patient.fecha_nacimiento, patient.condicion, id]
      );
      return result.affectedRows ? this.findById(id) : null;
    },
    async remove(id) {
      const [result] = await poolProvider().execute('DELETE FROM pacientes WHERE id = ?', [id]);
      return result.affectedRows > 0;
    }
  };
}
export const patientDao = createPatientDao();
