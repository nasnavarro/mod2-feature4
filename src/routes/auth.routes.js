import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";

const router = Router();

// Gestiona las rutas de autenticación, con estructura previa definida en
// index.routes: /api/auth

router.post('/register', authController.register);
router.post('/login', authController.login);

export default router;
