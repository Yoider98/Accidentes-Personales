import { pool } from '../database/postgres-pool.js';
import { Accident } from '../../domain/entities/accident.entity.js';
import { AccidentStatus } from '../../domain/value-objects/accident-status.vo.js';
import { AccidentRepositoryPort } from '../../application/ports/accident.repository.port.js';

export class PostgresAccidentRepository implements AccidentRepositoryPort {
  private mapRowToEntity(row: any): Accident {
    return new Accident({
      id: row.id,
      userId: row.user_id,
      affectedName: row.affected_name,
      affectedPhone: row.affected_phone,
      accidentType: row.accident_type,
      accidentDate: new Date(row.accident_date),
      location: row.location,
      description: row.description,
      status: new AccidentStatus(row.status),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    });
  }

  async save(accident: Accident): Promise<void> {
    const query = `
      INSERT INTO accidents (
        id, user_id, affected_name, affected_phone, accident_type,
        accident_date, location, description, status, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `;
    await pool.query(query, [
      accident.id,
      accident.userId,
      accident.affectedName,
      accident.affectedPhone,
      accident.accidentType,
      accident.accidentDate,
      accident.location,
      accident.description,
      accident.status.getValue(),
      accident.createdAt,
      accident.updatedAt
    ]);
  }

  async findById(id: string): Promise<Accident | null> {
    const query = `
      SELECT id, user_id, affected_name, affected_phone, accident_type,
             accident_date, location, description, status, created_at, updated_at
      FROM accidents
      WHERE id = $1
      LIMIT 1
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) return null;
    return this.mapRowToEntity(result.rows[0]);
  }

  async findByUserId(userId: string): Promise<Accident[]> {
    const query = `
      SELECT id, user_id, affected_name, affected_phone, accident_type,
             accident_date, location, description, status, created_at, updated_at
      FROM accidents
      WHERE user_id = $1
      ORDER BY accident_date DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows.map(row => this.mapRowToEntity(row));
  }

  /**
   * Consulta protegida para prevenir IDOR a nivel de base de datos.
   */
  async findUserAccidentById(userId: string, id: string): Promise<Accident | null> {
    const query = `
      SELECT id, user_id, affected_name, affected_phone, accident_type,
             accident_date, location, description, status, created_at, updated_at
      FROM accidents
      WHERE id = $1 AND user_id = $2
      LIMIT 1
    `;
    const result = await pool.query(query, [id, userId]);
    if (result.rows.length === 0) return null;
    return this.mapRowToEntity(result.rows[0]);
  }

  async update(accident: Accident): Promise<void> {
    const query = `
      UPDATE accidents
      SET
        affected_name = $1,
        affected_phone = $2,
        accident_type = $3,
        accident_date = $4,
        location = $5,
        description = $6,
        status = $7,
        updated_at = $8
      WHERE id = $9 AND user_id = $10
    `;
    await pool.query(query, [
      accident.affectedName,
      accident.affectedPhone,
      accident.accidentType,
      accident.accidentDate,
      accident.location,
      accident.description,
      accident.status.getValue(),
      accident.updatedAt,
      accident.id,
      accident.userId
    ]);
  }
}
