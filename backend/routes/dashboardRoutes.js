import express from 'express';
import { getDashboardMetrics, getSalesHistory, registerManualSale } from '../controllers/dashboardController.js';

const router = express.Router();

// GET /api/dashboard/metrics
router.get('/metrics', getDashboardMetrics);

// GET /api/dashboard/sales
router.get('/sales', getSalesHistory);

// POST /api/dashboard/sales/manual
router.post('/sales/manual', registerManualSale);

export default router;
