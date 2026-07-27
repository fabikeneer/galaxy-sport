import db from '../config/db.js';

// Cache structure
const cache = {
  rates: {
    BCV: null,
    Binance_P2P: null,
    Euro: null
  },
  lastUpdated: 0
};

const TTL = 60 * 1000; // 60 seconds in milliseconds

/**
 * Fetch real rates from ve.dolarapi.com
 */
const fetchExternalRates = async () => {
  console.log('[Cache Service] Fetching from ve.dolarapi.com...');
  
  try {
    const [resDolares, resEuros] = await Promise.all([
      fetch('https://ve.dolarapi.com/v1/dolares'),
      fetch('https://ve.dolarapi.com/v1/euros')
    ]);

    const dolares = await resDolares.json();
    const euros = await resEuros.json();

    const bcvRate = dolares.find(d => d.fuente === 'oficial').promedio;
    const binanceRate = dolares.find(d => d.fuente === 'paralelo').promedio;
    const euroOficialRate = euros.find(e => e.fuente === 'oficial').promedio;

    // Retornamos las tasas puras en Bs
    return {
      BCV: bcvRate,
      Binance_P2P: binanceRate,
      Euro_Bs: euroOficialRate
    };
  } catch (error) {
    console.error('[Cache Service] API Dolar error:', error);
    throw error;
  }
};

/**
 * Función Helper de Conversión de Precios.
 * Recibe el precio_venta en USDT y retorna un objeto con todas las conversiones.
 */
export const convertPrices = async (precio_usdt) => {
  const rates = await getExchangeRates();
  
  // LÓGICA DE NEGOCIO: El monto en Bs SIEMPRE se ancla a la tasa más alta (Binance)
  const montoFijoBs = precio_usdt * rates.Binance_P2P;

  // Calculamos las cotizaciones infladas para compensar la tasa
  const cotizacionBcvUsd = montoFijoBs / rates.BCV;
  const cotizacionEuro = montoFijoBs / rates.Euro_Bs;

  return {
    precio_usdt: parseFloat(precio_usdt),
    // Ambos devuelven el mismo monto en Bs garantizado
    precio_bcv_bs: parseFloat(montoFijoBs.toFixed(2)),
    precio_binance_bs: parseFloat(montoFijoBs.toFixed(2)),
    // La cotización final en Euros para pagar ese mismo monto en Bs
    precio_euro: parseFloat(cotizacionEuro.toFixed(2)),
    // Nueva propiedad para el frontend
    cotizacion_bcv_usd: parseFloat(cotizacionBcvUsd.toFixed(2))
  };
};

/**
 * Obtiene las tasas de cambio aplicando la lógica de caché de 60 segundos.
 */
export const getExchangeRates = async () => {
  const now = Date.now();

  // 1. Verificamos si la caché es válida (tiene datos y no ha pasado el TTL)
  if (cache.lastUpdated > 0 && (now - cache.lastUpdated) < TTL) {
    console.log('[Cache Service] Retornando tasas desde la memoria caché (HIT)');
    return cache.rates;
  }

  // 2. Si expiró o no existe, refrescamos los datos consultando los proveedores
  console.log('[Cache Service] Caché expirada o vacía. Obteniendo nuevas tasas (MISS)...');
  
  try {
    const newRates = await fetchExternalRates();

    // 3. Actualizamos la base de datos (tabla 'exchange_rates')
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      for (const [currency, rate] of Object.entries(newRates)) {
        // Buscamos si la moneda ya existe en la BD
        const [rows] = await connection.execute('SELECT id FROM exchange_rates WHERE currency = ?', [currency]);
        
        if (rows.length > 0) {
          // Si existe, actualizamos su valor y timestamp (automático)
          await connection.execute('UPDATE exchange_rates SET rate = ? WHERE currency = ?', [rate, currency]);
        } else {
          // Si no existe, la insertamos
          await connection.execute('INSERT INTO exchange_rates (currency, rate) VALUES (?, ?)', [currency, rate]);
        }
      }

      await connection.commit();
      console.log('[Cache Service] Base de datos actualizada con las nuevas tasas.');
    } catch (dbError) {
      await connection.rollback();
      console.error('[Cache Service] Error actualizando la base de datos:', dbError);
      throw dbError;
    } finally {
      connection.release();
    }

    // 4. Renovamos la memoria caché y el timestamp
    cache.rates = newRates;
    cache.lastUpdated = Date.now();

    return cache.rates;

  } catch (error) {
    console.error('[Cache Service] Error en el flujo de obtención de tasas:', error);
    
    // Fallback: Si la API externa falla pero tenemos datos viejos en caché, los retornamos
    if (cache.lastUpdated > 0) {
      console.log('[Cache Service] Fallback: Retornando datos expirados debido a error de red.');
      return cache.rates;
    }
    
    throw new Error('No se pudieron obtener las tasas de cambio de los proveedores externos.');
  }
};
