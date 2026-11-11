import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from '../controllers/auth.controller.js';
import { createAuthMiddleware } from '../middlewares/auth.middleware.js';
import { TokenServicePort } from '../../../application/ports/token-service.port.js';

export function createAuthRouter(authController: AuthController, tokenService: TokenServicePort): Router {
  const router = Router();
  const authMiddleware = createAuthMiddleware(tokenService);

  // Rate Limiting para endpoints de autenticación contra ataques de fuerza bruta
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    limit: 50, // límite razonable de peticiones
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
      error: 'Demasiadas solicitudes',
      message: 'Ha superado el límite de intentos de autenticación. Por favor intente más tarde.'
    }
  });

  router.post('/register', authLimiter, authController.register);
  router.post('/login', authLimiter, authController.login);
  router.get('/me', authMiddleware, authController.me);

  return router;
}

