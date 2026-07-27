import db from '../config/db.js';

export const getDashboardMetrics = async (req, res) => {
  try {
    // 1. Total Products in Catalog
    const [[{ totalProducts }]] = await db.query('SELECT COUNT(*) AS totalProducts FROM products');

    // 2. Sales and Revenue (using order_items for completed/paid orders)
    // We will consider 'paid_to_verify' and 'completed' as valid sales for revenue/profit.
    const [salesResult] = await db.query(`
      SELECT 
        SUM(oi.quantity) AS totalSales,
        SUM(oi.quantity * oi.precio_venta) AS totalRevenue,
        SUM(oi.quantity * (oi.precio_venta - oi.precio_costo)) AS netProfit
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status IN ('paid_to_verify', 'completed')
    `);

    const metrics = {
      totalProducts: totalProducts || 0,
      totalSales: salesResult[0].totalSales || 0,
      totalRevenue: salesResult[0].totalRevenue || 0,
      netProfit: salesResult[0].netProfit || 0
    };

    res.status(200).json(metrics);
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ error: 'Error interno del servidor al obtener métricas del dashboard.' });
  }
};

export const getSalesHistory = async (req, res) => {
  try {
    const [sales] = await db.query(`
      SELECT 
        oi.id,
        p.name AS productName,
        p.category,
        pv.size AS variantSize,
        oi.dorsal,
        oi.quantity,
        oi.precio_venta,
        (oi.quantity * oi.precio_venta) AS total,
        (oi.quantity * (oi.precio_venta - oi.precio_costo)) AS profit,
        o.status,
        o.created_at
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      JOIN product_variants pv ON oi.variant_id = pv.id
      ORDER BY o.created_at DESC
    `);
    res.status(200).json(sales);
  } catch (error) {
    console.error('Error fetching sales history:', error);
    res.status(500).json({ error: 'Error interno del servidor al obtener el historial de ventas.' });
  }
};

export const registerManualSale = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { product_id, variant_id, quantity, dorsal } = req.body;

    if (!product_id || !variant_id || !quantity || quantity <= 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Faltan datos obligatorios para registrar la venta.' });
    }

    // 1. Get variant and product info
    const [variants] = await connection.execute(
      `SELECT pv.*, p.precio_costo, p.precio_venta 
       FROM product_variants pv 
       JOIN products p ON pv.product_id = p.id 
       WHERE pv.id = ? AND pv.product_id = ?`, 
      [variant_id, product_id]
    );

    if (variants.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Variante no encontrada.' });
    }

    const variant = variants[0];

    // 2. Check stock
    if (variant.stock < quantity) {
      await connection.rollback();
      return res.status(400).json({ error: `Stock insuficiente. Disponible: ${variant.stock}` });
    }

    // 3. Deduct stock
    await connection.execute(
      'UPDATE product_variants SET stock = stock - ? WHERE id = ?',
      [quantity, variant_id]
    );

    const total = parseFloat(variant.precio_venta) * quantity;

    // 4. Create an order (we use a generic user_id=1 for manual admin sales assuming admin is ID 1)
    // In a real app we might have a specific flag or nullable user_id, but here it's NOT NULL.
    const [orderResult] = await connection.execute(
      'INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)',
      [1, total, 'completed'] // manual sales are assumed completed
    );

    const orderId = orderResult.insertId;

    // 5. Insert order item
    await connection.execute(
      'INSERT INTO order_items (order_id, product_id, variant_id, quantity, precio_costo, precio_venta, dorsal) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [orderId, product_id, variant_id, quantity, variant.precio_costo, variant.precio_venta, dorsal || null]
    );

    await connection.commit();

    res.status(201).json({ message: 'Venta manual registrada exitosamente.' });
  } catch (error) {
    await connection.rollback();
    console.error('Error registering manual sale:', error);
    res.status(500).json({ error: 'Error interno del servidor al registrar la venta manual.' });
  } finally {
    connection.release();
  }
};
