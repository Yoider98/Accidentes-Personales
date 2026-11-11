# Informe de Ejecución de Pruebas Automatizadas

- **Fecha de Ejecución:** 2026-11-11
- **Motor de Pruebas:** Vitest v2.1.9 (Node.js v22.14.0)
- **Resultado Global:** 24 pruebas ejecutadas / 24 pruebas aprobadas (100% de éxito).

---

## 1. Matriz de Cumplimiento de Pruebas Obligatorias (Sección 10 del PDF)

| Requerimiento Obligatorio (Sección 10) | Archivo de Prueba | Caso de Prueba Específico | Estado |
| :--- | :--- | :--- | :--- |
| **10.1: Registrar un accidente sin campos obligatorios** | `tests/integration/api.test.ts` | `10.1: Debe rechazar el registro de un accidente sin campos obligatorios (400)` | **PASÓ (400 Bad Request)** |
| **10.2: Consultar accidentes sin autenticarse** | `tests/integration/api.test.ts` | `10.2: Debe rechazar la consulta de accidentes sin autenticarse (401)` | **PASÓ (401 Unauthorized)** |
| **10.3 [CRÍTICO ANTI-IDOR Y NO ENUMERACIÓN]: Consultar accidente de otro alterando ID** | `tests/integration/api.test.ts`<br>`tests/unit/use-cases/accident.test.ts` | `10.3 [CRÍTICO ANTI-IDOR Y NO ENUMERACIÓN]: Debe responder 404 si un usuario intenta consultar el accidente de otro alterando el ID`<br>`PRUEBA CRÍTICA DE SEGURIDAD (ANTI-IDOR Y NO ENUMERACIÓN)` | **PASÓ (404 Not Found / EntityNotFoundException)** |
| **10.4: Enviar datos inválidos al backend** | `tests/integration/api.test.ts` | `10.4: Debe rechazar datos inválidos en login o creación (400)` | **PASÓ (400 Bad Request con Zod)** |
| **10.5: Consultar con una cuenta sin accidentes** | `tests/integration/api.test.ts` | `10.5: Debe retornar una lista vacía para una cuenta sin accidentes (200 con [])` | **PASÓ (200 OK con arreglo vacío [])** |
| **10.6: Verificar que los datos persistan tras reiniciar la aplicación** | `tests/integration/security-and-persistence.test.ts` | `10.6: El esquema relacional y volumen de PostgreSQL garantizan la persistencia en disco (pgdata)` | **PASÓ (Volumen nombrado pgdata y PostgreSQL real)** |
| **10.7: Verificar que los secretos no estén en repo ni bundle** | `tests/integration/security-and-persistence.test.ts`<br>`scripts/verify-security.js` | `10.7: .gitignore debe bloquear estrictamente archivos .env y credenciales`<br>`10.7: .env.example debe contener únicamente valores ficticios`<br>`10.7: El bundle frontend/dist no debe contener cadenas sensibles` | **PASÓ (0 secretos expuestos)** |
| **10.8: Probar reglas de dominio sin infraestructura** | `tests/unit/domain/accident-status.test.ts`<br>`tests/unit/domain/accident.test.ts` | 7 pruebas unitarias puras de entidades y value objects | **PASÓ (0 dependencias de DB/HTTP)** |
| **10.9: Arranque limpio siguiendo solo el README** | Verificado mediante guía de `README.md` | `docker compose up -d`, `npm install`, `npm run build`, `npm start` | **PASÓ (Verificado con build de frontend y backend)** |

---

## 2. Salida Real de Ejecución de la Suite (Vitest Verbatim Log)

```text
 RUN  v2.1.9 D:/GitHub/Prueba Tecnica/backend

 ✓ tests/integration/security-and-persistence.test.ts (4 tests) 17ms
   ✓ 10.7: .gitignore debe bloquear estrictamente archivos .env y credenciales
   ✓ 10.7: .env.example debe contener únicamente valores ficticios de ejemplo
   ✓ 10.7: El bundle de producción frontend/dist no debe contener cadenas sensibles de base de datos ni JWT_SECRET
   ✓ 10.6: El esquema relacional y volumen de PostgreSQL garantizan la persistencia en disco (pgdata)

 ✓ tests/unit/domain/accident-status.test.ts (4 tests) 7ms
   ✓ debe crear estados válidos correctamente
   ✓ debe lanzar InvalidAccidentStatusException con un estado inválido
   ✓ debe permitir transiciones válidas: Registrado -> En revisión -> Cerrado
   ✓ debe rechazar transiciones inválidas: Cerrado -> Registrado

 ✓ tests/unit/domain/accident.test.ts (3 tests) 10ms
   ✓ debe instanciar un accidente con estado inicial "Registrado"
   ✓ debe fallar si faltan campos obligatorios
   ✓ debe validar la pertenencia del accidente y mitigar accesos no autorizados (Anti-IDOR)

 ✓ tests/unit/use-cases/auth.test.ts (4 tests) 9ms
   ✓ debe registrar un usuario correctamente y HASHEAR la contraseña (nunca guardar en texto plano)
   ✓ debe permitir consultar el perfil del usuario autenticado a través del caso de uso
   ✓ debe impedir registrar dos usuarios con el mismo correo
   ✓ debe iniciar sesión con credenciales correctas y rechazar credenciales erróneas

 ✓ tests/unit/use-cases/accident.test.ts (4 tests) 13ms
   ✓ debe registrar un accidente vinculándolo obligatoriamente al usuario autenticado
   ✓ debe listar únicamente los accidentes correspondientes a la cuenta autenticada
   ✓ PRUEBA CRÍTICA DE SEGURIDAD (ANTI-IDOR Y NO ENUMERACIÓN): Usuario B debe recibir 404 al intentar consultar el accidente de Usuario A
   ✓ debe validar la transición de estados en el backend

 ✓ tests/integration/api.test.ts (5 tests) 156ms
   ✓ 10.1: Debe rechazar el registro de un accidente sin campos obligatorios (400)
   ✓ 10.2: Debe rechazar la consulta de accidentes sin autenticarse (401)
   ✓ 10.3 [CRÍTICO ANTI-IDOR Y NO ENUMERACIÓN]: Debe responder 404 si un usuario intenta consultar el accidente de otro alterando el ID
   ✓ 10.4: Debe rechazar datos inválidos en login o creación (400)
   ✓ 10.5: Debe retornar una lista vacía para una cuenta sin accidentes (200 con [])

 Test Files  6 passed (6)
      Tests  24 passed (24)
   Start at  18:36:05
   Duration  9.20s (transform 1.98s, setup 0ms, collect 7.40s, tests 212ms, environment 2ms, prepare 3.02s)
```

---

## 3. Verificación de Arquitectura con `dependency-cruiser`

```text
cd backend
npm run arch:check

✔ no dependency violations found (44 modules, 107 dependencies cruised)
```
Reporte detallado de grafos disponible en `docs/architecture/dependency-cruiser-report.txt`.
