# Fase 0 — Catalogo demo

## Objetivo

Tener productos con stock, precios y variantes para probar el flujo de compra de punta a punta.

## Entregado

| Item | Detalle |
|------|---------|
| 0.1 | Catalogo demo cargado (3 camisetas, 2 gorras) con tallas y stock |
| 0.2 | Seed SQL + script Node para repetir la carga |

Tambien se crearon las reglas de desarrollo del proyecto.

## Como ejecutar el seed

Requisitos: MySQL de Laragon en marcha y `backend/.env` configurado.

```bash
npm run seed
```

El script lee `backend/config/seed.sql`, vacia solo `products` y `product_variants`, e inserta el catalogo demo. No borra `users`, `orders` ni `payments`.

## Productos incluidos

| Nombre | Categoria | Precio venta (USD) | Variantes |
|--------|-----------|--------------------|-----------|
| Camiseta Real Madrid Local 25/26 | jersey | 45.00 | S, M, L, XL |
| Camiseta Barcelona Local 25/26 | jersey | 42.00 | S, M, L, XL |
| Camiseta Vinotinto Visitante | jersey | 38.00 | S, M, L, XL |
| Gorra Galaxy Sport Negra | cap | 18.00 | Ajustable |
| Gorra Club Classic Roja | cap | 16.00 | Ajustable |

Las imagenes usan URLs publicas de Unsplash (placeholder). En produccion conviene subir fotos propias desde el panel admin (`POST /api/products` con multer).

## Archivos tocados / creados

| Archivo | Rol |
|---------|-----|
| `backend/config/seed.sql` | Datos SQL del catalogo |
| `backend/scripts/seedDatabase.js` | Ejecutor Node (ESM + mysql2 + dotenv) |
| `package.json` | Script `npm run seed` |
| `backend/config/database.sql` | Tabla `exchange_rates` (faltaba y rompia el listado) |
| `backend/utils/exchangeCacheService.js` | Persistencia de tasas no bloquea el catalogo |
| `REGLAS_DESARROLLO.md` | Reglas humanas del proyecto |
| `.cursor/rules/desarrollo.mdc` | Reglas siempre activas para el agente |
| `docs/FASE_0.md` | Esta documentacion |

## Verificacion

1. `npm run seed` imprime conteo de productos y variantes.
2. Abrir `http://localhost:5000/api/products` y confirmar JSON con 5 items.
3. Abrir `http://localhost:5173/` y ver tarjetas en "EN TENDENCIA".
4. Entrar a un producto y comprobar tallas / stock.

## Admin (carga manual adicional)

Credenciales de prueba creadas por el servidor si no existen:

- Email: `admin@galaxysport.com`
- Password: `admin`

Desde `/admin/dashboard` se pueden crear mas productos con fotos locales.

## Fuera de alcance (fases siguientes)

- Filtros de navegacion, menu movil, busqueda
- Envio en ordenes, verificar pagos, mis pedidos
