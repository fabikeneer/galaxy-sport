import express from 'express';
import { getRates } from '../controllers/exchangeController.js';

const router = express.Router();

// GET /api/exchange
router.get('/', getRates);

export default router;
