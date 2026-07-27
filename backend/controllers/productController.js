import db from '../config/db.js';
import { convertPrices } from '../utils/exchangeCacheService.js';

export const getAllProducts = async (req, res) => {
  try {
    const [products] = await db.execute('SELECT * FROM products ORDER BY created_at DESC');
    
    const productsWithPrices = await Promise.all(products.map(async (product) => {
      const convertedPrices = await convertPrices(product.precio_venta || product.price);
      return { ...product, convertedPrices };
    }));

    res.status(200).json(productsWithPrices);
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    res.status(500).json({ error: 'Error interno del servidor al obtener los productos.' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get the product
    const [products] = await db.execute('SELECT * FROM products WHERE id = ?', [id]);
    
    if (products.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    const product = products[0];

    product.convertedPrices = await convertPrices(product.precio_venta || product.price);

    // Get the variants for this product
    const [variants] = await db.execute('SELECT * FROM product_variants WHERE product_id = ?', [id]);
    
    // Attach variants to the product object
    product.variants = variants;

    res.status(200).json(product);
  } catch (error) {
    console.error('Error in getProductById:', error);
    res.status(500).json({ error: 'Error interno del servidor al obtener el producto.' });
  }
};

export const createProduct = async (req, res) => {
  const connection = await db.getConnection();
  try {
    // Start transaction
    await connection.beginTransaction();

    let { name, description, price, precio_costo, precio_venta, category, image_url, variants, dorsales } = req.body;

    let finalImageUrl = image_url || null;
    let imagesArray = [];

    // Ahora recibimos múltiples archivos mediante upload.array('images')
    if (req.files && req.files.length > 0) {
      imagesArray = req.files.map(f => '/uploads/' + f.filename);
      finalImageUrl = imagesArray[0]; // La primera imagen es la principal
    } else if (image_url) {
      imagesArray = [image_url];
    }

    // Sanitize and parse numbers
    const parseNumber = (val) => {
      if (!val) return null;
      if (typeof val === 'number') return val;
      const parsed = parseFloat(val.toString().replace(',', '.'));
      return isNaN(parsed) ? null : parsed;
    };

    const parsedPrice = parseNumber(price);
    const parsedCosto = parseNumber(precio_costo);
    const parsedVenta = parseNumber(precio_venta);

    if (typeof variants === 'string') {
      try {
        variants = JSON.parse(variants);
      } catch (e) {
        console.error('Error parsing variants:', e);
        variants = [];
      }
    }

    if (!name || parsedPrice === null || !category) {
      await connection.rollback();
      return res.status(400).json({ error: 'El nombre, precio y categoría son obligatorios.' });
    }

    // Insert the main product
    const [productResult] = await connection.execute(
      'INSERT INTO products (name, description, price, precio_costo, precio_venta, category, image_url, images, dorsales) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description || null, parsedPrice, parsedCosto, parsedVenta, category, finalImageUrl, JSON.stringify(imagesArray), dorsales || null]
    );

    const productId = productResult.insertId;

    // Insert variants if provided
    if (variants && Array.isArray(variants) && variants.length > 0) {
      for (const variant of variants) {
        const { model, size, stock } = variant;
        
        if (!size || stock === undefined || stock === null || isNaN(stock)) {
          await connection.rollback();
          return res.status(400).json({ error: 'Cada variante debe tener una talla (size) y un stock numérico válido.' });
        }

        await connection.execute(
          'INSERT INTO product_variants (product_id, model, size, stock) VALUES (?, ?, ?, ?)',
          [productId, model || null, size, parseInt(stock)]
        );
      }
    }

    // Commit transaction
    await connection.commit();

    res.status(201).json({
      message: 'Producto creado exitosamente.',
      productId: productId
    });
  } catch (error) {
    // Rollback transaction on error
    await connection.rollback();
    console.error('Error in createProduct:', error);
    res.status(500).json({ error: 'Error interno del servidor al crear el producto.' });
  } finally {
    // Release the connection back to the pool
    connection.release();
  }
};
