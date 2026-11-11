import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { RegisterUserUseCase } from '../../../application/use-cases/register-user.use-case.js';
import { LoginUserUseCase } from '../../../application/use-cases/login-user.use-case.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { UserRepositoryPort } from '../../../application/ports/user.repository.port.js';

const registerSchema = z.object({
  email: z.string().email('Debe ser un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  fullName: z.string().min(2, 'El nombre completo debe tener al menos 2 caracteres')
});

const loginSchema = z.object({
  email: z.string().email('Debe ser un correo electrónico válido'),
  password: z.string().min(1, 'La contraseña es obligatoria')
});

export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly userRepository: UserRepositoryPort
  ) {}

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = registerSchema.parse(req.body);
      const result = await this.registerUserUseCase.execute(validated);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await this.loginUserUseCase.execute(validated);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  public me = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'No autorizado' });
        return;
      }
      const user = await this.userRepository.findById(userId);
      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      res.status(200).json({
        id: user.id,
        email: user.email,
        fullName: user.fullName
      });
    } catch (error) {
      next(error);
    }
  };
}

