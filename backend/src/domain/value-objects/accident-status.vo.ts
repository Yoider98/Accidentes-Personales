import { InvalidAccidentStatusException, InvalidStatusTransitionException } from '../exceptions/domain.exception.js';

export type ValidAccidentStatus = 'Registrado' | 'En revisión' | 'Cerrado';

export class AccidentStatus {
  private static readonly VALID_STATUSES: ValidAccidentStatus[] = [
    'Registrado',
    'En revisión',
    'Cerrado'
  ];

  private readonly value: ValidAccidentStatus;

  constructor(value: string) {
    if (!AccidentStatus.isValid(value)) {
      throw new InvalidAccidentStatusException(value);
    }
    this.value = value as ValidAccidentStatus;
  }

  public static isValid(value: string): boolean {
    return this.VALID_STATUSES.includes(value as ValidAccidentStatus);
  }

  public static registered(): AccidentStatus {
    return new AccidentStatus('Registrado');
  }

  public static inReview(): AccidentStatus {
    return new AccidentStatus('En revisión');
  }

  public static closed(): AccidentStatus {
    return new AccidentStatus('Cerrado');
  }

  public getValue(): ValidAccidentStatus {
    return this.value;
  }

  public canTransitionTo(nextStatus: AccidentStatus): boolean {
    const current = this.value;
    const next = nextStatus.getValue();

    if (current === next) return true;

    if (current === 'Registrado') {
      return next === 'En revisión';
    }

    if (current === 'En revisión') {
      return next === 'Cerrado' || next === 'Registrado';
    }

    if (current === 'Cerrado') {
      return false; // Una vez cerrado es estado terminal
    }

    return false;
  }

  public transitionTo(nextStatus: AccidentStatus): AccidentStatus {
    if (!this.canTransitionTo(nextStatus)) {
      throw new InvalidStatusTransitionException(this.value, nextStatus.getValue());
    }
    return nextStatus;
  }

  public equals(other: AccidentStatus): boolean {
    return this.value === other.getValue();
  }

  public toString(): string {
    return this.value;
  }
}

