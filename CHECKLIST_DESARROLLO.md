# Galaxy Sport — Checklist técnico de desarrollo

Checklist por prioridad y archivo. Marca lo hecho al avanzar.

Antes de implementar cualquier fase: leer `REGLAS_DESARROLLO.md`.
Al cerrar una fase: documentar en `docs/FASE_N.md` y marcar esta checklist.

**MVP listo** cuando:
1. Hay productos con stock
2. Se puede filtrar camisetas/gorras en móvil
3. Se completa pago con comprobante
4. El admin ve la orden, el capture y la marca como completada
5. Nombre/teléfono/dirección quedan guardados en la orden

---

## Ya existe (base)

- [x] Auth: registro / login / JWT
- [x] Catálogo API + detalle de producto (tallas, stock, carrito)
- [x] Checkout con Pago Móvil / Binance + subir comprobante
- [x] Tasas / precios en Bs
- [x] Panel admin: crear productos, métricas, ventas manuales
- [x] BD: users, products, variants, orders, payments

---

## Fase 0 — Poder demo / vender algo

**Estado: COMPLETADA** — ver `docs/FASE_0.md`

| # | Estado | Tarea | Archivos |
|---|--------|--------|----------|
| 0.1 | [x] | Cargar productos demo (fotos, tallas, stock, precios) | Seed + Admin UI → `frontend/src/pages/AdminDashboard.jsx` → `POST /api/products` (`backend/controllers/productController.js`) |
| 0.2 | [x] | Seed SQL de ejemplo + script | `backend/config/seed.sql`, `backend/scripts/seedDatabase.js`, `npm run seed` |

Sin esto, el resto no se puede probar de punta a punta.

---

## Fase 1 — Navegación usable (cliente)

**Estado: COMPLETADA** — ver `docs/FASE_1.md`

| # | Estado | Tarea | Archivos |
|---|--------|--------|----------|
| 1.1 | [x] | Filtro por categoría `jersey` / `cap` en API | `backend/controllers/productController.js` (`getAllProducts` + query `?category=`) |
| 1.2 | [x] | Home lee `?category=` / query y filtra | `frontend/src/pages/Home.jsx`, `frontend/src/components/Navbar.jsx` |
| 1.3 | [x] | Links reales: Camisetas, Gorras, Ofertas, COMPRAR | `frontend/src/components/Navbar.jsx` |
| 1.4 | [x] | Menú hamburguesa móvil | `frontend/src/components/Navbar.jsx`, `frontend/src/styles/theme.css` |
| 1.5 | [x] | Búsqueda básica (nombre) | API: `backend/controllers/productController.js`; UI: `frontend/src/components/Navbar.jsx` + `frontend/src/pages/Home.jsx` |

---

## Fase 2 — Cerrar el ciclo de compra

**Estado: COMPLETADA** — ver `docs/FASE_2.md`

| # | Estado | Tarea | Archivos |
|---|--------|--------|----------|
| 2.1 | [x] | Guardar envío en BD | `backend/config/database.sql` + `backend/scripts/add_shipping_fields.js` |
| 2.2 | [x] | API recibe y guarda envío | `backend/controllers/orderController.js`, `frontend/src/pages/Checkout.jsx` |
| 2.3 | [x] | Unificar costo de envío | `frontend/src/utils/constants.js`, `frontend/src/pages/Cart.jsx`, `frontend/src/pages/Checkout.jsx` |
| 2.4 | [x] | Mostrar total en Bs en checkout | `frontend/src/pages/Checkout.jsx` |
| 2.5 | [x] | Botones "Copiar" datos Pago Móvil / wallet | `frontend/src/pages/Checkout.jsx` |
| 2.6 | [x] | Dorsal en detalle (si categoría jersey) | `frontend/src/pages/ProductDetail.jsx`, `frontend/src/context/AppContext.jsx`, `backend/controllers/orderController.js` |
| 2.7 | [x] | Persistencia del carrito | `frontend/src/context/AppContext.jsx` |

---

## Fase 3 — Admin: verificar y entregar

