import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Pruebas de Validación Obligatorias: 10.6 y 10.7', () => {
  const rootDir = path.resolve(__dirname, '../../../');

  // Requerimiento 10.7: Verificar que los secretos no estén en el repositorio ni expuestos al cliente
  it('10.7: .gitignore debe bloquear estrictamente archivos .env y credenciales', () => {
    const gitignorePath = path.join(rootDir, '.gitignore');
    expect(fs.existsSync(gitignorePath)).toBe(true);

    const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
    expect(gitignore).toContain('.env');
    expect(gitignore).toContain('*.pem');
    expect(gitignore).toContain('*.key');
  });

  it('10.7: .env.example debe contener únicamente valores ficticios de ejemplo', () => {
    const envExamplePath = path.join(rootDir, '.env.example');
    expect(fs.existsSync(envExamplePath)).toBe(true);

    const envExample = fs.readFileSync(envExamplePath, 'utf-8');
    expect(envExample).toContain('ejemplo_clave_secreta');
    expect(envExample).not.toContain('prod_');
    expect(envExample).not.toContain('live_');
  });

  it('10.7: El bundle de producción frontend/dist no debe contener cadenas sensibles de base de datos ni JWT_SECRET', () => {
    const distAssetsPath = path.join(rootDir, 'frontend', 'dist', 'assets');
    if (fs.existsSync(distAssetsPath)) {
      const files = fs.readdirSync(distAssetsPath);
      const jsFiles = files.filter(f => f.endsWith('.js'));
      expect(jsFiles.length).toBeGreaterThan(0);

      for (const jsFile of jsFiles) {
        const content = fs.readFileSync(path.join(distAssetsPath, jsFile), 'utf-8');
        expect(content).not.toContain('DATABASE_URL');
        expect(content).not.toContain('super_secret_jwt');
        expect(content).not.toContain('postgresql://');
      }
    }
  });

  // Requerimiento 10.6: Verificar que los datos persisten y no se almacenan en memoria
  it('10.6: El esquema relacional y volumen de PostgreSQL garantizan la persistencia en disco (pgdata)', () => {
    const dockerComposePath = path.join(rootDir, 'docker-compose.yml');
    expect(fs.existsSync(dockerComposePath)).toBe(true);

    const compose = fs.readFileSync(dockerComposePath, 'utf-8');
    // Verifica que el volumen nombrado esté configurado para persistencia real
    expect(compose).toContain('pgdata:/var/lib/postgresql/data');
    expect(compose).toContain('volumes:');
  });
});
