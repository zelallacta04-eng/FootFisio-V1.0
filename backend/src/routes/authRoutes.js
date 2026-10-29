import { Router } from 'express';
import { createAuthController } from '../controllers/authController.js';
export function createAuthRoutes(){ const router=Router(); const c=createAuthController(); router.post('/register',c.register); router.post('/login',c.login); return router; }
