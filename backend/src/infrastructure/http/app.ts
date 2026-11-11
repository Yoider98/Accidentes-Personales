import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { UserRepositoryPort } from '../../application/ports/user.repository.port.js';
import { AccidentRepositoryPort } from '../../application/ports/accident.repository.port.js';
import { PasswordHasherPort } from '../../application/ports/password-hasher.port.js';
import { TokenServicePort } from '../../application/ports/token-service.port.js';
import { IdGeneratorPort } from '../../application/ports/id-generator.port.js';
import { PostgresUserRepository } from '../persistence/postgres-user.repository.js';
import { PostgresAccidentRepository } from '../persistence/postgres-accident.repository.js';
import { BcryptPasswordHasher } from '../security/bcrypt-password-hasher.js';
import { JwtTokenService } from '../security/jwt-token-service.js';
import { UuidGenerator } from '../security/uuid-generator.js';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case.js';
import { LoginUserUseCase } from '../../application/use-cases/login-user.use-case.js';
import { GetAuthenticatedUserUseCase } from '../../application/use-cases/get-authenticated-user.use-case.js';
import { RegisterAccidentUseCase } from '../../application/use-cases/register-accident.use-case.js';
import { ListUserAccidentsUseCase } from '../../application/use-cases/list-user-accidents.use-case.js';
import { GetAccidentDetailUseCase } from '../../application/use-cases/get-accident-detail.use-case.js';
import { UpdateAccidentStatusUseCase } from '../../application/use-cases/update-accident-status.use-case.js';
import { AuthController } from './controllers/auth.controller.js';
import { AccidentController } from './controllers/accident.controller.js';
import { createAuthRouter } from './routes/auth.routes.js';
import { createAccidentRouter } from './routes/accident.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';

export interface AppDependencies {
  userRepository?: UserRepositoryPort;
  accidentRepository?: AccidentRepositoryPort;
  passwordHasher?: PasswordHasherPort;
  tokenService?: TokenServicePort;
  idGenerator?: IdGeneratorPort;
}

export function createApp(deps: AppDependencies = {}): Express {
  const app = express();

  // Middlewares de seguridad y parsing
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // Inyección de dependencias (por defecto adaptadores reales de infraestructura)
  const userRepository = deps.userRepository || new PostgresUserRepository();
  const accidentRepository = deps.accidentRepository || new PostgresAccidentRepository();
  const passwordHasher = deps.passwordHasher || new BcryptPasswordHasher();
  const tokenService = deps.tokenService || new JwtTokenService();
  const idGenerator = deps.idGenerator || new UuidGenerator();

  // Casos de uso
  const registerUserUseCase = new RegisterUserUseCase(userRepository, passwordHasher, tokenService, idGenerator);
  const loginUserUseCase = new LoginUserUseCase(userRepository, passwordHasher, tokenService);
  const getAuthenticatedUserUseCase = new GetAuthenticatedUserUseCase(userRepository);
  const registerAccidentUseCase = new RegisterAccidentUseCase(accidentRepository, userRepository, idGenerator);
  const listUserAccidentsUseCase = new ListUserAccidentsUseCase(accidentRepository);
  const getAccidentDetailUseCase = new GetAccidentDetailUseCase(accidentRepository);
  const updateAccidentStatusUseCase = new UpdateAccidentStatusUseCase(accidentRepository);

  // Controladores
  const authController = new AuthController(registerUserUseCase, loginUserUseCase, getAuthenticatedUserUseCase);
  const accidentController = new AccidentController(
    registerAccidentUseCase,
    listUserAccidentsUseCase,
    getAccidentDetailUseCase,
    updateAccidentStatusUseCase
  );

  // Healthcheck endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Rutas
  app.use('/api/auth', createAuthRouter(authController, tokenService));
  app.use('/api/accidents', createAccidentRouter(accidentController, tokenService));

  // Middleware global de manejo de excepciones
  app.use(errorHandler);

  return app;
}

