import { describe, it, expect } from 'vitest';
import { Accident } from '../../../src/domain/entities/accident.entity.js';
import { ValidationException, UnauthorizedAccidentAccessException } from '../../../src/domain/exceptions/domain.exception.js';

describe('Accident Entity (Domain)', () => {
  const validProps = {
    id: 'acc-123',
    userId: 'user-001',
    affectedName: 'Juan Pérez',
    affectedPhone: '+573001234567',
    accidentType: 'Tránsito',
    accidentDate: new Date('2026-11-10T10:00:00Z'),
    location: 'Av. Principal #45-12',
    description: 'Caída de motocicleta al esquivar obstáculo en la vía.'
  };

  it('debe instanciar un accidente con estado inicial "Registrado"', () => {
    const accident = new Accident(validProps);

    expect(accident.id).toBe('acc-123');
    expect(accident.userId).toBe('user-001');
    expect(accident.status.getValue()).toBe('Registrado');
    expect(accident.affectedName).toBe('Juan Pérez');
  });

  it('debe fallar si faltan campos obligatorios', () => {
    expect(() => new Accident({ ...validProps, affectedName: '' })).toThrow(ValidationException);
    expect(() => new Accident({ ...validProps, description: '   ' })).toThrow(ValidationException);
    expect(() => new Accident({ ...validProps, userId: '' })).toThrow(ValidationException);
  });

  it('debe validar la pertenencia del accidente y mitigar accesos no autorizados (Anti-IDOR)', () => {
    const accident = new Accident(validProps);

    expect(accident.isOwnedBy('user-001')).toBe(true);
    expect(accident.isOwnedBy('user-otro')).toBe(false);

    expect(() => accident.assertOwnership('user-001')).not.toThrow();
    expect(() => accident.assertOwnership('user-malicioso')).toThrow(UnauthorizedAccidentAccessException);
  });
});

