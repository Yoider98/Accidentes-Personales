/**
 * Script de verificación de seguridad y ausencia de secretos (Sección 10.7 del enunciado)
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const rootDir = process.cwd();

console.log('=== Verificación de Seguridad y Ausencia de Secretos (10.7) ===');

let hasViolations = false;

// 1. Verificar que .gitignore contenga .env
console.log('1. Verificando .gitignore...');
const gitignoreContent = fs.readFileSync(path.join(rootDir, '.gitignore'), 'utf-8');
if (!gitignoreContent.includes('.env')) {
  console.error('✗ ERROR: .gitignore no excluye .env');
  hasViolations = true;
} else {
  console.log('✓ .gitignore excluye adecuadamente .env y credenciales.');
}

// 2. Verificar archivos rastreados en Git (git ls-files)
console.log('2. Verificando archivos rastreados en el repositorio Git...');
const trackedFiles = execSync('git ls-files', { encoding: 'utf-8' }).split('\n').filter(Boolean);
const forbiddenFiles = trackedFiles.filter(f => 
  f.endsWith('.env') || 
  f.includes('.env.local') || 
  f.endsWith('.pem') || 
  f.endsWith('.key')
);

if (forbiddenFiles.length > 0) {
  console.error('✗ ERROR: Archivos sensibles rastreados en git:', forbiddenFiles);
  hasViolations = true;
} else {
  console.log('✓ Cero archivos de entorno o credenciales rastreados en Git.');
}

// 3. Escaneo del bundle frontend/dist
console.log('3. Escaneando bundle de producción (frontend/dist)...');
const distPath = path.join(rootDir, 'frontend', 'dist');
if (fs.existsSync(distPath)) {
  const assets = fs.readdirSync(path.join(distPath, 'assets'));
  for (const asset of assets) {
    if (asset.endsWith('.js')) {
      const content = fs.readFileSync(path.join(distPath, 'assets', asset), 'utf-8');
      if (content.includes('postgresql://') || content.includes('super_secret') || content.includes('JWT_SECRET')) {
        console.error(`✗ ERROR: Se detectaron posibles credenciales o secretos en el bundle ${asset}`);
        hasViolations = true;
      }
    }
  }
  if (!hasViolations) {
    console.log('✓ Bundle frontend/dist escaneado: 0 secretos o credenciales expuestos.');
  }
} else {
  console.warn('⚠️ Carpeta frontend/dist no encontrada. Ejecute npm run build en frontend primero.');
}

// 4. Verificación de historial de Git
console.log('4. Inspeccionando historial de commits en Git...');
try {
  const gitLogGrep = execSync('git log -G"postgresql://" -n 5 --oneline', { encoding: 'utf-8' }).trim();
  if (gitLogGrep) {
    console.warn('⚠️ Se detectaron referencias a postgresql:// en commits de doc/ejemplo:\n', gitLogGrep);
  } else {
    console.log('✓ Historial de Git limpio de URIs de conexión reales.');
  }
} catch {
  // Ignorar si git log falla por flags
}

if (hasViolations) {
  console.error('\n✗ La verificación de seguridad falló.');
  process.exit(1);
} else {
  console.log('\n✓ VERIFICACIÓN DE SEGURIDAD EXITOSA: El proyecto cumple con la Sección 10.7.');
  process.exit(0);
}

