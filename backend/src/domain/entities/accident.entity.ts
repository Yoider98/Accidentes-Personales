import { AccidentStatus } from '../value-objects/accident-status.vo.js';
import { ValidationException, UnauthorizedAccidentAccessException } from '../exceptions/domain.exception.js';

export interface AccidentProps {
  id: string;
  userId: string;
  affectedName: string;
  affectedPhone: string;
  accidentType: string;
  accidentDate: Date;
  location: string;
  description: string;
  status?: AccidentStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Accident {
  private readonly _id: string;
  private readonly _userId: string;
  private readonly _affectedName: string;
  private readonly _affectedPhone: string;
  private readonly _accidentType: string;
  private readonly _accidentDate: Date;
  private readonly _location: string;
  private readonly _description: string;
  private _status: AccidentStatus;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: AccidentProps) {
    if (!props.id || props.id.trim() === '') {
      throw new ValidationException('El ID del accidente es obligatorio.');
    }
    if (!props.userId || props.userId.trim() === '') {
      throw new ValidationException('El ID del usuario propietario es obligatorio.');
    }
    if (!props.affectedName || props.affectedName.trim() === '') {
      throw new ValidationException('El nombre del afectado es obligatorio.');
    }
    if (!props.affectedPhone || props.affectedPhone.trim() === '') {
      throw new ValidationException('El teléfono de contacto es obligatorio.');
    }
    if (!props.accidentType || props.accidentType.trim() === '') {
      throw new ValidationException('El tipo de accidente es obligatorio.');
    }
    if (!props.accidentDate || isNaN(props.accidentDate.getTime())) {
      throw new ValidationException('La fecha del accidente es obligatoria y debe ser válida.');
    }
    if (!props.location || props.location.trim() === '') {
      throw new ValidationException('El lugar del accidente es obligatorio.');
    }
    if (!props.description || props.description.trim() === '') {
      throw new ValidationException('La descripción del accidente es obligatoria.');
    }

    this._id = props.id;
    this._userId = props.userId;
    this._affectedName = props.affectedName.trim();
    this._affectedPhone = props.affectedPhone.trim();
    this._accidentType = props.accidentType.trim();
    this._accidentDate = props.accidentDate;
    this._location = props.location.trim();
    this._description = props.description.trim();
    this._status = props.status || AccidentStatus.registered();
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  public get id(): string {
    return this._id;
  }

  public get userId(): string {
    return this._userId;
  }

  public get affectedName(): string {
    return this._affectedName;
  }

  public get affectedPhone(): string {
    return this._affectedPhone;
  }

  public get accidentType(): string {
    return this._accidentType;
  }

  public get accidentDate(): Date {
    return this._accidentDate;
  }

  public get location(): string {
    return this._location;
  }

  public get description(): string {
    return this._description;
  }

  public get status(): AccidentStatus {
    return this._status;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Regla de Negocio Anti-IDOR:
   * Verifica si el accidente pertenece al usuario proporcionado.
   */
  public isOwnedBy(userId: string): boolean {
    return this._userId === userId;
  }

  /**
   * Asegura que el usuario autenticado sea el dueño antes de acceder.
   */
  public assertOwnership(userId: string): void {
    if (!this.isOwnedBy(userId)) {
      throw new UnauthorizedAccidentAccessException(this._id);
    }
  }

  /**
   * Ejecuta la transición de estado validada por el Value Object de dominio.
   */
  public changeStatus(nextStatus: AccidentStatus): void {
    this._status = this._status.transitionTo(nextStatus);
    this._updatedAt = new Date();
  }

  public toJSON() {
    return {
      id: this._id,
      userId: this._userId,
      affectedName: this._affectedName,
      affectedPhone: this._affectedPhone,
      accidentType: this._accidentType,
      accidentDate: this._accidentDate.toISOString(),
      location: this._location,
      description: this._description,
      status: this._status.getValue(),
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString()
    };
  }
}

