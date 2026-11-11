import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { RegisterAccidentUseCase } from '../../../application/use-cases/register-accident.use-case.js';
import { ListUserAccidentsUseCase } from '../../../application/use-cases/list-user-accidents.use-case.js';
import { GetAccidentDetailUseCase } from '../../../application/use-cases/get-accident-detail.use-case.js';
import { UpdateAccidentStatusUseCase } from '../../../application/use-cases/update-accident-status.use-case.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

const registerAccidentSchema = z.object({
  affectedName: z.string().min(2, 'El nombre del afectado debe tener al menos 2 caracteres'),
  affectedPhone: z.string().min(7, 'El teléfono de contacto debe tener al menos 7 caracteres'),
  accidentType: z.string().min(2, 'El tipo de accidente es obligatorio'),
  accidentDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'La fecha del accidente debe ser válida'
  }),
  location: z.string().min(2, 'El lugar del accidente es obligatorio'),
  description: z.string().min(5, 'La descripción debe tener al menos 5 caracteres')
});

const updateStatusSchema = z.object({
  status: z.enum(['Registrado', 'En revisión', 'Cerrado'], {
    errorMap: () => ({ message: "El estado debe ser 'Registrado', 'En revisión' o 'Cerrado'" })
  })
});

export class AccidentController {
  constructor(
    private readonly registerAccidentUseCase: RegisterAccidentUseCase,
    private readonly listUserAccidentsUseCase: ListUserAccidentsUseCase,
    private readonly getAccidentDetailUseCase: GetAccidentDetailUseCase,
    private readonly updateAccidentStatusUseCase: UpdateAccidentStatusUseCase
  ) {}

  public create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = registerAccidentSchema.parse(req.body);
      const userId = req.user!.userId; // Extraído del token verificado (PREVENCIÓN TOTAL IDOR)

      const result = await this.registerAccidentUseCase.execute(userId, validated);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  public list = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const result = await this.listUserAccidentsUseCase.execute(userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  public getDetail = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const accidentId = req.params.id;

      const result = await this.getAccidentDetailUseCase.execute(userId, accidentId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  public updateStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const accidentId = req.params.id;
      const { status } = updateStatusSchema.parse(req.body);

      const result = await this.updateAccidentStatusUseCase.execute(userId, accidentId, status);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
