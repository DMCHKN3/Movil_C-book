---
tipo: nodo-arquitectura
proyecto: C-Book Web
---

# Arquitectura General C-Book

## Se conecta con

- [[00 - Grafo C-Book Web]]
- [[Frontend]]
- [[Backend]]
- [[API Serverless]]
- [[Configuracion y Deploy]]
- [[Modulo Datos Supabase]]

## Flujo principal

```mermaid
flowchart LR
  Browser[Navegador] --> Vite[Frontend React Vite]
  Vite --> Client[frontend/src/api/client.js]
  Client --> AuthPath[/auth/*]
  AuthPath --> Vercel[Vercel rewrite]
  Vercel --> ApiIndex[api/index.js]
  ApiIndex --> Express[back/app.js]
  Express --> Router[back/src/routes/Rutas.js]
  Router --> Controllers[Controllers]
  Controllers --> Models[Models]
  Models --> Supabase[(Supabase)]
```

## Nodos de codigo clave

- [[Archivo - frontend - src - App.jsx]]
- [[Archivo - frontend - src - api - client.js]]
- [[Archivo - api - index.js]]
- [[Archivo - back - app.js]]
- [[Archivo - back - src - routes - Rutas.js]]
- [[Archivo - back - src - config - db.js]]
