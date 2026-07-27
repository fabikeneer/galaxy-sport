import express from 'express';
import { createOrder, submitPayment } from '../controllers/orderController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// All order routes require authentication
router.use(authMiddleware);

// POST /api/orders
router.post('/', createOrder);

// POST /api/orders/:id/pay
// Expects form-data with 'receipt' file and text fields
router.post('/:id/pay', (req, res, next) => {
  upload.single('receipt')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, submitPayment);

export default router;
