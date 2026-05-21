---
tipo: grafo-proyecto
proyecto: C-Book Web
actualizado: 2026-05-15
---

# Grafo de relaciones - C-Book Web

Nodo central para navegar el proyecto por relaciones.

## Nodos principales

- [[Arquitectura General C-Book]]
- [[Frontend]]
- [[Backend]]
- [[API Serverless]]
- [[Configuracion y Deploy]]
- [[Modulo Auth y Sesion]]
- [[Modulo Recursos Solicitudes y Prestamos]]
- [[Modulo Administracion y Alumnos]]
- [[Modulo Analytics y Reportes]]
- [[Modulo Soporte]]
- [[Modulo UI Layout y Tema]]
- [[Modulo Datos Supabase]]
- [[Modulo Jobs y Cron]]
- [[Modulo Tests]]

## Relacion general

```mermaid
graph TD
  Proyecto[C-Book Web] --> Frontend
  Proyecto --> Backend
  Proyecto --> API[API Serverless]
  Proyecto --> Deploy[Configuracion y Deploy]
  Frontend --> Auth[Modulo Auth y Sesion]
  Frontend --> UI[Modulo UI Layout y Tema]
  Frontend --> Recursos[Modulo Recursos Solicitudes y Prestamos]
  Frontend --> Admin[Modulo Administracion y Alumnos]
  Frontend --> Analytics[Modulo Analytics y Reportes]
  Frontend --> Soporte[Modulo Soporte]
  Backend --> Rutas[back/src/routes/Rutas.js]
  Rutas --> Auth
  Rutas --> Recursos
  Rutas --> Admin
  Rutas --> Analytics
  Backend --> Datos[Modulo Datos Supabase]
  Backend --> Jobs[Modulo Jobs y Cron]
  API --> Backend
  Deploy --> Frontend
  Deploy --> API
```

## Mapa original

- [[00 - Mapa completo C-Book Web]]
