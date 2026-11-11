import { Router } from 'express';
import { AccidentController } from '../controllers/accident.controller.js';
import { createAuthMiddleware } from '../middlewares/auth.middleware.js';
import { TokenServicePort } from '../../../application/ports/token-service.port.js';

export function createAccidentRouter(accidentController: AccidentController, tokenService: TokenServicePort): Router {
  const router = Router();
  const authMiddleware = createAuthMiddleware(tokenService);

  // Todos los endpoints de accidentes están protegidos obligatoriamente por autenticación
  router.use(authMiddleware);

  router.post('/', accidentController.create);
  router.get('/', accidentController.list);
  router.get('/:id', accidentController.getDetail);
  router.patch('/:id/status', accidentController.updateStatus);

  return router;
}
