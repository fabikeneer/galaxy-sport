-- Galaxy Sport — demo catalog seed
-- Safe to re-run: clears catalog tables only (not users, orders, or payments).
-- Prices are in USD (USDT reference). Categories: jersey | cap.

USE galaxy_sport;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE product_variants;
TRUNCATE TABLE products;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO products (
  name,
  description,
  price,
  precio_costo,
  precio_venta,
  category,
  image_url,
  images,
  dorsales
) VALUES
(
  'Camiseta Real Madrid Local 25/26',
  'Camiseta local de alta calidad. Tela respirable, ideal para uso diario o partido. Incluye opción de dorsal personalizado.',
  45.00,
  22.00,
  45.00,
  'jersey',
  'https://images.unsplash.com/photo-1522771739223-2cb979f456c7?auto=format&fit=crop&w=800&q=80',
  JSON_ARRAY(
    'https://images.unsplash.com/photo-1522771739223-2cb979f456c7?auto=format&fit=crop&w=800&q=80'
  ),
  'Vinicius Jr #7, Bellingham #5, Mbappe #9'
),
(
  'Camiseta Barcelona Local 25/26',
  'Camiseta local azulgrana. Corte regular, costuras reforzadas y escudo bordado.',
  42.00,
  20.00,
  42.00,
  'jersey',
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
  JSON_ARRAY(
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80'
  ),
  'Lewandowski #9, Yamal #19, Pedri #8'
),
(
  'Camiseta Vinotinto Visitante',
  'Camiseta de la selección. Diseño visitante, tela ligera y cómoda para el clima venezolano.',
  38.00,
  18.00,
  38.00,
  'jersey',
  'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=800&q=80',
  JSON_ARRAY(
    'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=800&q=80'
  ),
  'Rondon #23, Savarino #7'
),
(
  'Gorra Galaxy Sport Negra',
  'Gorra ajustable con logo Galaxy Sport. Visera curva, ideal para el sol.',
  18.00,
  7.00,
  18.00,
  'cap',
  'https://images.unsplash.com/photo-1588850561407-ed78c456e9c5?auto=format&fit=crop&w=800&q=80',
  JSON_ARRAY(
    'https://images.unsplash.com/photo-1588850561407-ed78c456e9c5?auto=format&fit=crop&w=800&q=80'
  ),
  NULL
),
(
  'Gorra Club Classic Roja',
  'Gorra estilo club con ajuste metálico. Colores vivos y bordado frontal.',
  16.00,
  6.50,
  16.00,
  'cap',
  'https://images.unsplash.com/photo-1575428652377-a2d80e2277b0?auto=format&fit=crop&w=800&q=80',
  JSON_ARRAY(
    'https://images.unsplash.com/photo-1575428652377-a2d80e2277b0?auto=format&fit=crop&w=800&q=80'
  ),
  NULL
);

INSERT INTO product_variants (product_id, model, size, stock)
SELECT p.id, 'Home', 'S', 8 FROM products p WHERE p.name = 'Camiseta Real Madrid Local 25/26'
UNION ALL
SELECT p.id, 'Home', 'M', 12 FROM products p WHERE p.name = 'Camiseta Real Madrid Local 25/26'
UNION ALL
SELECT p.id, 'Home', 'L', 10 FROM products p WHERE p.name = 'Camiseta Real Madrid Local 25/26'
UNION ALL
SELECT p.id, 'Home', 'XL', 6 FROM products p WHERE p.name = 'Camiseta Real Madrid Local 25/26'
UNION ALL
SELECT p.id, 'Home', 'S', 7 FROM products p WHERE p.name = 'Camiseta Barcelona Local 25/26'
UNION ALL
SELECT p.id, 'Home', 'M', 11 FROM products p WHERE p.name = 'Camiseta Barcelona Local 25/26'
UNION ALL
SELECT p.id, 'Home', 'L', 9 FROM products p WHERE p.name = 'Camiseta Barcelona Local 25/26'
UNION ALL
SELECT p.id, 'Home', 'XL', 5 FROM products p WHERE p.name = 'Camiseta Barcelona Local 25/26'
UNION ALL
SELECT p.id, 'Away', 'S', 6 FROM products p WHERE p.name = 'Camiseta Vinotinto Visitante'
UNION ALL
SELECT p.id, 'Away', 'M', 10 FROM products p WHERE p.name = 'Camiseta Vinotinto Visitante'
UNION ALL
SELECT p.id, 'Away', 'L', 8 FROM products p WHERE p.name = 'Camiseta Vinotinto Visitante'
UNION ALL
SELECT p.id, 'Away', 'XL', 4 FROM products p WHERE p.name = 'Camiseta Vinotinto Visitante'
UNION ALL
SELECT p.id, NULL, 'Ajustable', 20 FROM products p WHERE p.name = 'Gorra Galaxy Sport Negra'
UNION ALL
SELECT p.id, NULL, 'Ajustable', 15 FROM products p WHERE p.name = 'Gorra Club Classic Roja';
