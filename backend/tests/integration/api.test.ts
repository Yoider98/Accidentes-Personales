import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createApp } from '../../src/infrastructure/http/app.js';
import { UserRepositoryPort } from '../../src/application/ports/user.repository.port.js';
import { AccidentRepositoryPort } from '../../src/application/ports/accident.repository.port.js';
import { PasswordHasherPort } from '../../src/application/ports/password-hasher.port.js';
import { TokenServicePort, TokenPayload } from '../../src/application/ports/token-service.port.js';
import { User } from '../../src/domain/entities/user.entity.js';
import { Accident } from '../../src/domain/entities/accident.entity.js';
import { Server } from 'node:http';

class MockUserRepository implements UserRepositoryPort {
  private users: Map<string, User> = new Map();

  async findByEmail(email: string): Promise<User | null> {
    for (const u of this.users.values()) {
      if (u.email === email) return u;
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

class MockAccidentRepository implements AccidentRepositoryPort {
  private accidents: Map<string, Accident> = new Map();

  async save(accident: Accident): Promise<void> {
    this.accidents.set(accident.id, accident);
  }
  async findById(id: string): Promise<Accident | null> {
    return this.accidents.get(id) || null;
  }
  async findByUserId(userId: string): Promise<Accident[]> {
    const list: Accident[] = [];
    for (const a of this.accidents.values()) {
      if (a.userId === userId) list.push(a);
    }
    return list;
  }
  async findUserAccidentById(userId: string, id: string): Promise<Accident | null> {
    const acc = this.accidents.get(id);
    if (acc && acc.userId === userId) return acc;
    return null;
  }
  async update(accident: Accident): Promise<void> {
    this.accidents.set(accident.id, accident);
  }
}

class MockPasswordHasher implements PasswordHasherPort {
  async hash(password: string): Promise<string> {
    return `hash_${password}`;
  }
  async compare(password: string, hash: string): Promise<boolean> {
    return hash === `hash_${password}`;
  }
}

class MockTokenService implements TokenServicePort {
  generateToken(payload: TokenPayload): string {
    return `token_for_${payload.userId}`;
  }
  verifyToken(token: string): TokenPayload {
    if (!token.startsWith('token_for_')) {
      throw new Error('Token inválido');
    }
    const userId = token.replace('token_for_', '');
    return { userId, email: `${userId}@test.com` };
  }
}

describe('Pruebas de Integración HTTP y Validación de Requerimientos Obligatorios', () => {
  let server: Server;
  let baseUrl: string;
  let userRepo: MockUserRepository;
  let accidentRepo: MockAccidentRepository;

  beforeAll(async () => {
    userRepo = new MockUserRepository();
    accidentRepo = new MockAccidentRepository();
    const app = createApp({
      userRepository: userRepo,
      accidentRepository: accidentRepo,
      passwordHasher: new MockPasswordHasher(),
      tokenService: new MockTokenService()
    });

    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server.address() as any;
        baseUrl = `http://localhost:${addr.port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  // Requerimiento 10.1: Registrar un accidente sin campos obligatorios
  it('10.1: Debe rechazar el registro de un accidente sin campos obligatorios (400)', async () => {
    // Primero crear un usuario para tener token
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Usuario Pruebas',
        email: 'user1@test.com',
        password: 'password123'
      })
    });
    const regData = await regRes.json() as any;
    const token = regData.token;

    // Intentar registrar sin datos requeridos
    const res = await fetch(`${baseUrl}/api/accidents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        affectedName: ''
      })
    });

    expect(res.status).toBe(400);
    const body = await res.json() as any;
    expect(body.error).toBe('Error de validación');
  });

  // Requerimiento 10.2: Consultar accidentes sin autenticarse
  it('10.2: Debe rechazar la consulta de accidentes sin autenticarse (401)', async () => {
    const res = await fetch(`${baseUrl}/api/accidents`);
    expect(res.status).toBe(401);
    const body = await res.json() as any;
    expect(body.error).toBe('No autorizado');
  });

  // Requerimiento 10.3: Consultar un accidente de otro usuario alterando el identificador (CRÍTICO IDOR)
  it('10.3 [CRÍTICO IDOR]: Debe impedir que un usuario consulte el accidente de otro alterando el ID (403)', async () => {
    // 1. Crear Usuario A y registrar un accidente
    const regA = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Usuario A',
        email: 'victima_a@test.com',
        password: 'password123'
      })
    });
    const tokenA = (await regA.json() as any).token;

    const createAccidentRes = await fetch(`${baseUrl}/api/accidents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        affectedName: 'Víctima A',
        affectedPhone: '3001234567',
        accidentType: 'Laboral',
        accidentDate: '2026-11-10T10:00:00Z',
        location: 'Bodega 3',
        description: 'Caída de estante con mercancía pesada'
      })
    });
    const accidentA = await createAccidentRes.json() as any;
    const accidentIdA = accidentA.id;

    // 2. Crear Usuario B (Atacante)
    const regB = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Usuario B Atacante',
        email: 'atacante_b@test.com',
        password: 'password123'
      })
    });
    const tokenB = (await regB.json() as any).token;

    // 3. Usuario B intenta leer el accidente del Usuario A alterando el ID en la URL
    const idorAttemptRes = await fetch(`${baseUrl}/api/accidents/${accidentIdA}`, {
      headers: {
        Authorization: `Bearer ${tokenB}`
      }
    });

    expect(idorAttemptRes.status).toBe(403);
    const body = await idorAttemptRes.json() as any;
    expect(body.error).toBe('Acceso denegado');
  });

  // Requerimiento 10.4: Enviar datos inválidos al backend
  it('10.4: Debe rechazar datos inválidos en login o creación (400)', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'no-es-un-email',
        password: ''
      })
    });

    expect(res.status).toBe(400);
    const body = await res.json() as any;
    expect(body.error).toBe('Error de validación');
  });

  // Requerimiento 10.5: Consultar con una cuenta sin accidentes
  it('10.5: Debe retornar una lista vacía para una cuenta sin accidentes (200 con [])', async () => {
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Usuario Nuevo',
        email: 'nuevo_sin_accidentes@test.com',
        password: 'password123'
      })
    });
    const token = (await regRes.json() as any).token;

    const res = await fetch(`${baseUrl}/api/accidents`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    expect(res.status).toBe(200);
    const list = await res.json() as any[];
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBe(0);
  });
});
