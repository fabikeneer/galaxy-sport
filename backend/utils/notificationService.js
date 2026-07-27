export const sendPaymentNotification = async (orderData, paymentData) => {
  try {
    console.log('\n=======================================');
    console.log('🔔 NUEVA NOTIFICACIÓN DE PAGO RECIBIDO 🔔');
    console.log('=======================================');
    console.log(`ID de Orden: ${orderData.id}`);
    console.log(`Cliente: ${orderData.userName} (ID: ${orderData.userId})`);
    console.log(`Referencia de Pago: ${paymentData.reference}`);
    console.log(`Monto Declarado: $${paymentData.amount}`);
    console.log(`URL del Comprobante: ${paymentData.receipt_url}`);
    console.log('=======================================\n');

    // TODO: En producción, aquí se realizaría una petición HTTP (fetch/axios) 
    // a un webhook de Telegram, Discord, o se enviaría un correo electrónico.
    /*
    Ejemplo con Fetch hacia un Webhook de Discord/Telegram:
    
    const webhookUrl = process.env.NOTIFICATION_WEBHOOK_URL;
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `Nuevo pago a verificar para la orden #${orderData.id} por $${paymentData.amount}`
      })
    });
    */

  } catch (error) {
    console.error('Error al enviar la notificación de pago:', error);
  }
};
