import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UploadCloud, CheckCircle, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import api from '../services/api';

const Checkout = () => {
  const { cart, clearCart, token } = useContext(AppContext);
  const navigate = useNavigate();

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    reference: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('pagomovil'); // 'pagomovil' | 'binance'
  const [receiptFile, setReceiptFile] = useState(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Totals
  const subtotal = cart.reduce((total, item) => total + (parseFloat(item.product.price) * item.quantity), 0);
  const shipping = subtotal > 0 ? 15.00 : 0;
  const total = subtotal + shipping;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!receiptFile) {
      setError('Por favor, sube el comprobante de pago.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Create the Order
      const items = cart.map(item => ({
        variant_id: item.variant.id,
        quantity: item.quantity
      }));

      const orderRes = await api.post('/orders', { items });
      const orderId = orderRes.data.orderId;

      // Step 2: Submit Payment Receipt
      const paymentData = new FormData();
      paymentData.append('payment_method', paymentMethod);
      paymentData.append('reference', formData.reference);
      paymentData.append('amount', total);
      paymentData.append('receipt', receiptFile);

      await api.post(`/orders/${orderId}/pay`, paymentData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess(true);
      clearCart();

    } catch (err) {
      console.error('Error in checkout:', err);
      setError(err.response?.data?.error || 'Ocurrió un error al procesar tu orden. Asegúrate de estar logueado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center', minHeight: '60vh' }}>
        <ShieldCheck size={80} color="var(--accent-red)" style={{ marginBottom: '20px' }} />
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '15px' }}>ACCESO RESTRINGIDO</h2>
        <p style={{ color: 'var(--text-silver)', fontSize: '1.2rem', marginBottom: '40px' }}>
          Debes iniciar sesión en la base para poder procesar la transmisión de tu orden.
        </p>
        <Link to="/login" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
          IR AL LOGIN
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '30px', borderRadius: '50%', marginBottom: '30px', boxShadow: '0 0 50px rgba(16, 185, 129, 0.2)' }}>
          <CheckCircle size={100} color="#10B981" />
        </div>
        <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '15px', color: 'var(--text-white)' }}>
          ¡ORDEN PROCESADA CON ÉXITO!
        </h2>
        <p style={{ color: 'var(--text-silver)', fontSize: '1.2rem', maxWidth: '600px', marginBottom: '40px' }}>
          Hemos recibido tus coordenadas y tu comprobante de pago. Nuestro equipo verificará el pago en las próximas horas y preparará tu equipo para el envío intergaláctico.
        </p>
        <Link to="/" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
          VOLVER AL CATÁLOGO
        </Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center', minHeight: '60vh' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '20px' }}>Tu carrito está vacío</h2>
        <button onClick={() => navigate('/')} className="btn btn-primary">Volver a la tienda</button>
      </div>
    );
  }

  // Common input styles
  const inputStyle = {
    width: '100%',
    padding: '16px',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    color: 'var(--text-white)',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.3s'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    color: 'var(--text-silver)',
    fontSize: '0.9rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '1px'
  };

  return (
    <div className="container" style={{ padding: '60px 24px 120px 24px' }}>
      <h1 style={{ fontSize: 'clamp(2rem, 3vw, 3rem)', fontWeight: 800, margin: '0 0 40px 0', color: 'var(--text-white)' }}>
        SECURE <span style={{ color: 'var(--accent-red)' }}>CHECKOUT</span>
      </h1>

      <form onSubmit={handleSubmit} className="cart-grid">
        
        {/* Left Column: Form Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          {/* Section 1: Delivery Info */}
          <div style={{ background: 'var(--bg-space-lighter)', padding: '32px', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--accent-red)' }}>01.</span> DATOS DE ENVÍO
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Nombre Completo</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} style={inputStyle} placeholder="Ej. Luke Skywalker" />
              </div>
              <div>
                <label style={labelStyle}>Teléfono de Contacto</label>
                <input required type="text" name="phone" value={formData.phone} onChange={handleInputChange} style={inputStyle} placeholder="+58 412-1234567" />
              </div>
              <div>
                <label style={labelStyle}>Dirección de Entrega (Maracay/Aragua)</label>
                <textarea required name="address" value={formData.address} onChange={handleInputChange} style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} placeholder="Específica tu zona y punto de referencia..."></textarea>
              </div>
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div style={{ background: 'var(--bg-space-lighter)', padding: '32px', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--accent-red)' }}>02.</span> MÉTODO DE PAGO
            </h2>
            
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
              <button type="button" onClick={() => setPaymentMethod('pagomovil')}
                style={{
                  flex: 1, padding: '16px', borderRadius: '12px', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', transition: 'all 0.3s',
                  background: paymentMethod === 'pagomovil' ? 'rgba(229, 9, 20, 0.1)' : 'transparent',
                  border: `2px solid ${paymentMethod === 'pagomovil' ? 'var(--accent-red)' : 'var(--glass-border)'}`,
                  color: paymentMethod === 'pagomovil' ? 'var(--accent-red)' : 'var(--text-silver)'
                }}
              >
                PAGO MÓVIL
              </button>
              <button type="button" onClick={() => setPaymentMethod('binance')}
                style={{
                  flex: 1, padding: '16px', borderRadius: '12px', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', transition: 'all 0.3s',
                  background: paymentMethod === 'binance' ? 'rgba(243, 186, 47, 0.1)' : 'transparent',
                  border: `2px solid ${paymentMethod === 'binance' ? '#F3BA2F' : 'var(--glass-border)'}`,
                  color: paymentMethod === 'binance' ? '#F3BA2F' : 'var(--text-silver)'
                }}
              >
                BINANCE PAY
              </button>
            </div>

            {/* Payment Details View */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '24px', borderRadius: '16px', marginBottom: '30px', border: '1px solid var(--glass-border)' }}>
              {paymentMethod === 'pagomovil' ? (
                <div>
                  <h3 style={{ color: 'var(--text-white)', marginBottom: '15px' }}>Datos para Pago Móvil</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                    <div><span style={{ color: 'var(--text-silver)', display: 'block', fontSize: '0.85rem' }}>Banco:</span> <strong style={{ color: 'white', fontSize: '1.1rem' }}>Banesco (0134)</strong></div>
                    <div><span style={{ color: 'var(--text-silver)', display: 'block', fontSize: '0.85rem' }}>Teléfono:</span> <strong style={{ color: 'white', fontSize: '1.1rem' }}>0412-1234567</strong></div>
                    <div><span style={{ color: 'var(--text-silver)', display: 'block', fontSize: '0.85rem' }}>Cédula:</span> <strong style={{ color: 'white', fontSize: '1.1rem' }}>V-20.123.456</strong></div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                  <div>
                    <h3 style={{ color: 'var(--text-white)', marginBottom: '10px' }}>Binance USDT (TRC20)</h3>
                    <p style={{ color: 'var(--text-silver)', margin: '0 0 8px 0', fontSize: '0.9rem' }}>Wallet Address:</p>
                    <code style={{ background: 'var(--bg-space)', padding: '10px 16px', borderRadius: '8px', color: '#F3BA2F', display: 'inline-block', fontSize: '1.1rem', border: '1px solid rgba(243, 186, 47, 0.2)' }}>
                      TJbTz...8XkP1
                    </code>
                  </div>
                  <div style={{ width: '120px', height: '120px', background: 'white', borderRadius: '12px', padding: '10px' }}>
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=TJbTz...8XkP1" alt="QR Code Binance" style={{ width: '100%', height: '100%' }} />
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Referencia de Pago (Últimos 4-6 dígitos)</label>
              <input required type="text" name="reference" value={formData.reference} onChange={handleInputChange} style={inputStyle} placeholder="Ej. 8593" />
            </div>

            {/* File Upload Zone */}
            <div>
              <label style={labelStyle}>Cargar Comprobante / Capture</label>
              <label style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '40px 20px', border: '2px dashed var(--glass-border)', borderRadius: '16px',
                background: receiptFile ? 'rgba(16, 185, 129, 0.05)' : 'rgba(0,0,0,0.2)',
                cursor: 'pointer', transition: 'all 0.3s', textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                if(!receiptFile) {
                  e.currentTarget.style.borderColor = 'var(--accent-red)';
                  e.currentTarget.style.background = 'rgba(229, 9, 20, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if(!receiptFile) {
                  e.currentTarget.style.borderColor = 'var(--glass-border)';
                  e.currentTarget.style.background = 'rgba(0,0,0,0.2)';
                }
              }}
              >
                {receiptFile ? (
                  <>
                    <CheckCircle size={40} color="#10B981" style={{ marginBottom: '15px' }} />
                    <span style={{ color: '#10B981', fontWeight: 600, fontSize: '1.1rem' }}>{receiptFile.name}</span>
                    <span style={{ color: 'var(--text-silver)', fontSize: '0.85rem', marginTop: '8px' }}>Clic para cambiar archivo</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={40} color="var(--text-silver)" style={{ marginBottom: '15px' }} />
                    <span style={{ color: 'var(--text-white)', fontWeight: 600, marginBottom: '8px', fontSize: '1.1rem' }}>Sube la captura de pantalla del pago</span>
                    <span style={{ color: 'var(--text-silver)', fontSize: '0.9rem' }}>Formatos soportados: JPEG, JPG o PNG (Max. 5MB)</span>
                  </>
                )}
                <input required type="file" accept="image/jpeg, image/png, image/jpg" onChange={handleFileChange} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Submit */}
        <div>
          <div style={{
            background: 'var(--bg-space-lighter)',
            border: '1px solid var(--glass-border)',
            borderRadius: '24px',
            padding: '30px',
            position: 'sticky',
            top: '100px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 24px 0', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px', color: 'var(--text-white)' }}>
              RESUMEN DE LA ORDEN
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '24px', maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
              {cart.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '48px', height: '48px', background: 'white', borderRadius: '8px', padding: '4px' }}>
                      <img src={item.product.image_url ? (item.product.image_url.startsWith('http') ? item.product.image_url : `http://localhost:5000${item.product.image_url}`) : 'https://images.unsplash.com/photo-1522771739223-2cb979f456c7?ixlib=rb-4.0.3'} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-white)', fontSize: '0.95rem', fontWeight: 600 }}>{item.product.name.substring(0, 22)}{item.product.name.length > 22 ? '...' : ''}</div>
                      <div style={{ color: 'var(--text-silver)', fontSize: '0.85rem' }}>Talla: {item.variant.size} | Cant: {item.quantity}</div>
                    </div>
                  </div>
                  <div style={{ color: 'var(--text-white)', fontWeight: 600 }}>
                    ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <hr style={{ border: 'none', borderTop: '1px dashed var(--glass-border)', margin: '0 0 24px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: 'var(--text-silver)' }}>
              <span>Subtotal</span>
              <span style={{ color: 'var(--text-white)', fontWeight: 600 }}>${subtotal.toFixed(2)}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', color: 'var(--text-silver)' }}>
              <span>Envío (Maracay)</span>
              <span style={{ color: 'var(--text-white)', fontWeight: 600 }}>${shipping.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-white)' }}>TOTAL A PAGAR</span>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-red)' }}>
                ${total.toFixed(2)}
              </span>
            </div>

            {error && (
              <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-red)', borderRadius: '12px', color: 'var(--accent-red)', display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '24px', fontSize: '0.9rem', lineHeight: 1.4 }}>
                <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} /> 
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '20px', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '1px', opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'wait' : 'pointer' }}
            >
              {isSubmitting ? 'PROCESANDO TRANSMISIÓN...' : 'FINALIZAR COMPRA'}
            </button>
            <p style={{ textAlign: 'center', color: 'var(--text-silver)', fontSize: '0.85rem', marginTop: '16px' }}>
              Transmisión cifrada de extremo a extremo.
            </p>
          </div>
        </div>

      </form>
    </div>
  );
};

export default Checkout;
