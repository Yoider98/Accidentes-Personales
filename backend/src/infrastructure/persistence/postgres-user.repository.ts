import { pool } from '../database/postgres-pool.js';
import { User } from '../../domain/entities/user.entity.js';
import { UserRepositoryPort } from '../../application/ports/user.repository.port.js';

export class PostgresUserRepository implements UserRepositoryPort {
  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, email, password_hash, full_name, created_at, updated_at
      FROM users
      WHERE email = $1
      LIMIT 1
    `;
    const result = await pool.query(query, [email.toLowerCase().trim()]);
    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return new User({
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      fullName: row.full_name,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }

  async findById(id: string): Promise<User | null> {
    const query = `
      SELECT id, email, password_hash, full_name, created_at, updated_at
      FROM users
      WHERE id = $1
      LIMIT 1
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return new User({
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      fullName: row.full_name,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }

  async save(user: User): Promise<void> {
    const query = `
      INSERT INTO users (id, email, password_hash, full_name, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        password_hash = EXCLUDED.password_hash,
        full_name = EXCLUDED.full_name,
        updated_at = EXCLUDED.updated_at
    `;
    await pool.query(query, [
      user.id,
      user.email,
      user.passwordHash,
      user.fullName,
      user.createdAt,
      user.updatedAt
    ]);
  }
}
