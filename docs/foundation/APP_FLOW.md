---
doc_type: APP_FLOW
app_type: fullstack
status: approved
---

# App Flow - Plataforma de Accidentes Personales

## 1. Mapa de Pantallas (Screens)

### S-01: Landing Page (`/`)
- Presenta el propósito de la plataforma.
- CTA 1: "Registrar un accidente" -> Redirige a `/accidents/new` (si autenticado) o a `/login?redirect=/accidents/new`.
- CTA 2: "Ingresar para consultar mis accidentes" -> Redirige a `/login?redirect=/dashboard`.

### S-02: Autenticación (`/login` y `/register`)
- `/login`: Formulario con email y contraseña.
- `/register`: Formulario con nombre, email y contraseña.

### S-03: Dashboard / Mis Accidentes (`/dashboard` o `/accidents`)
- Vista protegida.
- Si no hay registros: muestra estado vacío con opción para reportar primer accidente.
- Si hay registros: lista de tarjetas o tabla con fecha, tipo, resumen y badge de estado (`Registrado`, `En revisión`, `Cerrado`).
- Botón "Ver detalle" por cada accidente -> conduce a S-05.

### S-04: Formulario de Reporte (`/accidents/new`)
- Vista protegida.
- Formulario reactivo con campos requeridos:
  - Nombre completo del afectado
  - Teléfono
  - Tipo de accidente
  - Fecha y hora
  - Lugar
  - Descripción
- Botón de envío con estado de carga ("Guardando...").
- Al enviar con éxito: notificación toast y redirección al Dashboard.

### S-05: Detalle de Accidente (`/accidents/:id`)
- Vista protegida.
- Carga el accidente con verificación estricta de pertenencia.
- Visualización de datos completos y estado actual.
- Si el ID no existe o no pertenece al usuario autenticado: muestra 404/Acceso denegado amigable.

## 2. Flujo Principal de Interacción (A-01)
1. Usuario no registrado entra a la Landing.
2. Hace clic en "Registrar un accidente".
3. Se le solicita registrarse o iniciar sesión.
4. Completa el formulario de registro y queda automáticamente autenticado con token en memoria/cliente.
5. Es redirigido al formulario de registro de accidente.
6. Envía el formulario; el backend verifica la identidad y guarda el registro en PostgreSQL.
7. Es redirigido a su listado privado, donde ve inmediatamente su accidente con estado `Registrado`.
