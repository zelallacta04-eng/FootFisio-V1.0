import { Router } from 'express';
import { createPatientController } from '../controllers/patientController.js';

export function createPatientRoutes(controller = createPatientController()) {
  const router = Router();
  router.get('/', controller.list);
  router.get('/:id', controller.get);
  router.post('/', controller.create);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.remove);
  return router;
}
