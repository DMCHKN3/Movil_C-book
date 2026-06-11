# API — C-Book Móvil

> **Base URL:** `{EXPO_PUBLIC_API_URL}/auth`  
> **Framework:** Express.js (Azure App Service)  
> **Autenticación:** JWT en cookie `app_session` (envío automático vía `Cookie` header; renovación automática si el servidor responde con `Set-Cookie`).  
> **Formato:** JSON.  
> **Idioma de contenido:** `Content-Type: application/json`.

---

## Índice de endpoints

| #  | Método   | Ruta                                        | Sección      |
|----|----------|---------------------------------------------|--------------|
| 1  | `POST`   | `/auth/login`                               | Autenticación |
| 2  | `POST`   | `/auth/registro`                            | Autenticación |
| 3  | `POST`   | `/auth/verificar`                           | Autenticación |
| 4  | `GET`    | `/auth/session`                             | Autenticación |
| 5  | `POST`   | `/auth/logout`                              | Autenticación |
| 6  | `POST`   | `/auth/forgot-password`                     | Autenticación |
| 7  | `POST`   | `/auth/reset-password`                      | Autenticación |
| 8  | `POST`   | `/auth/cambiar-contrasena`                  | Autenticación |
| 9  | `PATCH`  | `/auth/CuentaUpdate`                        | Autenticación |
| 10 | `GET`    | `/auth/recursos`                            | Catálogo     |
| 11 | `GET`    | `/auth/libros/mas-solicitados`              | Catálogo     |
| 12 | `GET`    | `/auth/recursos/usuario`                    | Solicitudes  |
| 13 | `POST`   | `/auth/solicitud`                           | Solicitudes  |
| 14 | `DELETE` | `/auth/solicitud/:tipo/:id`                 | Solicitudes  |
| 15 | `GET`    | `/auth/soporte/tipos`                       | Soporte      |
| 16 | `POST`   | `/auth/soporte/tickets`                     | Soporte      |
| 17 | `GET`    | `/auth/soporte/tickets`                     | Soporte      |
| 18 | `GET`    | `/auth/soporte/tickets/:id`                 | Soporte      |
| 19 | `POST`   | `/auth/soporte/tickets/:id/comentarios`     | Soporte      |

---

## 1. Inicio de sesión

**`POST /auth/login`**

Inicia sesión con número de boleta y contraseña. El servidor responde con un JWT en la cookie `app_session` y los datos del alumno.

### Body (JSON)

| Campo      | Tipo   | Obligatorio | Descripción                           |
|------------|--------|-------------|---------------------------------------|
| `boleta`   | string | Sí          | Número de boleta de 10 dígitos.       |
| `password` | string | Sí          | Contraseña del alumno.                |

### Respuesta exitosa — `200 OK`

```json
{
  "success": true,
  "user": {
    "boleta": "2023630001",
    "nombre": "Juan Pérez López",
    "email": "jperezl@alumno.ipn.mx",
    "tiene_documentos": true,
    "correo": "jperezl@alumno.ipn.mx"
  }
}
```

### Errores

| Código | Causa                                                           |
|--------|----------------------------------------------------------------|
| 400    | Body inválido o boleta sin formato de 10 dígitos.              |
| 401    | Boleta o contraseña incorrectos.                               |
| 403    | Correo electrónico no confirmado.                              |
| 500    | Error interno del servidor.                                    |

---

## 2. Registro de cuenta

**`POST /auth/registro`**

Crea una cuenta de alumno. El servidor envía un correo de verificación a la dirección proporcionada.

### Body (JSON)

| Campo             | Tipo    | Obligatorio | Descripción                                                       |
|-------------------|---------|-------------|--------------------------------------------------------------------|
| `boleta`          | string  | Sí          | Número de boleta de 10 dígitos.                                   |
| `correo`          | string  | Sí          | Correo institucional `@alumno.ipn.mx`.                            |
| `password`        | string  | Sí          | De 7–16 caracteres, debe incluir mayúscula, minúscula y especial. |
| `confPsw`         | string  | Sí          | Debe coincidir con `password`.                                    |
| `acepta_terminos` | boolean | Sí          | Aceptación de términos y condiciones.                              |

