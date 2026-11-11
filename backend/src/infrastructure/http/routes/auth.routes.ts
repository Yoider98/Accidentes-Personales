import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { createAuthMiddleware } from '../middlewares/auth.middleware.js';
import { TokenServicePort } from '../../../application/ports/token-service.port.js';

export function createAuthRouter(authController: AuthController, tokenService: TokenServicePort): Router {
  const router = Router();
  const authMiddleware = createAuthMiddleware(tokenService);

  router.post('/register', authController.register);
  router.post('/login', authController.login);
  router.get('/me', authMiddleware, authController.me);

  return router;
}
