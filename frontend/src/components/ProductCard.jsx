import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const ProductCard = ({ product }) => {
  const { currency } = useContext(AppContext);

  const imageUrl = product.image_url 
    ? (product.image_url.startsWith('http') ? product.image_url : `http://localhost:5000${product.image_url}`)
    : 'https://images.unsplash.com/photo-1522771739223-2cb979f456c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';

  const getDisplayPrice = () => {
    if (!product.convertedPrices || currency === 'USDT') {
      return (
        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-white)' }}>
          ${parseFloat(product.price).toFixed(2)}
        </span>
      );
    }
    
    let localPrice = '';
    let quotedLabel = '';
    
    if (currency === 'BCV') {
      localPrice = `Bs. ${product.convertedPrices.precio_bcv_bs.toLocaleString('es-VE', {minimumFractionDigits: 2})}`;
      quotedLabel = `$${product.convertedPrices.cotizacion_bcv_usd?.toFixed(2)} (a BCV)`;
    } else if (currency === 'BINANCE') {
      localPrice = `Bs. ${product.convertedPrices.precio_binance_bs.toLocaleString('es-VE', {minimumFractionDigits: 2})}`;
      quotedLabel = `$${parseFloat(product.price).toFixed(2)} (a Binance)`;
    } else if (currency === 'EURO') {
      localPrice = `Bs. ${product.convertedPrices.precio_bcv_bs.toLocaleString('es-VE', {minimumFractionDigits: 2})}`; // Same fixed Bs
      quotedLabel = `€${product.convertedPrices.precio_euro?.toFixed(2)} (a Euro)`;
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-silver)', fontWeight: 600 }}>
          {quotedLabel}
        </span>
        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-red)' }}>
          {localPrice}
        </span>
      </div>
    );
  };

  return (
    <div style={{ 
      background: 'var(--bg-space-lighter)',
      border: '1px solid var(--glass-border)',
      borderRadius: '16px',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      transition: 'all 0.3s ease', cursor: 'pointer',
      position: 'relative'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-8px)';
      e.currentTarget.style.borderColor = 'rgba(229, 9, 20, 0.3)';
      e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.5)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.borderColor = 'var(--glass-border)';
      e.currentTarget.style.boxShadow = 'none';
    }}
    >
      <div style={{ height: '280px', overflow: 'hidden', background: 'var(--bg-space)', position: 'relative' }}>
        <img 
          src={imageUrl} 
          alt={product.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
      </div>
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-silver)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
            {product.category}
          </span>
          {getDisplayPrice()}
        </div>
        
        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-white)', lineHeight: 1.4 }}>
          {product.name}
        </h3>
        
        <Link to={`/product/${product.id}`} className="btn btn-outline" style={{ width: '100%', marginTop: 'auto', textAlign: 'center', fontSize: '0.9rem' }}>
          Ver Detalles
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
