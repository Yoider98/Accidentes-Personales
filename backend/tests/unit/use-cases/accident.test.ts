import { describe, it, expect, beforeEach } from 'vitest';
import { Accident } from '../../../src/domain/entities/accident.entity.js';
import { User } from '../../../src/domain/entities/user.entity.js';
import { AccidentRepositoryPort } from '../../../src/application/ports/accident.repository.port.js';
import { UserRepositoryPort } from '../../../src/application/ports/user.repository.port.js';
import { RegisterAccidentUseCase } from '../../../src/application/use-cases/register-accident.use-case.js';
import { ListUserAccidentsUseCase } from '../../../src/application/use-cases/list-user-accidents.use-case.js';
import { GetAccidentDetailUseCase } from '../../../src/application/use-cases/get-accident-detail.use-case.js';
import { UpdateAccidentStatusUseCase } from '../../../src/application/use-cases/update-accident-status.use-case.js';
import { UnauthorizedAccidentAccessException, InvalidStatusTransitionException } from '../../../src/domain/exceptions/domain.exception.js';

class InMemoryAccidentRepository implements AccidentRepositoryPort {
  private accidents: Map<string, Accident> = new Map();

  async save(accident: Accident): Promise<void> {
    this.accidents.set(accident.id, accident);
  }

  async findById(id: string): Promise<Accident | null> {
    return this.accidents.get(id) || null;
  }

  async findByUserId(userId: string): Promise<Accident[]> {
    const result: Accident[] = [];
    for (const acc of this.accidents.values()) {
      if (acc.userId === userId) {
        result.push(acc);
      }
    }
    return result;
  }

  async findUserAccidentById(userId: string, id: string): Promise<Accident | null> {
    const acc = this.accidents.get(id);
    if (acc && acc.userId === userId) {
      return acc;
    }
    return null;
  }

  async update(accident: Accident): Promise<void> {
    this.accidents.set(accident.id, accident);
  }
}

class InMemoryUserRepository implements UserRepositoryPort {
  private users: Map<string, User> = new Map();

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }
}

describe('Casos de Uso de Accidentes y Blindaje Anti-IDOR', () => {
  let accidentRepo: InMemoryAccidentRepository;
  let userRepo: InMemoryUserRepository;
  let registerAccident: RegisterAccidentUseCase;
  let listAccidents: ListUserAccidentsUseCase;
  let getDetail: GetAccidentDetailUseCase;
  let updateStatus: UpdateAccidentStatusUseCase;

  const userAId = 'user-uuid-A';
  const userBId = 'user-uuid-B';

  beforeEach(async () => {
    accidentRepo = new InMemoryAccidentRepository();
    userRepo = new InMemoryUserRepository();

    await userRepo.save(new User({
      id: userAId,
      email: 'usera@test.com',
      passwordHash: 'hashA',
      fullName: 'Usuario A'
    }));

    await userRepo.save(new User({
      id: userBId,
      email: 'userb@test.com',
      passwordHash: 'hashB',
      fullName: 'Usuario B'
    }));

    registerAccident = new RegisterAccidentUseCase(accidentRepo, userRepo);
    listAccidents = new ListUserAccidentsUseCase(accidentRepo);
    getDetail = new GetAccidentDetailUseCase(accidentRepo);
    updateStatus = new UpdateAccidentStatusUseCase(accidentRepo);
  });

  it('debe registrar un accidente vinculándolo obligatoriamente al usuario autenticado', async () => {
    const accident = await registerAccident.execute(userAId, {
      affectedName: 'Familiar de A',
      affectedPhone: '3109999999',
      accidentType: 'Hogar',
      accidentDate: '2026-11-10T14:30:00Z',
      location: 'Cocina',
      description: 'Quemadura leve con agua caliente.'
    });

    expect(accident.id).toBeDefined();
    expect(accident.userId).toBe(userAId);
    expect(accident.status).toBe('Registrado');
  });

  it('debe listar únicamente los accidentes correspondientes a la cuenta autenticada', async () => {
    // Registrar 2 accidentes para Usuario A
    await registerAccident.execute(userAId, {
      affectedName: 'A1',
      affectedPhone: '111',
      accidentType: 'Laboral',
      accidentDate: '2026-11-08T10:00:00Z',
      location: 'Oficina',
      description: 'Caída de silla'
    });
    await registerAccident.execute(userAId, {
      affectedName: 'A2',
      affectedPhone: '222',
      accidentType: 'Tránsito',
      accidentDate: '2026-11-09T10:00:00Z',
      location: 'Calle 100',
      description: 'Golpe lateral'
    });

    // Registrar 1 accidente para Usuario B
    await registerAccident.execute(userBId, {
      affectedName: 'B1',
      affectedPhone: '333',
      accidentType: 'Deporte',
      accidentDate: '2026-11-10T10:00:00Z',
      location: 'Cancha',
      description: 'Esguince de tobillo'
    });

    const accidentsA = await listAccidents.execute(userAId);
    const accidentsB = await listAccidents.execute(userBId);

    expect(accidentsA.length).toBe(2);
    expect(accidentsA.every(acc => acc.userId === userAId)).toBe(true);

    expect(accidentsB.length).toBe(1);
    expect(accidentsB[0].userId).toBe(userBId);
  });

  it('PRUEBA CRÍTICA DE SEGURIDAD (ANTI-IDOR): Usuario B no debe poder acceder al detalle del accidente de Usuario A', async () => {
    const accA = await registerAccident.execute(userAId, {
      affectedName: 'Secreto Médico A',
      affectedPhone: '55555',
      accidentType: 'Tránsito',
      accidentDate: '2026-11-10T10:00:00Z',
      location: 'Autopista',
      description: 'Detalles confidenciales del accidente de A'
    });

    // Usuario A consulta su propio accidente: DEBE FUNCIONAR
    const detailA = await getDetail.execute(userAId, accA.id);
    expect(detailA.id).toBe(accA.id);

    // Usuario B intenta consultar el accidente de Usuario A alterando el ID: DEBE SER RECHAZADO
    await expect(
      getDetail.execute(userBId, accA.id)
    ).rejects.toThrow(UnauthorizedAccidentAccessException);
  });

  it('debe validar la transición de estados en el backend', async () => {
    const acc = await registerAccident.execute(userAId, {
      affectedName: 'Afectado',
      affectedPhone: '555',
      accidentType: 'Tránsito',
      accidentDate: '2026-11-10T10:00:00Z',
      location: 'Calle 50',
      description: 'Colisión'
    });

    expect(acc.status).toBe('Registrado');

    // Transición válida: Registrado -> En revisión
    const updated1 = await updateStatus.execute(userAId, acc.id, 'En revisión');
    expect(updated1.status).toBe('En revisión');

    // Transición válida: En revisión -> Cerrado
    const updated2 = await updateStatus.execute(userAId, acc.id, 'Cerrado');
    expect(updated2.status).toBe('Cerrado');

    // Transición inválida: Cerrado -> Registrado (Debe fallar)
    await expect(
      updateStatus.execute(userAId, acc.id, 'Registrado')
    ).rejects.toThrow(InvalidStatusTransitionException);
  });
});

