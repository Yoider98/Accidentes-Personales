import { Accident } from '../../domain/entities/accident.entity.js';
import { AccidentStatus } from '../../domain/value-objects/accident-status.vo.js';
import { AccidentRepositoryPort } from '../ports/accident.repository.port.js';
import { UserRepositoryPort } from '../ports/user.repository.port.js';
import { EntityNotFoundException, ValidationException } from '../../domain/exceptions/domain.exception.js';
import crypto from 'node:crypto';

export interface RegisterAccidentInput {
  affectedName: string;
  affectedPhone: string;
  accidentType: string;
  accidentDate: string | Date;
  location: string;
  description: string;
}

export class RegisterAccidentUseCase {
  constructor(
    private readonly accidentRepository: AccidentRepositoryPort,
    private readonly userRepository: UserRepositoryPort
  ) {}

  /**
   * Registra un accidente vinculándolo exclusivamente a la identidad autenticada.
   * Regla del caso: El accidente se asocia con la identidad verificada en el servidor,
   * nunca con datos enviados por el cliente.
   */
  public async execute(authenticatedUserId: string, input: RegisterAccidentInput) {
    if (!authenticatedUserId || authenticatedUserId.trim() === '') {
      throw new ValidationException('Usuario autenticado no identificado.');
    }

    const user = await this.userRepository.findById(authenticatedUserId);
    if (!user) {
      throw new EntityNotFoundException('Usuario', authenticatedUserId);
    }

    const parsedDate = input.accidentDate instanceof Date ? input.accidentDate : new Date(input.accidentDate);
    if (isNaN(parsedDate.getTime())) {
      throw new ValidationException('La fecha del accidente no es válida.');
    }

    const accidentId = crypto.randomUUID();

    const accident = new Accident({
      id: accidentId,
      userId: authenticatedUserId, // Forzado desde el token verificado
      affectedName: input.affectedName,
      affectedPhone: input.affectedPhone,
      accidentType: input.accidentType,
      accidentDate: parsedDate,
      location: input.location,
      description: input.description,
      status: AccidentStatus.registered()
    });

    await this.accidentRepository.save(accident);

    return accident.toJSON();
  }
}

