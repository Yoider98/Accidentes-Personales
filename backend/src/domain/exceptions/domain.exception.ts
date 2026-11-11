export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainException';
  }
}

export class InvalidAccidentStatusException extends DomainException {
  constructor(status: string) {
    super(`Estado de accidente inválido: '${status}'. Los estados permitidos son: 'Registrado', 'En revisión', 'Cerrado'.`);
    this.name = 'InvalidAccidentStatusException';
  }
}

export class InvalidStatusTransitionException extends DomainException {
  constructor(currentStatus: string, nextStatus: string) {
    super(`Transición de estado no permitida: de '${currentStatus}' a '${nextStatus}'.`);
    this.name = 'InvalidStatusTransitionException';
  }
}

export class UnauthorizedAccidentAccessException extends DomainException {
  constructor(accidentId: string) {
    super(`Acceso no autorizado al accidente con id '${accidentId}'.`);
    this.name = 'UnauthorizedAccidentAccessException';
  }
}

export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, id: string) {
    super(`${entityName} con id '${id}' no encontrado.`);
    this.name = 'EntityNotFoundException';
  }
}

export class UserAlreadyExistsException extends DomainException {
  constructor(email: string) {
    super(`Ya existe un usuario registrado con el correo: '${email}'.`);
    this.name = 'UserAlreadyExistsException';
  }
}

export class InvalidCredentialsException extends DomainException {
  constructor() {
    super('Credenciales inválidas. Correo o contraseña incorrectos.');
    this.name = 'InvalidCredentialsException';
  }
}

export class ValidationException extends DomainException {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationException';
  }
}

