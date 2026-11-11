import { describe, it, expect, beforeEach } from 'vitest';
import { User } from '../../../src/domain/entities/user.entity.js';
import { UserRepositoryPort } from '../../../src/application/ports/user.repository.port.js';
import { PasswordHasherPort } from '../../../src/application/ports/password-hasher.port.js';
import { TokenServicePort, TokenPayload } from '../../../src/application/ports/token-service.port.js';
import { RegisterUserUseCase } from '../../../src/application/use-cases/register-user.use-case.js';
import { LoginUserUseCase } from '../../../src/application/use-cases/login-user.use-case.js';
import { UserAlreadyExistsException, InvalidCredentialsException } from '../../../src/domain/exceptions/domain.exception.js';

class InMemoryUserRepository implements UserRepositoryPort {
  private users: Map<string, User> = new Map();

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }
}

class MockPasswordHasher implements PasswordHasherPort {
  async hash(password: string): Promise<string> {
    return `hashed_${password}`;
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return hash === `hashed_${password}`;
  }
}

class MockTokenService implements TokenServicePort {
  generateToken(payload: TokenPayload): string {
    return `jwt_mock_${payload.userId}`;
  }

  verifyToken(token: string): TokenPayload {
    const userId = token.replace('jwt_mock_', '');
    return { userId, email: 'mock@test.com' };
  }
}

describe('Casos de Uso de Autenticación', () => {
  let userRepo: InMemoryUserRepository;
  let hasher: MockPasswordHasher;
  let tokenService: MockTokenService;
  let registerUseCase: RegisterUserUseCase;
  let loginUseCase: LoginUserUseCase;

  beforeEach(() => {
    userRepo = new InMemoryUserRepository();
    hasher = new MockPasswordHasher();
    tokenService = new MockTokenService();
    registerUseCase = new RegisterUserUseCase(userRepo, hasher, tokenService);
    loginUseCase = new LoginUserUseCase(userRepo, hasher, tokenService);
  });

  it('debe registrar un usuario correctamente y HASHEAR la contraseña (nunca guardar en texto plano)', async () => {
    const output = await registerUseCase.execute({
      fullName: 'Carlos Gómez',
      email: 'carlos@ejemplo.com',
      password: 'password123'
    });

    expect(output.token).toBeDefined();
    expect(output.user.email).toBe('carlos@ejemplo.com');

    // Verificar en persistencia que la contraseña esté hasheada
    const saved = await userRepo.findById(output.user.id);
    expect(saved).not.toBeNull();
    expect(saved?.passwordHash).toBe('hashed_password123');
    expect(saved?.passwordHash).not.toBe('password123');
  });

  it('debe impedir registrar dos usuarios con el mismo correo', async () => {
    await registerUseCase.execute({
      fullName: 'Carlos Gómez',
      email: 'carlos@ejemplo.com',
      password: 'password123'
    });

    await expect(
      registerUseCase.execute({
        fullName: 'Carlos Clon',
        email: 'carlos@ejemplo.com',
        password: 'otraPassword'
      })
    ).rejects.toThrow(UserAlreadyExistsException);
  });

  it('debe iniciar sesión con credenciales correctas y rechazar credenciales erróneas', async () => {
    await registerUseCase.execute({
      fullName: 'Carlos Gómez',
      email: 'carlos@ejemplo.com',
      password: 'password123'
    });

    const loginOutput = await loginUseCase.execute({
      email: 'carlos@ejemplo.com',
      password: 'password123'
    });

    expect(loginOutput.token).toBeDefined();

    // Contraseña errónea
    await expect(
      loginUseCase.execute({
        email: 'carlos@ejemplo.com',
        password: 'clave_incorrecta'
      })
    ).rejects.toThrow(InvalidCredentialsException);

    // Correo inexistente
    await expect(
      loginUseCase.execute({
        email: 'noexiste@ejemplo.com',
        password: 'password123'
      })
    ).rejects.toThrow(InvalidCredentialsException);
  });
});

