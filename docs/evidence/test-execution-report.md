# Informe de Ejecución de Pruebas Automatizadas

- **Fecha de Ejecución:** 2026-11-11
- **Motor de Pruebas:** Vitest v2.1.9 (Node.js v22.14.0)
- **Resultado Global:** 19 pruebas ejecutadas / 19 pruebas aprobadas (100% de éxito).

---

## 1. Matriz de Cumplimiento de Pruebas Obligatorias (Sección 10 del PDF)

| Requerimiento Obligatorio (Sección 10) | Archivo de Prueba | Caso de Prueba Específico | Estado |
| :--- | :--- | :--- | :--- |
| **10.1: Registrar un accidente sin campos obligatorios** | `tests/integration/api.test.ts` | `10.1: Debe rechazar el registro de un accidente sin campos obligatorios (400)` | **PASÓ (400 Bad Request)** |
| **10.2: Consultar accidentes sin autenticarse** | `tests/integration/api.test.ts` | `10.2: Debe rechazar la consulta de accidentes sin autenticarse (401)` | **PASÓ (401 Unauthorized)** |
| **10.3 [FALLO ELIMINATORIO]: Consultar accidente de otro usuario alterando el ID (IDOR)** | `tests/integration/api.test.ts`<br>`tests/unit/use-cases/accident.test.ts` | `10.3 [CRÍTICO IDOR]: Debe impedir que un usuario consulte el accidente de otro alterando el ID (403)`<br>`PRUEBA CRÍTICA DE SEGURIDAD (ANTI-IDOR)` | **PASÓ (403 Forbidden / UnauthorizedAccidentAccessException)** |
| **10.4: Enviar datos inválidos al backend** | `tests/integration/api.test.ts` | `10.4: Debe rechazar datos inválidos en login o creación (400)` | **PASÓ (400 Bad Request con Zod)** |
| **10.5: Consultar con una cuenta sin accidentes** | `tests/integration/api.test.ts` | `10.5: Debe retornar una lista vacía para una cuenta sin accidentes (200 con [])` | **PASÓ (200 OK con arreglo vacío)** |
| **10.6: Verificar que los datos persistan tras reiniciar** | Verificado en persistencia PostgreSQL real | Inserción en tabla `accidents` y comprobación tras reinicio de contenedor Docker | **PASÓ (Persistencia relacional en pgdata)** |
| **10.7: Verificar que los secretos no estén en el repositorio** | Inspección de `.gitignore` e historial de Git | `.env` excluido; `.env.example` contiene únicamente valores ficticios | **PASÓ (0 secretos en Git)** |
| **10.8: Probar reglas de dominio sin infraestructura** | `tests/unit/domain/accident-status.test.ts`<br>`tests/unit/domain/accident.test.ts` | 7 pruebas unitarias puras de entidades y value objects | **PASÓ (0 dependencias de DB/HTTP)** |
| **10.9: Arranque limpio siguiendo solo el README** | Verificado mediante guía de `README.md` | `docker compose up -d`, `npm install`, `npm run build`, `npm start` | **PASÓ** |

---

## 2. Salida de Ejecución de la Suite (Vitest)

```text
 RUN  v2.1.9 D:/GitHub/Prueba Tecnica/backend

 ✓ tests/unit/domain/accident-status.test.ts (4 tests)
   ✓ debe crear estados válidos correctamente
   ✓ debe lanzar InvalidAccidentStatusException con un estado inválido
   ✓ debe permitir transiciones válidas: Registrado -> En revisión -> Cerrado
   ✓ debe rechazar transiciones inválidas: Cerrado -> Registrado

 ✓ tests/unit/domain/accident.test.ts (3 tests)
   ✓ debe instanciar un accidente con estado inicial "Registrado"
   ✓ debe fallar si faltan campos obligatorios
   ✓ debe validar la pertenencia del accidente y mitigar accesos no autorizados (Anti-IDOR)

 ✓ tests/unit/use-cases/auth.test.ts (3 tests)
   ✓ debe registrar un usuario correctamente y HASHEAR la contraseña (nunca guardar en texto plano)
   ✓ debe impedir registrar dos usuarios con el mismo correo
   ✓ debe iniciar sesión con credenciales correctas y rechazar credenciales erróneas

 ✓ tests/unit/use-cases/accident.test.ts (4 tests)
   ✓ debe registrar un accidente vinculándolo obligatoriamente al usuario autenticado
   ✓ debe listar únicamente los accidentes correspondientes a la cuenta autenticada
   ✓ PRUEBA CRÍTICA DE SEGURIDAD (ANTI-IDOR): Usuario B no debe poder acceder al detalle del accidente de Usuario A
   ✓ debe validar la transición de estados en el backend

 ✓ tests/integration/api.test.ts (5 tests)
   ✓ 10.1: Debe rechazar el registro de un accidente sin campos obligatorios (400)
   ✓ 10.2: Debe rechazar la consulta de accidentes sin autenticarse (401)
   ✓ 10.3 [CRÍTICO IDOR]: Debe impedir que un usuario consulte el accidente de otro alterando el ID (403)
   ✓ 10.4: Debe rechazar datos inválidos en login o creación (400)
   ✓ 10.5: Debe retornar una lista vacía para una cuenta sin accidentes (200 con [])

 Test Files  5 passed (5)
      Tests  19 passed (19)
   Start at  17:09:44
   Duration  7.62s
```

---

## 3. Conclusión
Todas las pruebas unitarias y de integración fueron ejecutadas efectivamente y pasaron al 100%. No se registraron pruebas omitidas (*skipped*) ni simulaciones falsas.
