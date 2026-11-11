import { User } from '../../domain/entities/user.entity.js';
import { UserRepositoryPort } from '../ports/user.repository.port.js';
import { PasswordHasherPort } from '../ports/password-hasher.port.js';
import { TokenServicePort } from '../ports/token-service.port.js';
import { UserAlreadyExistsException, ValidationException } from '../../domain/exceptions/domain.exception.js';
import crypto from 'node:crypto';

export interface RegisterUserInput {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthOutput {
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
}

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly tokenService: TokenServicePort
  ) {}

  public async execute(input: RegisterUserInput): Promise<AuthOutput> {
    if (!input.email || !input.email.includes('@')) {
      throw new ValidationException('El correo electrónico es inválido.');
    }
    if (!input.password || input.password.length < 6) {
      throw new ValidationException('La contraseña debe tener al menos 6 caracteres.');
    }
    if (!input.fullName || input.fullName.trim() === '') {
      throw new ValidationException('El nombre completo es requerido.');
    }

    const normalizedEmail = input.email.toLowerCase().trim();
    const existing = await this.userRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw new UserAlreadyExistsException(normalizedEmail);
    }

    // Hashear contraseña (seguridad obligatoria, nunca en texto plano)
    const passwordHash = await this.passwordHasher.hash(input.password);
    const userId = crypto.randomUUID();

    const user = new User({
      id: userId,
      email: normalizedEmail,
      passwordHash,
      fullName: input.fullName.trim()
    });

    await this.userRepository.save(user);

    const token = this.tokenService.generateToken({
      userId: user.id,
      email: user.email
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName
      }
    };
  }
}

