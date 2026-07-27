import db from '../config/db.js';
import { convertPrices } from '../utils/exchangeCacheService.js';

const ALLOWED_CATEGORIES = ['jersey', 'cap'];

export const getAllProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    const conditions = [];
    const params = [];

    if (category && ALLOWED_CATEGORIES.includes(category)) {
      conditions.push('category = ?');
      params.push(category);
    }

    if (typeof search === 'string' && search.trim()) {
      conditions.push('name LIKE ?');
      params.push(`%${search.trim()}%`);
    }

    // Only show visible products to the store
    conditions.push('hidden = 0');

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const [products] = await db.execute(
      `SELECT * FROM products ${whereClause} ORDER BY created_at DESC`,
      params
    );

    const productsWithPrices = await Promise.all(
      products.map(async (product) => {
        const convertedPrices = await convertPrices(product.precio_venta || product.price);
        return { ...product, convertedPrices };
      })
    );

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

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, description, precio_costo, precio_venta, hidden } = req.body;

    const [existing] = await db.execute('SELECT id FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    const parseNumber = (val) => {
      if (val === undefined || val === null || val === '') return undefined;
      const parsed = parseFloat(val.toString().replace(',', '.'));
      return isNaN(parsed) ? undefined : parsed;
    };

    const fields = [];
    const params = [];

    if (name !== undefined) { fields.push('name = ?'); params.push(name); }
    if (description !== undefined) { fields.push('description = ?'); params.push(description); }
    const parsedCosto = parseNumber(precio_costo);
    if (parsedCosto !== undefined) { fields.push('precio_costo = ?'); params.push(parsedCosto); }
    const parsedVenta = parseNumber(precio_venta);
    if (parsedVenta !== undefined) {
      fields.push('precio_venta = ?'); params.push(parsedVenta);
      fields.push('price = ?'); params.push(parsedVenta);
    }
    if (hidden !== undefined) { fields.push('hidden = ?'); params.push(hidden ? 1 : 0); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No se enviaron campos para actualizar.' });
    }

    params.push(id);
    await db.execute(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, params);

    res.status(200).json({ message: 'Producto actualizado correctamente.' });
  } catch (error) {
    console.error('Error in updateProduct:', error);
    res.status(500).json({ error: 'Error interno del servidor al actualizar el producto.' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.execute('SELECT id FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    await db.execute('DELETE FROM products WHERE id = ?', [id]);
    res.status(200).json({ message: 'Producto eliminado correctamente.' });
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    res.status(500).json({ error: 'Error interno del servidor al eliminar el producto.' });
  }
};
