import { patientDao as defaultDao } from '../dao/patientDao.js';
import { validatePatient } from '../services/patientValidation.js';

// Controller: traduce solicitudes HTTP a operaciones del DAO.
export function createPatientController(dao = defaultDao) {
  return {
    list: async (req, res, next) => { try { res.json(await dao.findAll(String(req.query.search || ''))); } catch (e) { next(e); } },
    get: async (req, res, next) => { try { const item = await dao.findById(Number(req.params.id)); item ? res.json(item) : res.status(404).json({ error: 'Paciente no encontrado.' }); } catch (e) { next(e); } },
    create: async (req, res, next) => {
      const result = validatePatient(req.body);
      if (!result.valid) return res.status(400).json({ error: 'Datos inválidos.', details: result.errors });
      try { res.status(201).json(await dao.create(result.value)); } catch (e) { next(e); }
    },
    update: async (req, res, next) => {
      const result = validatePatient(req.body);
      if (!result.valid) return res.status(400).json({ error: 'Datos inválidos.', details: result.errors });
      try { const item = await dao.update(Number(req.params.id), result.value); item ? res.json(item) : res.status(404).json({ error: 'Paciente no encontrado.' }); } catch (e) { next(e); }
    },
    remove: async (req, res, next) => { try { const ok = await dao.remove(Number(req.params.id)); ok ? res.status(204).end() : res.status(404).json({ error: 'Paciente no encontrado.' }); } catch (e) { next(e); } }
  };
}
