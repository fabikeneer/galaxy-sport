import express from 'express';
import { getDashboardMetrics, getSalesHistory, registerManualSale, getOrders, updateOrderStatus } from '../controllers/dashboardController.js';

const router = express.Router();

// GET /api/dashboard/metrics
router.get('/metrics', getDashboardMetrics);

// GET /api/dashboard/sales
router.get('/sales', getSalesHistory);

// POST /api/dashboard/sales/manual
router.post('/sales/manual', registerManualSale);

// GET /api/dashboard/orders
router.get('/orders', getOrders);

// PATCH /api/dashboard/orders/:id/status
router.patch('/orders/:id/status', updateOrderStatus);

export default router;
