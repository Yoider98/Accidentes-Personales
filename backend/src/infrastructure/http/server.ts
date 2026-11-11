import dotenv from 'dotenv';
import { createApp } from './app.js';
import { runMigrations } from '../database/migrator.js';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

async function bootstrap() {
  try {
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