### Respuesta exitosa — `201 Created`

```json
{
  "success": true,
  "message": "Se envió un correo de verificación a tu dirección."
}
```

### Errores

| Código | Causa                                                                 |
|--------|-----------------------------------------------------------------------|
| 400    | Datos inválidos (formato de boleta, correo o contraseña incorrecto).  |
| 409    | Ya existe una cuenta con esa boleta o correo.                        |
| 500    | Error interno del servidor.                                           |

---

## 3. Verificar correo pendiente

**`POST /auth/verificar`**

Consulta si el correo del alumno ya fue confirmado. Se usa para verificar el estado de una cuenta después del registro.

### Body (JSON)

| Campo    | Tipo   | Obligatorio | Descripción                     |
|----------|--------|-------------|----------------------------------|
| `boleta` | string | Sí          | Número de boleta de 10 dígitos. |
| `correo` | string | Sí          | Correo institucional.           |

### Respuesta exitosa — `200 OK`

```json
{
  "confirmado": true
}
```

### Errores

| Código | Causa                                             |
|--------|----------------------------------------------------|
| 400    | Body inválido o boleta sin formato de 10 dígitos. |
| 404    | No se encontró registro pendiente para esa boleta.|
| 500    | Error interno del servidor.                       |

---

## 4. Obtener sesión actual

**`GET /auth/session`**

**Requiere autenticación** (cookie `app_session` válida).

Devuelve los datos del alumno autenticado y confirma que la sesión sigue activa.

### Respuesta exitosa — `200 OK`

```json
{
  "autenticado": true,
  "user": {
    "boleta": "2023630001",
    "nombre": "Juan Pérez López",
    "email": "jperezl@alumno.ipn.mx",
    "tiene_documentos": true,
    "correo": "jperezl@alumno.ipn.mx"
  }
}
```

Si la sesión no es válida:

```json
{
  "autenticado": false,
  "user": null
}
```

### Errores

| Código | Causa                              |
|--------|-------------------------------------|
| 401    | Cookie `app_session` inválida o expirada. |
| 500    | Error interno del servidor.        |

---

## 5. Cerrar sesión

**`POST /auth/logout`**

**Requiere autenticación** (cookie `app_session` válida).

Invalida la sesión actual en el servidor. El cliente también debe limpiar la cookie y el almacenamiento local.

### Respuesta exitosa — `200 OK`

```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente."
}
```

### Errores

| Código | Causa                              |
|--------|-------------------------------------|
| 401    | No hay sesión activa para cerrar.  |
| 500    | Error interno del servidor.        |

---

## 6. Solicitar recuperación de contraseña

**`POST /auth/forgot-password`**

Envía un correo con instrucciones para restablecer la contraseña del alumno.

### Body (JSON)

| Campo    | Tipo   | Obligatorio | Descripción                     |
|----------|--------|-------------|----------------------------------|
| `boleta` | string | Sí          | Número de boleta de 10 dígitos. |

### Respuesta exitosa — `200 OK`

```json
{
  "success": true,
  "message": "Revisa tu correo electrónico para las instrucciones de recuperación."
}
```

### Errores

| Código | Causa                                                     |
|--------|------------------------------------------------------------|
| 400    | Boleta sin formato de 10 dígitos.                         |
| 404    | No se encontró una cuenta asociada a esa boleta.          |
| 500    | Error interno del servidor.                               |

---

## 7. Restablecer contraseña

**`POST /auth/reset-password`**

Establece una nueva contraseña utilizando el token recibido por correo.

### Body (JSON)

