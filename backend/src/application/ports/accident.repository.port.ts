import { Accident } from '../../domain/entities/accident.entity.js';

export interface AccidentRepositoryPort {
  save(accident: Accident): Promise<void>;
  findById(id: string): Promise<Accident | null>;
  findByUserId(userId: string): Promise<Accident[]>;
  findUserAccidentById(userId: string, id: string): Promise<Accident | null>;
  update(accident: Accident): Promise<void>;
}

