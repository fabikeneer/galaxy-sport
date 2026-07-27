import db from '../config/db.js';

const cache = {
  rates: {
    BCV: null,
    Binance_P2P: null,
    Euro: null
  },
  lastUpdated: 0
};

const TTL = 60 * 1000;

const fetchExternalRates = async () => {
  const [resDolares, resEuros] = await Promise.all([
    fetch('https://ve.dolarapi.com/v1/dolares'),
    fetch('https://ve.dolarapi.com/v1/euros')
  ]);

  const dolares = await resDolares.json();
  const euros = await resEuros.json();

  const bcvRate = dolares.find((d) => d.fuente === 'oficial').promedio;
  const binanceRate = dolares.find((d) => d.fuente === 'paralelo').promedio;
  const euroOficialRate = euros.find((e) => e.fuente === 'oficial').promedio;

  return {
    BCV: bcvRate,
    Binance_P2P: binanceRate,
    Euro_Bs: euroOficialRate
  };
};

const persistRates = async (newRates) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    for (const [currency, rate] of Object.entries(newRates)) {
      const [rows] = await connection.execute(
        'SELECT id FROM exchange_rates WHERE currency = ?',
        [currency]
      );

      if (rows.length > 0) {
        await connection.execute(
          'UPDATE exchange_rates SET rate = ? WHERE currency = ?',
          [rate, currency]
        );
      } else {
        await connection.execute(
          'INSERT INTO exchange_rates (currency, rate) VALUES (?, ?)',
          [currency, rate]
        );
      }
    }

    await connection.commit();
  } catch (dbError) {
    await connection.rollback();
    console.error('Failed to persist exchange rates:', dbError.message);
  } finally {
    connection.release();
  }
};

export const convertPrices = async (precio_usdt) => {
  const rates = await getExchangeRates();
  const montoFijoBs = precio_usdt * rates.Binance_P2P;
  const cotizacionBcvUsd = montoFijoBs / rates.BCV;
  const cotizacionEuro = montoFijoBs / rates.Euro_Bs;

  return {
    precio_usdt: parseFloat(precio_usdt),
    precio_bcv_bs: parseFloat(montoFijoBs.toFixed(2)),
    precio_binance_bs: parseFloat(montoFijoBs.toFixed(2)),
    precio_euro: parseFloat(cotizacionEuro.toFixed(2)),
    cotizacion_bcv_usd: parseFloat(cotizacionBcvUsd.toFixed(2))
  };
};

export const getExchangeRates = async () => {
  const now = Date.now();

  if (cache.lastUpdated > 0 && now - cache.lastUpdated < TTL) {
    return cache.rates;
  }

  try {
    const newRates = await fetchExternalRates();
    await persistRates(newRates);

    cache.rates = newRates;
    cache.lastUpdated = Date.now();

    return cache.rates;
  } catch (error) {
    console.error('Failed to refresh exchange rates:', error.message);

    if (cache.lastUpdated > 0) {
      return cache.rates;
    }

    throw new Error('No se pudieron obtener las tasas de cambio.');
  }
};
