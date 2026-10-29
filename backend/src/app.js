import express from 'express';
import cors from 'cors';
import { createPatientRoutes } from './routes/patientRoutes.js';
import { createAuthRoutes } from './routes/authRoutes.js';

export function createApp({ patientRoutes = createPatientRoutes() } = {}) {
  const app = express();
  app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' }));
  app.use(express.json({ limit: '1mb' }));
  app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'FootFisio API' }));
  app.use('/api/auth', createAuthRoutes());
  app.use('/api/pacientes', patientRoutes);
  app.use((err, _req, res, _next) => {
    if (err?.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Ya existe un paciente con ese DNI o dato único.' });
    if (err?.code === 'ER_NO_REFERENCED_ROW_2' || err?.code === 'ER_ROW_IS_REFERENCED_2') return res.status(409).json({ error: 'No se puede completar la operación por una relación existente.' });
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  });
  return app;
}
