# Fase 1 — Navegacion usable

## Objetivo

Que el cliente pueda filtrar el catalogo, buscar por nombre y usar el menu en movil.

## Entregado

| Item | Detalle |
|------|---------|
| 1.1 | API `GET /api/products?category=jersey\|cap` |
| 1.2 | Home lee `category`, `search` y `view` desde la URL |
| 1.3 | Links reales: Inicio, Camisetas, Gorras, Nuevos, Ofertas, COMPRAR |
| 1.4 | Menu hamburguesa en viewport menor a 900px |
| 1.5 | Busqueda por nombre (icono lupa + formulario) |

## Query params

| Param | Valores | Efecto |
|-------|---------|--------|
| `category` | `jersey`, `cap` | Filtra por categoria en MySQL |
| `search` | texto | `LIKE %texto%` sobre `products.name` |
| `view` | `new`, `offers` | Cambia titulo del catalogo; listado completo hasta Fase 5 (ofertas reales) |

Ejemplos:

- `/api/products?category=jersey`
- `/api/products?search=Madrid`
- `http://localhost:5173/?category=cap`
- `http://localhost:5173/?search=gorra`

## Archivos

| Archivo | Cambio |
|---------|--------|
| `backend/controllers/productController.js` | Filtros `category` y `search` |
| `frontend/src/components/Navbar.jsx` | Links, busqueda, menu movil |
| `frontend/src/pages/Home.jsx` | Consume query params y actualiza catalogo |
| `frontend/src/styles/theme.css` | Estilos navbar + home responsive |

## Verificacion

1. `GET /api/products?category=jersey` → solo camisetas.
2. `GET /api/products?category=cap` → solo gorras.
3. `GET /api/products?search=Madrid` → coincide por nombre.
4. En desktop: links del nav cambian el catalogo y hacen scroll a `#catalog`.
5. En movil (menor a 900px): boton menu abre/cierra enlaces, moneda y COMPRAR.
6. Icono lupa abre busqueda; enviar navega a `/?search=...`.

## Notas

- `view=offers` aún no aplica descuentos en BD (Fase 5). Muestra el catalogo con titulo Ofertas.
- `view=new` usa el orden por defecto `created_at DESC` del API.
- No se agregaron dependencias npm.

## Fuera de alcance

- Checkout, envio, admin de pedidos (Fase 2+)
- Campo de oferta / precio tachado (Fase 5)
