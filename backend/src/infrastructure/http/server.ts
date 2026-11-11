import dotenv from 'dotenv';
import { createApp } from './app.js';
import { runMigrations } from '../database/migrator.js';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const JWT_SECRET = process.env.JWT_SECRET || '';

const FORBIDDEN_SECRETS = [
  'dev_fallback_secret_must_be_changed_in_prod',
  'ejemplo_clave_secreta_jwt_desarrollo_local_minimo_32_caracteres',
  'super_secret_jwt_key_for_development_only_min_32_chars',
  'secret',
  '123456'
];

function validateEnvironment(): void {
  if (NODE_ENV === 'production') {
    if (!JWT_SECRET || JWT_SECRET.length < 32) {
      throw new Error('[SEGURIDAD CRÍTICA] En producción, JWT_SECRET debe tener al menos 32 caracteres.');
    }
    if (FORBIDDEN_SECRETS.includes(JWT_SECRET)) {
      throw new Error('[SEGURIDAD CRÍTICA] En producción, JWT_SECRET no puede usar valores de ejemplo ni fallbacks.');
    }
  } else {
    if (!JWT_SECRET || JWT_SECRET.length < 16) {
      console.warn('⚠️ [ADVERTENCIA] JWT_SECRET es corto o inexistente. Configure una clave segura en su .env.');
    }
  }
}

async function bootstrap() {
  try {
    validateEnvironment();

    // Ejecución automática de migraciones para arranque limpio
    console.log('Verificando y aplicando migraciones de base de datos...');
    await runMigrations();

    const app = createApp();

    app.listen(PORT, () => {
      console.log(`✓ Servidor backend iniciado en http://localhost:${PORT}`);
      console.log(`✓ Healthcheck disponible en http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('✗ Fallo al iniciar el servidor backend:', error);
    process.exit(1);
  }
}

bootstrap();

