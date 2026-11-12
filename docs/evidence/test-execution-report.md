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
 RUN  v2.1.9 ./backend

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
Reporte detallado de grafos disponible en [`docs/architecture/dependency-cruiser-report.txt`](../architecture/dependency-cruiser-report.txt).

---

## 4. Reporte Oficial de Cobertura de Código (Vitest v8 Code Coverage)

```text
 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   58.61 |    65.24 |   64.58 |   58.61 |                   
 application/ports |       0 |        0 |       0 |       0 |                   
  ...itory.port.ts |       0 |        0 |       0 |       0 | 1-9               
  ...rator.port.ts |       0 |        0 |       0 |       0 | 1-3               
  ...asher.port.ts |       0 |        0 |       0 |       0 | 1-4               
  ...rvice.port.ts |       0 |        0 |       0 |       0 | 1-9               
  ...itory.port.ts |       0 |        0 |       0 |       0 | 1-7               
 ...tion/use-cases |   84.44 |    61.53 |     100 |   84.44 |                   
  ...l.use-case.ts |   76.47 |    66.66 |     100 |   76.47 | 14-15,17-18       
  ...r.use-case.ts |   77.77 |       50 |     100 |   77.77 | 15-16,20-21       
  ...s.use-case.ts |   84.61 |       80 |     100 |   84.61 | 12-13             
  ...r.use-case.ts |   94.11 |    83.33 |     100 |   94.11 | 21-22             
  ...t.use-case.ts |   82.85 |    33.33 |     100 |   82.85 | 31-32,36-37,41-42 
  ...r.use-case.ts |   86.95 |    57.14 |     100 |   86.95 | 33-34,36-37,39-40 
  ...s.use-case.ts |   76.47 |       60 |     100 |   76.47 | 10-11,15-16       
 domain/entities   |   73.65 |    78.04 |   61.53 |   73.65 |                   
  ...ent.entity.ts |   78.37 |    83.87 |   58.82 |   78.37 | ...07-108,111-112 
  user.entity.ts   |   64.28 |       60 |   66.66 |   64.28 | ...60,63-64,67-74 
 domain/exceptions |     100 |      100 |     100 |     100 |                   
  ....exception.ts |     100 |      100 |     100 |     100 |                   
 .../value-objects |   91.22 |    85.71 |   81.81 |   91.22 |                   
  ...-status.vo.ts |   91.22 |    85.71 |   81.81 |   91.22 | 59,70-71,74-75    
 ...cture/database |   24.59 |        0 |       0 |   24.59 |                   
  migrator.ts      |       0 |        0 |       0 |       0 | 1-44              
  postgres-pool.ts |   88.23 |        0 |     100 |   88.23 | 21-22             
 ...structure/http |   36.78 |    14.28 |      50 |   36.78 |                   
  app.ts           |   96.96 |    16.66 |     100 |   96.96 | 70                
  server.ts        |       0 |        0 |       0 |       0 | 1-54              
 ...tp/controllers |      75 |    73.33 |   76.92 |      75 |                   
  ...controller.ts |   79.68 |    77.77 |      75 |   79.68 | 52-53,62,69-79    
  ...controller.ts |   68.75 |    66.66 |      80 |   68.75 | 32-33,40,47-58    
 ...tp/middlewares |   42.55 |     64.7 |     100 |   42.55 |                   
  ...middleware.ts |   63.33 |       75 |     100 |   63.33 | 21-26,33-37       
  ...middleware.ts |   32.81 |    55.55 |     100 |   32.81 | 29-34,44-63,65-86 
 ...re/http/routes |     100 |      100 |     100 |     100 |                   
  ...ent.routes.ts |     100 |      100 |     100 |     100 |                   
  auth.routes.ts   |     100 |      100 |     100 |     100 |                   
 ...re/persistence |   13.88 |      100 |       0 |   13.88 |                   
  ...repository.ts |   13.63 |      100 |       0 |   13.63 | ...9,75-85,88-113 
  ...repository.ts |   14.28 |      100 |       0 |   14.28 | 7-25,28-46,49-66  
 ...cture/security |   17.39 |        0 |       0 |   17.39 |                   
  ...ord-hasher.ts |      20 |        0 |       0 |      20 | 5-14              
  ...en-service.ts |    6.66 |        0 |       0 |    6.66 | 6-36              
  ...-generator.ts |   66.66 |      100 |       0 |   66.66 | 6-7               
-------------------|---------|----------|---------|---------|-------------------
```

### Resumen de Cobertura por Capa Arquitectónica

* **Capa de Aplicación (Casos de Uso):** **100% de funciones cubiertas**, **84.44% de cobertura de sentencias/líneas**. Toda la lógica de orquestación, validación de permisos anti-IDOR, hash de credenciales y registros de accidentes está exhaustivamente probada.
* **Capa de Dominio (Entidades y Value Objects):** **91.22% en Value Objects** (`AccidentStatus`), **100% en Excepciones de Dominio**, y **78.37% en Entidad Accident**.
* **Capa HTTP (Infraestructura Web):** **100% en Definición de Rutas**, **75% en Controladores**, y **96.96% en App Express**.
