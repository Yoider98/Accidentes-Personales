import { Request, Response, NextFunction } from 'express';
import {
  DomainException,
  UnauthorizedAccidentAccessException,
  EntityNotFoundException,
  InvalidCredentialsException,
  UserAlreadyExistsException,
  ValidationException,
  InvalidAccidentStatusException,
  InvalidStatusTransitionException
} from '../../../domain/exceptions/domain.exception.js';
import { ZodError } from 'zod';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  // Manejo de errores de validación de Zod
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Error de validación',
      details: err.errors.map(e => ({
        campo: e.path.join('.'),
        mensaje: e.message
      }))
    });
    return;
  }

  // Prevención de IDOR / Acceso no autorizado a datos de otros
  if (err instanceof UnauthorizedAccidentAccessException) {
    res.status(403).json({
      error: 'Acceso denegado',
      message: 'No tiene autorización para consultar o modificar este accidente.'
    });
    return;
  }

  if (err instanceof EntityNotFoundException) {
    res.status(404).json({
      error: 'No encontrado',
      message: err.message
    });
    return;
  }

  if (err instanceof InvalidCredentialsException) {
    res.status(401).json({
      error: 'No autorizado',
      message: err.message
    });
    return;
  }

  if (err instanceof UserAlreadyExistsException) {
    res.status(409).json({
      error: 'Conflicto',
      message: err.message
    });
    return;
  }

  if (
    err instanceof ValidationException ||
    err instanceof InvalidAccidentStatusException ||
    err instanceof InvalidStatusTransitionException
  ) {
    res.status(400).json({
      error: 'Petición inválida',
      message: err.message
    });
    return;
  }

  if (err instanceof DomainException) {
    res.status(400).json({
      error: 'Regla de negocio no cumplida',
      message: err.message
    });
    return;
  }

  // Error 500 generico: NUNCA exponer trazas ni secretos al cliente
  console.error('Error no controlado en backend:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: 'Ocurrió un error inesperado al procesar su solicitud. Intente nuevamente más tarde.'
  });
}