| Campo           | Tipo   | Obligatorio | Descripción                                           |
|-----------------|--------|-------------|-------------------------------------------------------|
| `access_token`  | string | Sí          | Token de recuperación recibido por correo.            |
| `newPassword`   | string | Sí          | Nueva contraseña (7–16 caracteres, mayúscula, minúscula y especial). |
| `confPassword`  | string | Sí          | Confirmación de la nueva contraseña.                  |

### Respuesta exitosa — `200 OK`

```json
{
  "success": true,
  "message": "Contraseña restablecida exitosamente."
}
```

### Errores

| Código | Causa                                                             |
|--------|------------------------------------------------------------------|
| 400    | Token inválido, expirado o las contraseñas no coinciden.         |
| 500    | Error interno del servidor.                                      |

---

## 8. Cambiar contraseña

**`POST /auth/cambiar-contrasena`**

**Requiere autenticación** (cookie `app_session` válida).

Cambia la contraseña del alumno autenticado.

### Body (JSON)

| Campo             | Tipo   | Obligatorio | Descripción                                    |
|-------------------|--------|-------------|------------------------------------------------|
| `correo`          | string | Sí          | Correo electrónico del alumno.                |
| `currentPassword` | string | Sí          | Contraseña actual.                            |
| `newPassword`     | string | Sí          | Nueva contraseña (7–16 caracteres).           |

### Respuesta exitosa — `200 OK`

```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente."
}
```

### Errores

| Código | Causa                                                         |
|--------|---------------------------------------------------------------|
| 400    | La contraseña actual no coincide o los datos son inválidos.   |
| 401    | Sesión inválida o expirada.                                   |
| 500    | Error interno del servidor.                                   |

---

## 9. Actualizar datos de cuenta

**`PATCH /auth/CuentaUpdate`**

**Requiere autenticación** (cookie `app_session` válida).

Actualiza el correo o la contraseña del alumno.

### Body (JSON)

| Campo               | Tipo   | Obligatorio | Descripción                                    |
|---------------------|--------|-------------|------------------------------------------------|
| `boleta`            | string | Sí          | Número de boleta de 10 dígitos.               |
| `TipoDatoACambiar`  | string | Sí          | `"correo"` o `"contraseña"`.                  |
| `nuevoCorreo`       | string | Condicional | Nuevo correo (requerido si `TipoDatoACambiar` es `"correo"`). |
| `nuevaContraseña`   | string | Condicional | Nueva contraseña (requerido si `TipoDatoACambiar` es `"contraseña"`). |

### Respuesta exitosa — `200 OK`

```json
{
  "success": true,
  "message": "Datos actualizados exitosamente."
}
```

### Errores

| Código | Causa                                                       |
|--------|-------------------------------------------------------------|
| 400    | Tipo de cambio inválido o formato incorrecto.               |
| 401    | Sesión inválida o expirada.                                 |
| 500    | Error interno del servidor.                                 |

---

## 10. Listar recursos (catálogo)

**`GET /auth/recursos?tipo={tipo}&limit={limite}&page={pagina}`**

**Requiere autenticación** (cookie `app_session` válida).

Obtiene el catálogo de libros disponibles con paginación del lado del servidor.

### Parámetros query

| Parámetro | Tipo   | Obligatorio | Valor por defecto | Descripción                                      |
|-----------|--------|-------------|-------------------|--------------------------------------------------|
| `tipo`    | string | Sí          | —                 | Tipo de material (ej. `"libro"`).                |
| `limit`   | int    | No          | —                 | Número de resultados por página.                 |
| `page`    | int    | No          | 1                 | Número de página (1-indexed).                    |

### Respuesta exitosa — `200 OK`

```json
{
  "data": [
    {
      "id": 1,
      "numero_ejemplar": 2,
      "Disponible": true,
      "anio": 2020,
      "libros": {
        "id": 5,
        "titulo": "Estructuras de Datos",
        "autor": "Michael T. Goodrich",
        "isbn": "978-607-32-1234-5",
        "clasificacion": "005.73",
        "tipo_material": "Libro"
      }
    }
  ],
  "total": 42
}
```

### Errores

