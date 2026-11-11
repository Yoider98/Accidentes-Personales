import { AccidentStatus } from '../../domain/value-objects/accident-status.vo.js';
import { AccidentRepositoryPort } from '../ports/accident.repository.port.js';
import { EntityNotFoundException, ValidationException } from '../../domain/exceptions/domain.exception.js';

export class UpdateAccidentStatusUseCase {
  constructor(private readonly accidentRepository: AccidentRepositoryPort) {}

  public async execute(authenticatedUserId: string, accidentId: string, newStatusStr: string) {
    if (!authenticatedUserId || !accidentId || !newStatusStr) {
      throw new ValidationException('Parámetros incompletos para la actualización de estado.');
    }

    const accident = await this.accidentRepository.findById(accidentId);
    if (!accident) {
      throw new EntityNotFoundException('Accidente', accidentId);
    }

    // Validación de pertenencia
    accident.assertOwnership(authenticatedUserId);

    // Validación de transición de estado en el modelo de dominio
    const nextStatus = new AccidentStatus(newStatusStr);
    accident.changeStatus(nextStatus);

    await this.accidentRepository.update(accident);

    return accident.toJSON();
  }
}

