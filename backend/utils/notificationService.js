const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export const sendPaymentNotification = async (orderData, paymentData) => {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('[notificationService] TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID no configurados en .env. Notificacion omitida.');
    return;
  }

  const text = [
    `*Nueva orden a verificar — #${orderData.id}*`,
    `Cliente: ${orderData.userName}`,
    `Referencia: ${paymentData.reference || 'N/A'}`,
    `Monto declarado: $${paymentData.amount}`,
    `Comprobante: http://localhost:5000${paymentData.receipt_url}`
  ].join('\n');

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'Markdown'
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[notificationService] Error al enviar mensaje Telegram:', err);
    }
  } catch (error) {
    console.error('[notificationService] Fallo de conexion con Telegram:', error.message);
  }
};