| Código | Causa                                      |
|--------|---------------------------------------------|
| 400    | Parámetro `tipo` no especificado.          |
| 401    | Sesión inválida o expirada.                |
| 500    | Error interno del servidor.                |

---

## 11. Libros más solicitados

**`GET /auth/libros/mas-solicitados`**

**Requiere autenticación** (cookie `app_session` válida).

Devuelve los libros con mayor número de solicitudes.

### Respuesta exitosa — `200 OK`

```json
{
  "data": [
    {
      "id": 1,
      "libros": {
        "titulo": "Estructuras de Datos",
        "autor": "Michael T. Goodrich"
      },
      "solicitudes_count": 15
    }
  ]
}
```

### Errores

| Código | Causa                                      |
|--------|---------------------------------------------|
| 401    | Sesión inválida o expirada.                |
| 500    | Error interno del servidor.                |

---

## 12. Obtener solicitudes del usuario

**`GET /auth/recursos/usuario`**

**Requiere autenticación** (cookie `app_session` válida).

Devuelve todas las solicitudes de préstamo realizadas por el alumno autenticado.

### Respuesta exitosa — `200 OK`

```json
{
  "data": [
    {
      "id": 101,
      "titulo": "Estructuras de Datos",
      "autor": "Michael T. Goodrich",
      "ejemplar_id": 1,
      "estado_asistencia_id": 1,
      "fecha_solicitud": "2026-05-20T14:30:00.000Z",
      "fecha_aprobacion": "2026-05-21T10:00:00.000Z",
      "fecha_limite_devolucion": "2026-05-24T10:00:00.000Z",
      "fecha_devolucion_real": null
    }
  ]
}
```

### Estados de solicitud

| `estado_asistencia_id` | Signo      |
|------------------------|------------|
| 1                      | Pendiente  |
| 2                      | Aprobada   |
| 3                      | Rechazada  |
| 4                      | Cancelada  |
| 5                      | Entregado  |
| 6                      | Devuelto   |

Cuando el estado es `5` (Entregado) y existe `fecha_devolucion_real`, se considera efectivamente **Devuelto (6)**.

### Errores

| Código | Causa                                      |
|--------|---------------------------------------------|
| 401    | Sesión inválida o expirada.                |
| 500    | Error interno del servidor.                |

---

## 13. Crear solicitud de préstamo

**`POST /auth/solicitud`**

**Requiere autenticación** (cookie `app_session` válida).

Crea una nueva solicitud de préstamo para un recurso. El alumno debe tener documentos en regla y no exceder el límite de 3 solicitudes activas.

### Body (JSON)

| Campo       | Tipo   | Obligatorio | Descripción                                    |
|-------------|--------|-------------|------------------------------------------------|
| `tipo`      | string | Sí          | Tipo de recurso (ej. `"libro"`).               |
| `boleta`    | string | Sí          | Número de boleta de 10 dígitos.               |
| `idRecurso` | int    | Sí          | ID del ejemplar a solicitar.                   |

### Respuesta exitosa — `201 Created`

```json
{
  "success": true,
  "message": "Solicitud creada exitosamente."
}
```

### Errores

| Código | Causa                                                              |
|--------|--------------------------------------------------------------------|
| 400    | Datos inválidos o formato incorrecto.                             |
| 401    | Sesión inválida o expirada.                                       |
| 403    | El alumno no tiene documentos en regla.                           |
| 409    | Límite de 3 solicitudes activas alcanzado o el recurso no está disponible. |
| 500    | Error interno del servidor.                                       |

---

## 14. Cancelar solicitud

**`DELETE /auth/solicitud/:tipo/:id`**

**Requiere autenticación** (cookie `app_session` válida).

Cancela una solicitud de préstamo. Solo se pueden cancelar solicitudes en estado **Pendiente (1)**.

### Parámetros de ruta

| Parámetro | Tipo   | Descripción                              |
|-----------|--------|------------------------------------------|
| `tipo`    | string | Tipo de recurso (ej. `"libro"`).         |
| `id`      | int    | ID de la solicitud a cancelar.           |

