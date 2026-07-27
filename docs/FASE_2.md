# FASE 2 — Cerrar el ciclo de compra

**Estado:** Completada  
**Fecha:** 2026-07-27

---

## Tareas completadas

### 2.1 — Datos de envio en BD
- Agregadas columnas `shipping_name VARCHAR(150)`, `shipping_phone VARCHAR(30)`, `shipping_address TEXT` a la tabla `orders`.
- Script de migracion: `backend/scripts/add_shipping_fields.js` (ejecutar una sola vez).
- Esquema canonical actualizado: `backend/config/database.sql`.

### 2.2 — API recibe y guarda datos de envio
- `backend/controllers/orderController.js` — `createOrder` ahora recibe `shipping_name`, `shipping_phone`, `shipping_address` del body y los guarda en la orden. Valida que los tres campos esten presentes.

### 2.3 — Costo de envio unificado
- Creado `frontend/src/utils/constants.js` con `SHIPPING_COST_USD = 2.00`.
- `Cart.jsx` y `Checkout.jsx` importan esta constante. Ya no hay valores hardcodeados inconsistentes.

### 2.4 — Total en Bs en checkout
- `Checkout.jsx` muestra el equivalente en Bs bajo el total en USDT cuando el usuario tiene seleccionada una moneda distinta a USDT.

### 2.5 — Botones Copiar datos de pago
- Componente interno `CopyButton` en `Checkout.jsx`.
- Copia datos de Pago Movil (banco, telefono, cedula) y wallet de Binance con `navigator.clipboard.writeText`.
- Feedback visual: icono y texto cambian a "Copiado" por 2 segundos.

### 2.6 — Campo dorsal en detalle del producto
- `ProductDetail.jsx`: si `product.category === 'jersey'` y hay variante seleccionada, aparece un campo texto opcional con `datalist` de sugerencias tomadas del campo `dorsales` del producto.
- `AppContext.jsx`: `addToCart` acepta cuarto argumento `dorsal`.
- `Checkout.jsx`: mapea `dorsal` por item al enviar la orden.
- `orderController.js`: guarda `dorsal` en cada `order_item` (columna ya existente).

### 2.7 — Persistencia del carrito
- `AppContext.jsx`: el carrito se inicializa desde `localStorage` y se guarda automaticamente ante cada cambio.
- `clearCart` limpia tambien `localStorage`.

---

## Archivos modificados

| Archivo | Cambios |
|---------|---------|
| `backend/config/database.sql` | Columnas de envio en `orders` |
| `backend/scripts/add_shipping_fields.js` | Script de migracion (nuevo) |
| `backend/controllers/orderController.js` | Shipping + dorsal en createOrder |
| `frontend/src/utils/constants.js` | Constante SHIPPING_COST_USD (nuevo) |
| `frontend/src/context/AppContext.jsx` | Persistencia carrito + dorsal en addToCart |
| `frontend/src/pages/ProductDetail.jsx` | Campo dorsal para jerseys |
| `frontend/src/pages/Cart.jsx` | Costo envio desde constante |
| `frontend/src/pages/Checkout.jsx` | Shipping real, Bs, copiar, dorsal, copy limpio |

---

## Para ejecutar la migracion (si la BD no fue actualizada)

```bash
node backend/scripts/add_shipping_fields.js
```

---

## Configuracion a revisar

- `SHIPPING_COST_USD` en `frontend/src/utils/constants.js` — ajustar al valor real del negocio.
- Datos de Pago Movil en `Checkout.jsx` (constante `PAGOMOVIL`) — actualizar con datos reales.
- Wallet de Binance en `Checkout.jsx` (constante `BINANCE_WALLET`) — actualizar con direccion real.