| # | Estado | Tarea | Archivos |
|---|--------|--------|----------|
| 3.1 | [ ] | Listar órdenes pendientes / a verificar | Ampliar: `backend/controllers/dashboardController.js` + `backend/routes/dashboardRoutes.js` |
| 3.2 | [ ] | Ver comprobante + cambiar status (`paid_to_verify` → `completed` / `cancelled`) | Backend: `backend/controllers/orderController.js` o dashboard; Frontend: tab en `frontend/src/pages/AdminDashboard.jsx` |
| 3.3 | [ ] | Editar / ocultar producto | `backend/controllers/productController.js` (`PUT`/`PATCH`/`DELETE`), `backend/routes/productRoutes.js`, `frontend/src/pages/AdminDashboard.jsx` |
| 3.4 | [ ] | Notificación real (Telegram/WhatsApp webhook) | `backend/utils/notificationService.js`, `backend/.env` |

---

## Fase 4 — Post-compra del cliente

| # | Estado | Tarea | Archivos |
|---|--------|--------|----------|
| 4.1 | [ ] | Mis pedidos | Nuevo: `frontend/src/pages/Orders.jsx`; API: `GET /api/orders` / `GET /api/orders/:id` en `backend/controllers/orderController.js` + `backend/routes/orderRoutes.js`; ruta en `frontend/src/App.jsx` |
| 4.2 | [ ] | Cerrar sesión | `frontend/src/components/Navbar.jsx`, `frontend/src/context/AppContext.jsx` |
| 4.3 | [ ] | Botón WhatsApp flotante (pedido / dudas) | Nuevo: `frontend/src/components/WhatsAppButton.jsx`; usar en `frontend/src/App.jsx` / `frontend/src/pages/Checkout.jsx` |
| 4.4 | [ ] | Footer (zonas, contacto, tallas) | Nuevo: `frontend/src/components/Footer.jsx` + `frontend/src/App.jsx` |

---

## Fase 5 — Mejoras VE / conversión (después del esencial)

| # | Estado | Tarea | Archivos |
|---|--------|--------|----------|
| 5.1 | [ ] | Checkout sin login (invitado) o login más tarde | `backend/routes/orderRoutes.js`, `backend/middlewares/authMiddleware.js`, `frontend/src/pages/Checkout.jsx` |
| 5.2 | [ ] | Copy claro (quitar jerga en botones/errores) | `Home.jsx`, `Login.jsx`, `Cart.jsx`, `Checkout.jsx`, `ProductDetail.jsx` |
| 5.3 | [ ] | Alinear moneda USDT / Binance | `Navbar.jsx`, `ProductCard.jsx`, `ProductDetail.jsx`, `Cart.jsx` |
| 5.4 | [ ] | Ofertas (precio tachado / flag) | BD + `productController.js` + cards |
| 5.5 | [ ] | Filtro por equipo / tags | BD + API + `Home.jsx` |

---

## Mapa rápido: qué tocar más

```text
Prioridad alta
  Navbar.jsx            → menú, filtros, móvil, logout
  Home.jsx              → catálogo filtrado, empty state útil
  Checkout.jsx          → envío real, Bs, copiar pago
  orderController.js    → shipping + dorsal + listar/actualizar status
  database.sql          → columnas de envío
  AdminDashboard.jsx    → verificar pagos
  AppContext.jsx        → carrito persistente

Prioridad media
  ProductDetail.jsx     → dorsal
  productController.js  → filtros, búsqueda, edit/delete
  Orders.jsx (nuevo)    → mis pedidos
  notificationService.js → alerta real al admin

Prioridad baja (pulido)
  Footer, WhatsApp, guest checkout, ofertas, copy
```

---

## Orden sugerido de trabajo

1. Fase 0 — productos — COMPLETADA
2. Fase 1 — navegacion + filtros + movil — COMPLETADA
3. Fase 2 — checkout / envio / carrito
4. Fase 3 — admin verificar pagos
5. Fase 4 — mis pedidos + WhatsApp + footer
6. Fase 5 — conversion VE

---

## Notas UX (contexto Venezuela)

- Priorizar lenguaje claro en botones y errores (menos jerga “galáctica”).
- Destacar Pago Móvil + USDT + precio en Bs.
- WhatsApp como canal de soporte/pedido.
- Mobile-first: casi todo el tráfico será celular.