### Respuesta exitosa — `200 OK`

```json
{
  "success": true,
  "message": "Solicitud cancelada exitosamente."
}
```

### Errores

| Código | Causa                                                  |
|--------|---------------------------------------------------------|
| 400    | Tipo o ID inválido.                                    |
| 401    | Sesión inválida o expirada.                            |
| 404    | Solicitud no encontrada o no pertenece al usuario.     |
| 409    | La solicitud no está en estado Pendiente y no puede cancelarse. |
| 500    | Error interno del servidor.                            |

---

## 15. Obtener tipos de incidencia

**`GET /auth/soporte/tipos`**

**Requiere autenticación** (cookie `app_session` válida).

Devuelve la lista de tipos de incidencia disponibles para crear tickets de soporte.

### Respuesta exitosa — `200 OK`

```json
{
  "tipos": [
    {
      "id": 1,
      "name": "Funcional",
      "description": "Algo no funciona como debería",
      "is_active": true
    },
    {
      "id": 2,
      "name": "Visual",
      "description": "Diseño, textos cortados, etc.",
      "is_active": true
    }
  ]
}
```

### Errores

| Código | Causa                                      |
|--------|---------------------------------------------|
| 401    | Sesión inválida o expirada.                |
| 500    | Error interno del servidor.                |

---

## 16. Crear ticket de soporte

**`POST /auth/soporte/tickets`**

**Requiere autenticación** (cookie `app_session` válida).

Crea un nuevo ticket de soporte técnico.

### Body (JSON)

| Campo         | Tipo   | Obligatorio | Descripción                                        |
|---------------|--------|-------------|----------------------------------------------------|
| `titulo`      | string | Sí          | Asunto del ticket (4–160 caracteres).              |
| `descripcion` | string | Sí          | Descripción detallada (15–2000 caracteres).        |
| `tipo`        | string | Sí          | Nombre del tipo de incidencia.                     |
| `prioridad`   | string | Sí          | `"baja"`, `"media"` o `"alta"`.                    |
| `modulo`      | string | No          | Módulo de origen (ej. `"movil"`).                  |

### Respuesta exitosa — `201 Created`

```json
{
  "success": true,
  "message": "Reporte enviado. Se creó tu ticket."
}
```

### Errores

| Código | Causa                                                    |
|--------|-----------------------------------------------------------|
| 400    | Datos inválidos o validaciones de campos no cumplidas.   |
| 401    | Sesión inválida o expirada.                              |
| 500    | Error interno del servidor.                              |

---

## 17. Listar tickets del usuario

**`GET /auth/soporte/tickets?mine=true`**

**Requiere autenticación** (cookie `app_session` válida).

Obtiene todos los tickets de soporte creados por el alumno autenticado.

### Parámetros query

| Parámetro | Tipo    | Obligatorio | Descripción                           |
|-----------|---------|-------------|---------------------------------------|
| `mine`    | boolean | Sí          | Debe ser `true` para filtrar por usuario. |

### Respuesta exitosa — `200 OK`

```json
{
  "tickets": [
    {
      "id": 15,
      "ticket_number": "TK-20260601-0015",
      "title": "No puedo solicitar libros",
      "incident_type_name": "Funcional",
      "module": "movil",
      "status": "New",
      "priority": "alta",
      "created_at": "2026-06-01T12:00:00.000Z"
    }
  ]
}
```

### Mapeo de estados

| Estado backend | Display       |
|----------------|---------------|
| `New`          | Abierto       |
| `Open`         | Abierto       |
| `Pending`      | Pendiente     |
| `Waiting`      | Pendiente     |
| `Resolved`     | Resuelto      |
| `Closed`       | Cerrado       |

### Errores

| Código | Causa                                      |
|--------|---------------------------------------------|
| 401    | Sesión inválida o expirada.                |
| 500    | Error interno del servidor.                |

---

## 18. Obtener detalle de ticket

