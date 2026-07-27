import { getExchangeRates } from '../utils/exchangeCacheService.js';

export const getRates = async (req, res) => {
  try {
    const rates = await getExchangeRates();
    res.status(200).json({
      success: true,
      data: rates
    });
  } catch (error) {
    console.error('Error in getRates controller:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor al obtener las tasas de cambio.' });
  }
};
