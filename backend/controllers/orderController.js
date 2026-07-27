import db from '../config/db.js';
import { sendPaymentNotification } from '../utils/notificationService.js';

export const createOrder = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { items, shipping_name, shipping_phone, shipping_address } = req.body;
    const userId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'La orden debe contener al menos un producto.' });
    }

    if (!shipping_name || !shipping_phone || !shipping_address) {
      await connection.rollback();
      return res.status(400).json({ error: 'El nombre, teléfono y dirección de envío son obligatorios.' });
    }

    let total = 0;
    let itemsToInsert = [];

    for (const item of items) {
      const { variant_id, quantity, dorsal } = item;

      const [variants] = await connection.execute(
        `SELECT pv.*, p.price, p.precio_costo, p.precio_venta 
         FROM product_variants pv 
         JOIN products p ON pv.product_id = p.id 
         WHERE pv.id = ?`,
        [variant_id]
      );

      if (variants.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: `La variante con ID ${variant_id} no existe.` });
      }

      const variant = variants[0];

      if (variant.stock < quantity) {
        await connection.rollback();
        return res.status(400).json({ error: `Stock insuficiente para la variante ID ${variant_id}. Disponible: ${variant.stock}` });
      }

      await connection.execute(
        'UPDATE product_variants SET stock = stock - ? WHERE id = ?',
        [quantity, variant_id]
      );

      const itemPrice = parseFloat(variant.precio_venta || variant.price);
      total += itemPrice * quantity;

      itemsToInsert.push({
        product_id: variant.product_id,
        variant_id,
        quantity,
        precio_costo: variant.precio_costo || 0,
        precio_venta: itemPrice,
        dorsal: dorsal || null
      });
    }

    const [orderResult] = await connection.execute(
      'INSERT INTO orders (user_id, total, status, shipping_name, shipping_phone, shipping_address) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, total, 'pending', shipping_name, shipping_phone, shipping_address]
    );

    const orderId = orderResult.insertId;

    for (const data of itemsToInsert) {
      await connection.execute(
        'INSERT INTO order_items (order_id, product_id, variant_id, quantity, precio_costo, precio_venta, dorsal) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [orderId, data.product_id, data.variant_id, data.quantity, data.precio_costo, data.precio_venta, data.dorsal]
      );
    }

    await connection.commit();

    res.status(201).json({
      message: 'Orden creada exitosamente.',
      orderId: orderResult.insertId,
      total
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error in createOrder:', error);
    res.status(500).json({ error: 'Error interno del servidor al crear la orden.' });
  } finally {
    connection.release();
  }
};

export const submitPayment = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const orderId = req.params.id;
    const { payment_method, reference, amount } = req.body;
    const userId = req.user.id;
    
    // Check if file was uploaded
    if (!req.file) {
      await connection.rollback();
      return res.status(400).json({ error: 'Debe adjuntar un comprobante de pago.' });
    }

    const receiptUrl = `/uploads/${req.file.filename}`;

    if (!payment_method || !amount) {
      await connection.rollback();
      return res.status(400).json({ error: 'El método de pago y el monto son obligatorios.' });
    }

    // Verify order exists and belongs to user
    const [orders] = await connection.execute('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, userId]);
    
    if (orders.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Orden no encontrada o no pertenece al usuario actual.' });
    }

    const order = orders[0];

    // Check if order is already paid or cancelled
    if (order.status !== 'pending') {
      await connection.rollback();
      return res.status(400).json({ error: `No se puede procesar el pago. El estado actual de la orden es: ${order.status}` });
    }

    // Insert payment record
    await connection.execute(
      'INSERT INTO payments (order_id, payment_method, reference, receipt_url, amount) VALUES (?, ?, ?, ?, ?)',
      [orderId, payment_method, reference || null, receiptUrl, amount]
    );

    // Update order status
    await connection.execute(
      "UPDATE orders SET status = 'paid_to_verify' WHERE id = ?",
      [orderId]
    );

    await connection.commit();

    // Fetch user details for notification
    const [users] = await connection.execute('SELECT name FROM users WHERE id = ?', [userId]);
    const userName = users.length > 0 ? users[0].name : 'Desconocido';

    // Send notification
    sendPaymentNotification(
      { id: order.id, userId, userName },
      { reference, amount, receipt_url: receiptUrl }
    );

    res.status(200).json({
      message: 'Comprobante subido exitosamente. El pago está en verificación.',
      receiptUrl
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error in submitPayment:', error);
    res.status(500).json({ error: 'Error interno del servidor al procesar el pago.' });
  } finally {
    connection.release();
  }
};
