# Criterios de Aceptación Verificables - Plataforma de Accidentes Personales

Este documento formaliza los requisitos funcionales, técnicos y de seguridad en criterios verificables con base en el enunciado oficial de la prueba técnica.

---

## CA-01: Landing Pública y Navegación
- **CA-01.1:** La landing page presenta el propósito de la plataforma de accidentes personales.
- **CA-01.2:** La landing ofrece accesos claros a:
  - "Registrar un accidente" (si el usuario no está autenticado, lo redirige a login/registro antes de permitir el llenado).
  - "Ingresar para consultar mis accidentes" (redirige al formulario de inicio de sesión).
- **CA-01.3:** La navegación no expone rutas protegidas sin sesión válida en el backend.

---

## CA-02: Autenticación y Autorización Segura
- **CA-02.1:** Registro de usuario: recopila nombre completo, correo electrónico y contraseña.
- **CA-02.2:** La contraseña se almacena exclusivamente mediante un algoritmo de hashing seguro (Bcrypt, mínimo 10 rounds). **Nunca en texto plano** (Fallo Eliminatorio).
- **CA-02.3:** Inicio de sesión genera un token JWT firmado por el backend con expiración configurada.
- **CA-02.4:** Los endpoints protegidos rechazan peticiones sin token o con token inválido/expirado con código HTTP 401 Unauthorized.
- **CA-02.5:** Ocultar pantallas en frontend React no se considera autorización; toda regla de acceso es validada en el backend.

---

## CA-03: Registro de Accidentes Personales
- **CA-03.1:** El formulario de registro recopila como mínimo:
  - Datos de identificación y contacto del afectado (Nombre completo, teléfono de contacto).
  - Tipo de accidente (ej. Tránsito, Laboral, Doméstico, Deportivo).
  - Fecha y hora del accidente.
  - Lugar del accidente (dirección o referencia).
  - Descripción detallada de lo ocurrido.
- **CA-03.2:** Validación de campos obligatorios en Frontend y Backend (Zod).
- **CA-03.3:** **Prevención estricta de IDOR (Fallo Eliminatorio):** El accidente se vincula obligatoriamente al usuario autenticado extraído del token JWT verificado en el servidor. El backend ignora cualquier `userId` o correo enviado por el cliente en el cuerpo de la petición.
- **CA-03.4:** El estado inicial del accidente registrado es `Registrado`.

---

## CA-04: Consulta Privada de Accidentes (Aislamiento de Cuentas)
- **CA-04.1:** El listado de accidentes (`GET /api/accidents`) retorna **únicamente** los accidentes asociados al usuario autenticado.
- **CA-04.2:** Cada registro en el listado muestra fecha y estado actual.
- **CA-04.3:** Si el usuario no tiene accidentes registrados, la UI muestra un mensaje amigable indicando que no tiene registros aún.
- **CA-04.4:** La vista de detalle (`GET /api/accidents/:id`) valida que el accidente pertenezca al usuario autenticado. Si un usuario intenta consultar un accidente perteneciente a otro usuario, el backend responde con 404 Not Found o 403 Forbidden. **Bajo ninguna circunstancia se expone información de otros usuarios** (Fallo Eliminatorio).

---

## CA-05: Ciclo de Vida y Transiciones de Estado
- **CA-05.1:** Estados válidos del accidente: `Registrado`, `En revisión`, `Cerrado`.
- **CA-05.2:** Las transiciones de estado son validadas y aplicadas exclusivamente por el backend mediante casos de uso del dominio.

---

## CA-06: Persistencia e Integridad en PostgreSQL
- **CA-06.1:** Esquema relacional con llaves foráneas (`user_id -> users.id`) e índices apropiados.
- **CA-06.2:** Migraciones reproducibles para levantar la base de datos desde cero.
- **CA-06.3:** Los datos sobreviven al reinicio de contenedores o servicios. No se acepta almacenamiento en memoria.

---

## CA-07: Arquitectura Hexagonal y Calidad de Código
- **CA-07.1:** Capa de Dominio pura (cero dependencias hacia Express, React, PostgreSQL o librerías de terceros).
- **CA-07.2:** Lógica de negocio encapsulada en Casos de Uso (Application Layer) y orquestada a través de Puertos (Interfaces).
- **CA-07.3:** Adaptadores de infraestructura (HTTP Express, Repositorio PostgreSQL) implementan los puertos del núcleo.
- **CA-07.4:** Cobertura de pruebas unitarias sobre casos de uso y dominio sin dependencias de infraestructura.
