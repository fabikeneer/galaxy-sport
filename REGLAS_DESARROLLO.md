# Reglas de desarrollo — Galaxy Sport

Leer este archivo antes de implementar cualquier cambio. Si una tarea contradice estas reglas, prevalecen estas reglas.

## Stack (obligatorio)

Trabajar solo con este stack. No introducir lenguajes, frameworks ni librerías nuevas sin acuerdo explícito.

| Capa | Tecnología | Notas |
|------|------------|--------|
| Runtime | Node.js (ES modules, `"type": "module"`) | Backend y scripts |
| API | Express 4 | Rutas en `backend/routes`, lógica en `backend/controllers` |
| Base de datos | MySQL 8 (mysql2/promise) | Esquema en `backend/config/database.sql` |
| Auth | jsonwebtoken + bcryptjs | Middleware en `backend/middlewares` |
| Uploads | multer | Archivos en `backend/uploads` |
| Config | dotenv | `backend/.env` (nunca commitear secretos) |
| Frontend | React 18 | Componentes funcionales |
| Routing | react-router-dom 6 | Rutas en `frontend/src/App.jsx` |
| HTTP cliente | axios | `frontend/src/services/api.js` |
| Build UI | Vite 5 | `frontend/` |
| Iconos | lucide-react | Sin emojis en UI ni código |
| Estilos | CSS + variables en `theme.css` | Sin Tailwind / CSS-in-JS nuevo |

Idioma del código (nombres de variables, funciones, tablas, columnas, archivos): **inglés**.  
Textos visibles al usuario (UI, errores de API, mensajes): **español**.

## Antes de codificar

1. Revisar `CHECKLIST_DESARROLLO.md` y trabajar solo la fase acordada.
2. Revisar este archivo (`REGLAS_DESARROLLO.md`).
3. Leer los archivos existentes que se van a tocar; reutilizar patrones del repo.
4. No ampliar el alcance fuera de la fase activa.

## Calidad de código

- Código limpio, legible y predecible.
- Sin comentarios innecesarios. Comentar solo cuando la intención no sea obvia.
- Sin emojis en código, commits de agente, logs de producción ni documentación técnica del repo (salvo que el usuario lo pida).
- Sin `console.log` de depuración dejados en código final. Errores de servidor: `console.error` con contexto.
- Toda operación async en controladores: `try/catch` y respuesta HTTP coherente.
- Validar entrada del cliente; mensajes de error en español y accionables.
- Transacciones MySQL cuando haya varias escrituras relacionadas.
- No hardcodear secretos. Usar `process.env`.
- Preferir funciones pequeñas y nombres explícitos.
- Frontend: estado local donde baste; contexto solo para estado global real (auth, carrito, moneda).
- No añadir dependencias npm sin necesidad clara de la fase.

## Estructura

```text
galaxy-sport/
  backend/
    config/         # DB, SQL, seeds
    controllers/    # Handlers
    middlewares/
    routes/
    utils/
    scripts/        # Scripts Node (seed, migraciones puntuales)
    server.js
  frontend/
    src/
      components/
      context/
      pages/
      services/
      styles/
  CHECKLIST_DESARROLLO.md
  REGLAS_DESARROLLO.md
```

## Documentación

- Cada fase terminada debe quedar documentada en `docs/FASE_N.md`.
- Al cerrar una fase, marcar tareas como completadas en `CHECKLIST_DESARROLLO.md`.
- Documentar cómo ejecutar seeds, migraciones o variables nuevas de entorno.

## Git y seguridad

- No commitear `.env`, credenciales ni uploads de clientes.
- No hacer commit ni push salvo que el usuario lo pida.

## Checklist rápido pre-PR / pre-entrega de fase

- [ ] Cumple la fase del checklist, sin scope creep
- [ ] Stack respetado (sin librerías nuevas injustificadas)
- [ ] Código en inglés, UI/errores en español
- [ ] Sin emojis ni comentarios superfluos
- [ ] `docs/FASE_N.md` actualizado
- [ ] `CHECKLIST_DESARROLLO.md` marcado
- [ ] Probado en local (API y/o UI según corresponda)
