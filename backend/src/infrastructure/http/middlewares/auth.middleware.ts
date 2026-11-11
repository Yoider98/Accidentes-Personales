import { Request, Response, NextFunction } from 'express';
import { TokenServicePort, TokenPayload } from '../../../application/ports/token-service.port.js';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function createAuthMiddleware(tokenService: TokenServicePort) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'No autorizado',
        message: 'Encabezado de autorización ausente o con formato inválido (debe ser Bearer <token>).'
      });
      return;
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      res.status(401).json({
        error: 'No autorizado',
        message: 'Token de autenticación no proporcionado.'
      });
      return;
    }

    try {
      const payload = tokenService.verifyToken(token);
      req.user = payload;
      next();
    } catch (err: any) {
      res.status(401).json({
        error: 'No autorizado',
        message: 'Token inválido o expirado. Inicie sesión nuevamente.'
      });
    }
  };
}
