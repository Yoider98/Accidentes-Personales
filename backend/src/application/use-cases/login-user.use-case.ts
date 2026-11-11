import { UserRepositoryPort } from '../ports/user.repository.port.js';
import { PasswordHasherPort } from '../ports/password-hasher.port.js';
import { TokenServicePort } from '../ports/token-service.port.js';
import { InvalidCredentialsException, ValidationException } from '../../domain/exceptions/domain.exception.js';
import { AuthOutput } from './register-user.use-case.js';

export interface LoginUserInput {
  email: string;
  password: string;
}

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly tokenService: TokenServicePort
  ) {}

  public async execute(input: LoginUserInput): Promise<AuthOutput> {
    if (!input.email || !input.password) {
      throw new ValidationException('El correo y la contraseña son obligatorios.');
    }

    const normalizedEmail = input.email.toLowerCase().trim();
    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await this.passwordHasher.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

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

