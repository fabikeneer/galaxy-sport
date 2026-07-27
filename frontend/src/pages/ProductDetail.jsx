import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { AppContext } from '../context/AppContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, currency } = useContext(AppContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Gallery and Zoom states
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: 'center center', transform: 'scale(1)' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product detail:', err);
        setError('No pudimos encontrar este producto galáctico. Puede que no exista o las coordenadas sean incorrectas.');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center', minHeight: '60vh' }}>
        <div style={{ width: '50px', height: '50px', border: '4px solid var(--accent-red)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
        <p style={{ color: 'var(--text-silver)', fontSize: '1.2rem' }}>Calculando coordenadas del producto...</p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center', minHeight: '60vh' }}>
        <h2 style={{ color: 'var(--accent-red)', fontSize: '3rem', margin: '0 0 20px 0' }}>ERROR 404</h2>
        <p style={{ color: 'var(--text-silver)', fontSize: '1.2rem', marginBottom: '40px' }}>{error}</p>
        <button onClick={() => navigate('/')} className="btn btn-outline">
          <ArrowLeft size={18} /> VOLVER A LA BASE
        </button>
      </div>
    );
  }

  const rawImages = product.images ? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images) : (product.image_url ? [product.image_url] : []);
  const displayImages = rawImages.map(img => img.startsWith('http') ? img : `http://localhost:5000${img}`);
  const mainImage = displayImages.length > 0 ? displayImages[activeIndex] : 'https://images.unsplash.com/photo-1522771739223-2cb979f456c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: 'scale(2)' });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ transformOrigin: 'center center', transform: 'scale(1)' });
  };

  // Extract unique sizes from variants
  const uniqueSizes = [...new Set((product.variants || []).map(v => v.size))];

  const handleSizeSelect = (size) => {
    // Find the first variant with this size
    const variant = product.variants.find(v => v.size === size);
    setSelectedVariant(variant);
    setQuantity(1); // Reset quantity when changing size
    setAddedSuccess(false); // Reset success state
  };

  const handleQuantityChange = (delta) => {
    if (!selectedVariant) return;
    
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= selectedVariant.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    setIsAdding(true);
    
    // Simulate network delay for UI feedback
    setTimeout(() => {
      addToCart(product, selectedVariant, quantity);
      setIsAdding(false);
      setAddedSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => setAddedSuccess(false), 3000);
    }, 600);
  };

  const renderPrice = () => {
    if (!product.convertedPrices || currency === 'USDT') {
      return (
        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-white)', marginBottom: '30px' }}>
          ${parseFloat(product.price).toFixed(2)}
        </div>
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
      <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '30px' }}>
        <span style={{ fontSize: '1.2rem', color: 'var(--text-silver)', fontWeight: 600 }}>
          {quotedLabel}
        </span>
        <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-red)' }}>
          {localPrice}
        </span>
      </div>
    );
  };

  return (
    <div className="container" style={{ padding: '40px 24px 120px 24px' }}>
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        style={{ 
          background: 'transparent', border: 'none', color: 'var(--text-silver)', 
          display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', 
          marginBottom: '40px', fontSize: '1rem', transition: 'color 0.2s',
          fontWeight: 600, padding: 0
        }}
        onMouseEnter={(e) => e.target.style.color = 'var(--text-white)'}
        onMouseLeave={(e) => e.target.style.color = 'var(--text-silver)'}
      >
        <ArrowLeft size={20} /> VOLVER AL CATÁLOGO
      </button>

      <div className="product-detail-grid">
        {/* Left Column: Image Container */}
        <div style={{
          background: 'var(--bg-space-lighter)',
          borderRadius: '24px',
          border: '1px solid var(--glass-border)',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          boxShadow: 'inset 0 0 80px rgba(0,0,0,0.5), 0 0 60px rgba(229, 9, 20, 0.08)',
          minHeight: '500px'
        }}>
          {/* Subtle glowing orb behind image */}
          <div style={{
            position: 'absolute', width: '300px', height: '300px', 
            background: 'radial-gradient(circle, rgba(229, 9, 20, 0.2) 0%, rgba(0,0,0,0) 70%)',
            top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 0
          }}></div>
          
          {/* Main Zoomable Image */}
          <div 
            onClick={() => setIsModalOpen(true)}
            style={{ width: '100%', maxWidth: '450px', height: '450px', overflow: 'hidden', position: 'relative', cursor: 'zoom-in', zIndex: 1, filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.4))', borderRadius: '16px' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img 
              src={mainImage} 
              alt={product.name} 
              style={{ 
                width: '100%', height: '100%', objectFit: 'cover', 
                transition: 'transform 0.1s ease-out', ...zoomStyle 
              }}
            />
          </div>

          {/* Thumbnails */}
          {displayImages.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', zIndex: 2, overflowX: 'auto', maxWidth: '100%', padding: '10px 0' }}>
              {displayImages.map((img, idx) => (
                <div 
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  style={{
                    width: '60px', height: '60px', borderRadius: '8px', cursor: 'pointer',
                    border: `2px solid ${activeIndex === idx ? 'var(--accent-red)' : 'var(--glass-border)'}`,
                    overflow: 'hidden', background: '#fff', flexShrink: 0,
                    transition: 'border-color 0.2s'
                  }}
                >
                  <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Info & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ 
            color: 'var(--accent-red)', textTransform: 'uppercase', letterSpacing: '2px', 
            fontWeight: 800, fontSize: '0.9rem', marginBottom: '12px' 
          }}>
            {product.category}
          </span>
          
          <h1 style={{ 
            fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1, 
            margin: '0 0 20px 0', color: 'var(--text-white)' 
          }}>
            {product.name}
          </h1>
          
          {renderPrice()}

          <p style={{ color: 'var(--text-silver)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '40px' }}>
            {product.description || 'Equípate con la mejor tecnología deportiva. Diseño aerodinámico y materiales de primera calidad para un rendimiento verdaderamente intergaláctico en el campo.'}
          </p>

          <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '0 0 40px 0' }} />

          {/* Size Selector */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-white)', margin: '0 0 16px 0', letterSpacing: '1px' }}>
              SELECCIONAR TALLA
            </h3>
            
            {uniqueSizes.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {uniqueSizes.map(size => {
                  const isSelected = selectedVariant?.size === size;
                  const sizeVariants = product.variants.filter(v => v.size === size);
                  const isOutOfStock = sizeVariants.every(v => v.stock === 0);

                  return (
                    <button
                      key={size}
                      onClick={() => !isOutOfStock && handleSizeSelect(size)}
                      disabled={isOutOfStock}
                      style={{
                        padding: '14px 28px',
                        background: isSelected ? 'var(--accent-red)' : 'transparent',
                        border: `1px solid ${isSelected ? 'var(--accent-red)' : 'var(--text-silver)'}`,
                        color: isSelected ? 'white' : (isOutOfStock ? '#4B5563' : 'var(--text-white)'),
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 700,
                        cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        opacity: isOutOfStock ? 0.4 : 1,
                        boxShadow: isSelected ? '0 8px 20px rgba(229, 9, 20, 0.4)' : 'none'
                      }}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '16px', background: 'rgba(229, 9, 20, 0.1)', border: '1px solid var(--accent-red)', borderRadius: '8px', color: 'var(--accent-red)', fontWeight: 600 }}>
                Agotado temporalmente en la galaxia.
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          {selectedVariant && (
            <div style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-white)', margin: 0, letterSpacing: '1px' }}>CANTIDAD</h3>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: selectedVariant.stock < 5 ? 'var(--accent-red)' : 'var(--text-silver)' }}>
                  {selectedVariant.stock} unidades disponibles
                </span>
              </div>
              
              <div style={{ 
                display: 'flex', alignItems: 'center', 
                background: 'var(--bg-space-lighter)', 
                border: '1px solid var(--glass-border)', 
                borderRadius: '8px', 
                width: 'fit-content', 
                overflow: 'hidden' 
              }}>
                <button 
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-white)', padding: '14px 24px', fontSize: '1.2rem', cursor: quantity <= 1 ? 'not-allowed' : 'pointer', opacity: quantity <= 1 ? 0.3 : 1 }}
                >
                  -
                </button>
                <div style={{ width: '40px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-white)' }}>
                  {quantity}
                </div>
                <button 
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= selectedVariant.stock}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-white)', padding: '14px 24px', fontSize: '1.2rem', cursor: quantity >= selectedVariant.stock ? 'not-allowed' : 'pointer', opacity: quantity >= selectedVariant.stock ? 0.3 : 1 }}
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <button 
            onClick={handleAddToCart}
            disabled={!selectedVariant || isAdding || addedSuccess}
            style={{ 
              width: '100%', 
              padding: '20px', 
              fontSize: '1.1rem', 
              fontWeight: 800,
              textTransform: 'uppercase', 
              letterSpacing: '2px',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              opacity: !selectedVariant ? 0.5 : 1,
              cursor: !selectedVariant ? 'not-allowed' : (isAdding || addedSuccess ? 'default' : 'pointer'),
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12px',
              background: addedSuccess ? '#10B981' : 'var(--accent-red)',
              transition: 'all 0.3s ease',
              boxShadow: addedSuccess ? '0 10px 30px rgba(16, 185, 129, 0.4)' : (!selectedVariant ? 'none' : '0 10px 30px rgba(229, 9, 20, 0.4)'),
              marginTop: 'auto'
            }}
            onMouseEnter={(e) => {
              if (selectedVariant && !isAdding && !addedSuccess) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.background = 'var(--accent-red-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedVariant && !isAdding && !addedSuccess) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'var(--accent-red)';
              }
            }}
          >
            {isAdding ? (
              <>INICIANDO SECUENCIA...</>
            ) : addedSuccess ? (
              <><CheckCircle size={24} /> AGREGADO AL CARRITO</>
            ) : (
              <><ShoppingCart size={24} /> AGREGAR AL CARRITO</>
            )}
          </button>
          
          {/* Helper Text */}
          <div style={{ height: '24px', marginTop: '16px', textAlign: 'center' }}>
            {!selectedVariant && uniqueSizes.length > 0 && (
              <span style={{ color: 'var(--text-silver)', fontSize: '0.9rem' }}>
                Por favor, selecciona una talla para continuar.
              </span>
            )}
          </div>

        </div>
      </div>

      {/* Lightbox Modal */}
      {isModalOpen && (
        <div 
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)', zIndex: 9999,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            cursor: 'zoom-out', padding: '20px', backdropFilter: 'blur(10px)'
          }}
        >
          <img 
            src={mainImage} 
            alt="Fullscreen view" 
            style={{
              maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain',
              boxShadow: '0 0 50px rgba(229, 9, 20, 0.3)', borderRadius: '12px'
            }}
          />
          <button 
            onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}
            style={{
              position: 'absolute', top: '30px', right: '40px',
              background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.3)', 
              color: 'white', width: '40px', height: '40px', borderRadius: '50%',
              fontSize: '1.5rem', cursor: 'pointer', fontWeight: 'bold',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = 'var(--accent-red)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
          >
            &times;
          </button>
        </div>
      )}

    </div>
  );
};

export default ProductDetail;
