import { AccidentRepositoryPort } from '../ports/accident.repository.port.js';
import { ValidationException } from '../../domain/exceptions/domain.exception.js';

export class ListUserAccidentsUseCase {
  constructor(private readonly accidentRepository: AccidentRepositoryPort) {}

  /**
   * Consulta únicamente los accidentes asociados a la cuenta autenticada.
   */
  public async execute(authenticatedUserId: string) {
    if (!authenticatedUserId || authenticatedUserId.trim() === '') {
      throw new ValidationException('Identificador de usuario no proporcionado.');
    }

    const accidents = await this.accidentRepository.findByUserId(authenticatedUserId);

    // Mapea y ordena de más reciente a más antiguo
    return accidents
      .map(accident => accident.toJSON())
      .sort((a, b) => new Date(b.accidentDate).getTime() - new Date(a.accidentDate).getTime());
  }
}

