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

    // Consulta protegida Anti-IDOR: Si no pertenece al usuario autenticado, responde 404
    // para evitar la confirmación de existencia y enumeración de registros de terceros.
    const accident = await this.accidentRepository.findUserAccidentById(authenticatedUserId, accidentId);
    if (!accident) {
      throw new EntityNotFoundException('Accidente', accidentId);
    }

    return accident.toJSON();
  }
}