**`GET /auth/soporte/tickets/:id`**

**Requiere autenticación** (cookie `app_session` válida).

Devuelve la información detallada de un ticket de soporte específico.

### Parámetros de ruta

| Parámetro | Tipo   | Descripción                    |
|-----------|--------|--------------------------------|
| `id`      | int    | ID del ticket de soporte.      |

### Respuesta exitosa — `200 OK`

```json
{
  "id": 15,
  "ticket_number": "TK-20260601-0015",
  "title": "No puedo solicitar libros",
  "description": "Al intentar solicitar un libro...",
  "incident_type_name": "Funcional",
  "module": "movil",
  "status": "New",
  "priority": "alta",
  "created_at": "2026-06-01T12:00:00.000Z",
  "comments": []
}
```

### Errores

| Código | Causa                                                |
|--------|-------------------------------------------------------|
| 401    | Sesión inválida o expirada.                          |
| 404    | Ticket no encontrado o no pertenece al usuario.      |
| 500    | Error interno del servidor.                          |

---

## 19. Agregar comentario a ticket

**`POST /auth/soporte/tickets/:id/comentarios`**

**Requiere autenticación** (cookie `app_session` válida).

Agrega un comentario a un ticket de soporte existente.

### Parámetros de ruta

| Parámetro | Tipo   | Descripción                    |
|-----------|--------|--------------------------------|
| `id`      | int    | ID del ticket de soporte.      |

### Body (JSON)

| Campo        | Tipo    | Obligatorio | Descripción                                               |
|--------------|---------|-------------|-----------------------------------------------------------|
| `body`       | string  | Sí          | Contenido del comentario.                                 |
| `isInternal` | boolean | Sí          | `true` si es una nota interna (visible solo para admins). |

### Respuesta exitosa — `201 Created`

```json
{
  "success": true,
  "message": "Comentario agregado exitosamente."
}
```

### Errores

| Código | Causa                                                |
|--------|-------------------------------------------------------|
| 400    | Comentario vacío o datos inválidos.                  |
| 401    | Sesión inválida o expirada.                          |
| 404    | Ticket no encontrado o no pertenece al usuario.      |
| 500    | Error interno del servidor.                          |

---

## Edge Function: registro de push token

**`POST {SUPABASE_URL}/functions/v1/send-push-status`**

Endpoint de Supabase Edge Function para registrar el token de notificaciones push del dispositivo.

**Nota:** Este endpoint no utiliza la cookie `app_session`. Se autentica mediante el `anon key` de Supabase.

### Body (JSON)

| Campo   | Tipo   | Obligatorio | Descripción                              |
|---------|--------|-------------|------------------------------------------|
| `type`  | string | Sí          | Tipo de operación (`"register"`).        |
| `token` | string | Sí          | Expo Push Token del dispositivo.         |
| `boleta`| int    | Sí          | Número de boleta del alumno.            |

### Respuesta exitosa — `200 OK`

```json
{
  "ok": true
}
```

### Errores

| Código | Causa                              |
|--------|-------------------------------------|
| 400    | Token inválido o datos incompletos. |
| 500    | Error interno de la Edge Function. |

---

## Notas generales

- **Autenticación:** Todos los endpoints bajo `/auth/*` requieren la cookie `app_session`. Si el servidor responde `401`, el cliente limpia la sesión local y redirige al inicio.
- **Renovación de JWT:** Si el servidor incluye un `Set-Cookie` en la respuesta, el cliente actualiza automáticamente la cookie y el almacenamiento local.
- **Errores:** Todos los errores se devuelven con el formato `{ "error": "mensaje", "message": "mensaje" }`. El código HTTP refleja la naturaleza del error.
- **Paginación:** El endpoint `/auth/recursos` soporta paginación server-side via `limit` y `page`. La paginación client-side se realiza en la app sobre los datos ya obtenidos.
- **Límites de negocio:** Máximo 3 solicitudes activas por alumno. Máximo 3 días de préstamo.
