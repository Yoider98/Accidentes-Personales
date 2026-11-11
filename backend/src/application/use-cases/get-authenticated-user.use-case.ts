import { UserRepositoryPort } from '../ports/user.repository.port.js';
import { EntityNotFoundException, ValidationException } from '../../domain/exceptions/domain.exception.js';

export interface UserProfileOutput {
  id: string;
  email: string;
  fullName: string;
}

export class GetAuthenticatedUserUseCase {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  public async execute(userId: string): Promise<UserProfileOutput> {
    if (!userId || userId.trim() === '') {
      throw new ValidationException('Identificador de usuario no proporcionado.');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new EntityNotFoundException('Usuario', userId);
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName
    };
  }
}
