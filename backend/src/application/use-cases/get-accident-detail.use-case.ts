import { AccidentRepositoryPort } from '../ports/accident.repository.port.js';
import { EntityNotFoundException, ValidationException } from '../../domain/exceptions/domain.exception.js';

export class GetAccidentDetailUseCase {
  constructor(private readonly accidentRepository: AccidentRepositoryPort) {}

  /**
   * Obtiene el detalle de un accidente garantizando el control de acceso estricto.
   * Requisito crítico: Un usuario no puede consultar datos de otra persona,
   * aunque conozca o modifique el identificador enviado en la URL o petición.
   */
  public async execute(authenticatedUserId: string, accidentId: string) {
    if (!authenticatedUserId || authenticatedUserId.trim() === '') {
      throw new ValidationException('Identificador de usuario no proporcionado.');
    }
    if (!accidentId || accidentId.trim() === '') {
      throw new ValidationException('Identificador de accidente no proporcionado.');
    }

    const accident = await this.accidentRepository.findById(accidentId);
    if (!accident) {
      throw new EntityNotFoundException('Accidente', accidentId);
    }

    // Validación Anti-IDOR en el dominio
    accident.assertOwnership(authenticatedUserId);

    return accident.toJSON();
  }
}

