import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { SHIPPING_COST_USD } from '../utils/constants';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, currency } = useContext(AppContext);
  const navigate = useNavigate();

  // Calculate totals
  const subtotal = cart.reduce((total, item) => total + (parseFloat(item.product.price) * item.quantity), 0);
  const shipping = subtotal > 0 ? SHIPPING_COST_USD : 0;
  const total = subtotal + shipping;

  // Render converted item price
  const getConvertedItemPrice = (product, quantity) => {
    if (!product.convertedPrices || currency === 'USDT') {
      return `$${(parseFloat(product.price) * quantity).toFixed(2)}`;
    }
    
    if (currency === 'BCV') return `$${(product.convertedPrices.cotizacion_bcv_usd * quantity).toFixed(2)} (a BCV)`;
    if (currency === 'BINANCE') return `$${(parseFloat(product.price) * quantity).toFixed(2)} (a Binance)`;
    if (currency === 'EURO') return `€${(product.convertedPrices.precio_euro * quantity).toFixed(2)} (a Euro)`;
  };

  // Render converted total
  const renderConvertedTotal = () => {
    if (cart.length === 0 || currency === 'USDT') return null;
    
    let fixedBsTotal = 0;
    let quotedTotal = 0;
    
    cart.forEach(item => {
      if (item.product.convertedPrices) {
        fixedBsTotal += item.product.convertedPrices.precio_bcv_bs * item.quantity; // Siempre el mismo monto fijo en Bs
        
        if (currency === 'BCV') quotedTotal += item.product.convertedPrices.cotizacion_bcv_usd * item.quantity;
        else if (currency === 'BINANCE') quotedTotal += parseFloat(item.product.price) * item.quantity;
        else if (currency === 'EURO') quotedTotal += item.product.convertedPrices.precio_euro * item.quantity;
      }
    });

    let quotedPrefix = currency === 'EURO' ? '€' : '$';
    let quotedLabel = currency === 'EURO' ? 'a Euro' : (currency === 'BCV' ? 'a BCV' : 'a Binance');

    return (
      <div style={{ textAlign: 'right', marginTop: '5px' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-silver)', fontWeight: 600 }}>
          {quotedPrefix}{quotedTotal.toFixed(2)} ({quotedLabel})
        </span>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-white)' }}>
          Bs. {fixedBsTotal.toLocaleString('es-VE', {minimumFractionDigits: 2})}
        </div>
      </div>
    );
  };

  const handleQuantityChange = (index, currentQuantity, delta, maxStock) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      updateQuantity(index, newQuantity);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center', minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <ShoppingBag size={80} color="var(--glass-border)" style={{ marginBottom: '20px' }} />
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '15px', color: 'var(--text-white)' }}>TU CARRITO ESTÁ VACÍO</h2>
        <p style={{ color: 'var(--text-silver)', fontSize: '1.2rem', marginBottom: '40px' }}>Parece que aún no has seleccionado ningún equipo para tu misión.</p>
        <Link to="/" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '16px 32px' }}>
          EXPLORAR CATÁLOGO
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '60px 24px 120px 24px' }}>
      <h1 style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 800, margin: '0 0 40px 0', color: 'var(--text-white)' }}>
        CARRITO <span style={{ color: 'var(--accent-red)' }}>ORBITAL</span>
      </h1>

      <div className="cart-grid">
        
        {/* Left Column: Cart Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {cart.map((item, index) => {
            const rawImages = item.product.images ? (typeof item.product.images === 'string' ? JSON.parse(item.product.images) : item.product.images) : (item.product.image_url ? [item.product.image_url] : []);
            const imageStr = rawImages.length > 0 ? rawImages[0] : null;
            const imageUrl = imageStr 
              ? (imageStr.startsWith('http') ? imageStr : `http://localhost:5000${imageStr}`)
              : 'https://images.unsplash.com/photo-1522771739223-2cb979f456c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';

            return (
              <div key={index} style={{
                background: 'var(--bg-space-lighter)',
                border: '1px solid var(--glass-border)',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                gap: '20px',
                position: 'relative',
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
              }}>
                {/* Item Image */}
                <div style={{ width: '120px', height: '120px', background: 'white', borderRadius: '12px', padding: '10px', flexShrink: 0 }}>
                  <img src={imageUrl} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>

                {/* Item Details */}
                <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 5px 0', color: 'var(--text-white)' }}>{item.product.name}</h3>
                      <p style={{ color: 'var(--text-silver)', margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Talla: <span style={{ color: 'var(--text-white)', fontWeight: 'bold' }}>{item.variant.size}</span>
                      </p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(index)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-silver)', cursor: 'pointer', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => e.target.style.color = 'var(--accent-red)'}
                      onMouseLeave={(e) => e.target.style.color = 'var(--text-silver)'}
                      title="Eliminar del carrito"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-space)', border: '1px solid var(--glass-border)', borderRadius: '8px', overflow: 'hidden' }}>
                      <button 
                        onClick={() => handleQuantityChange(index, item.quantity, -1, item.variant.stock)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-white)', padding: '8px 12px', cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer', opacity: item.quantity <= 1 ? 0.3 : 1 }}
                      >
                        -
                      </button>
                      <span style={{ width: '30px', textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                      <button 
                        onClick={() => handleQuantityChange(index, item.quantity, 1, item.variant.stock)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-white)', padding: '8px 12px', cursor: item.quantity >= item.variant.stock ? 'not-allowed' : 'pointer', opacity: item.quantity >= item.variant.stock ? 0.3 : 1 }}
                      >
                        +
                      </button>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-white)' }}>
                        {currency !== 'USDT' && item.product.convertedPrices 
                          ? `Bs. ${(item.product.convertedPrices.precio_bcv_bs * item.quantity).toLocaleString('es-VE', {minimumFractionDigits: 2})}`
                          : `$${(parseFloat(item.product.price) * item.quantity).toFixed(2)}`
                        }
                      </div>
                      {currency !== 'USDT' && (
                        <div style={{ fontSize: '0.9rem', color: 'var(--accent-red)', fontWeight: 600 }}>
                          {getConvertedItemPrice(item.product, item.quantity)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Order Summary */}
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
              RESUMEN DE ORDEN
            </h2>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: 'var(--text-silver)' }}>
              <span>Subtotal ({cart.length} artículos)</span>
              <span style={{ color: 'var(--text-white)', fontWeight: 600 }}>${subtotal.toFixed(2)}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', color: 'var(--text-silver)' }}>
              <span>Costo de Envío</span>
              <span style={{ color: 'var(--text-white)', fontWeight: 600 }}>${shipping.toFixed(2)}</span>
            </div>

            <hr style={{ border: 'none', borderTop: '1px dashed var(--glass-border)', margin: '0 0 24px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-white)', marginTop: '8px' }}>TOTAL ESTIMADO</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                {currency === 'USDT' && (
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-red)' }}>
                    ${total.toFixed(2)}
                  </span>
                )}
                {renderConvertedTotal()}
              </div>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="btn btn-primary"
              style={{ width: '100%', padding: '18px', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '1px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
            >
              PROCEDER AL PAGO <ArrowRight size={20} />
            </button>
            
            <p style={{ textAlign: 'center', color: 'var(--text-silver)', fontSize: '0.85rem', marginTop: '16px' }}>
              Impuestos calculados en el pago. Transmisión galáctica segura.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Cart;
