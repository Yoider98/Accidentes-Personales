import { describe, it, expect } from 'vitest';
import { AccidentStatus } from '../../../src/domain/value-objects/accident-status.vo.js';
import { InvalidAccidentStatusException, InvalidStatusTransitionException } from '../../../src/domain/exceptions/domain.exception.js';

describe('AccidentStatus Value Object', () => {
  it('debe crear estados válidos correctamente', () => {
    const status1 = new AccidentStatus('Registrado');
    const status2 = new AccidentStatus('En revisión');
    const status3 = new AccidentStatus('Cerrado');

    expect(status1.getValue()).toBe('Registrado');
    expect(status2.getValue()).toBe('En revisión');
    expect(status3.getValue()).toBe('Cerrado');
  });

  it('debe lanzar InvalidAccidentStatusException con un estado inválido', () => {
    expect(() => new AccidentStatus('EstadoInexistente')).toThrow(InvalidAccidentStatusException);
  });

  it('debe permitir transiciones válidas: Registrado -> En revisión -> Cerrado', () => {
    const registrado = AccidentStatus.registered();
    const enRevision = AccidentStatus.inReview();
    const cerrado = AccidentStatus.closed();

    expect(registrado.canTransitionTo(enRevision)).toBe(true);
    expect(enRevision.canTransitionTo(cerrado)).toBe(true);

    const result = registrado.transitionTo(enRevision);
    expect(result.getValue()).toBe('En revisión');
  });

  it('debe rechazar transiciones inválidas: Cerrado -> Registrado', () => {
    const cerrado = AccidentStatus.closed();
    const registrado = AccidentStatus.registered();

    expect(cerrado.canTransitionTo(registrado)).toBe(false);
    expect(() => cerrado.transitionTo(registrado)).toThrow(InvalidStatusTransitionException);
  });
});

