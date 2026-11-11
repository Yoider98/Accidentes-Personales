import { ValidationException } from '../exceptions/domain.exception.js';

export interface UserProps {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  private readonly _id: string;
  private readonly _email: string;
  private readonly _passwordHash: string;
  private readonly _fullName: string;
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;

  constructor(props: UserProps) {
    if (!props.id || props.id.trim() === '') {
      throw new ValidationException('El ID del usuario es obligatorio.');
    }
    if (!props.email || !props.email.includes('@')) {
      throw new ValidationException('El correo electrónico es inválido.');
    }
    if (!props.passwordHash || props.passwordHash.trim() === '') {
      throw new ValidationException('El hash de contraseña es obligatorio.');
    }
    if (!props.fullName || props.fullName.trim() === '') {
      throw new ValidationException('El nombre completo es obligatorio.');
    }

    this._id = props.id;
    this._email = props.email.toLowerCase().trim();
    this._passwordHash = props.passwordHash;
    this._fullName = props.fullName.trim();
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  public get id(): string {
    return this._id;
  }

  public get email(): string {
    return this._email;
  }

  public get passwordHash(): string {
    return this._passwordHash;
  }

  public get fullName(): string {
    return this._fullName;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public toJSON() {
    return {
      id: this._id,
      email: this._email,
      fullName: this._fullName,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };
  }
}

