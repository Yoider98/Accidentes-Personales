import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './postgres-pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations(): Promise<void> {
  const possiblePaths = [
    path.join(__dirname, 'migrations', '001_initial_schema.sql'),
    path.join(__dirname, '..', '..', '..', 'src', 'infrastructure', 'database', 'migrations', '001_initial_schema.sql'),
    path.join(process.cwd(), 'src', 'infrastructure', 'database', 'migrations', '001_initial_schema.sql'),
    path.join(process.cwd(), 'backend', 'src', 'infrastructure', 'database', 'migrations', '001_initial_schema.sql')
  ];

  const migrationPath = possiblePaths.find(p => fs.existsSync(p));
  if (!migrationPath) {
    throw new Error(`No se encontró el archivo de migración en ninguna de las rutas esperadas: \n${possiblePaths.join('\n')}`);
  }

  const sql = fs.readFileSync(migrationPath, 'utf-8');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('✓ Migraciones de PostgreSQL ejecutadas correctamente.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('✗ Error ejecutando migraciones:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Si se ejecuta directamente desde línea de comandos (ej. npm run migrate)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

