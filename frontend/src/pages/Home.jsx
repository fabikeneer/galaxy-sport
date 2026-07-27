import React, { useState, useEffect } from 'react';
import { ArrowRight, Star } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('No pudimos cargar el catálogo. Intenta nuevamente.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      {/* HERO SECTION */}
      <section style={{ 
        padding: '80px 0', 
        minHeight: '80vh', 
        display: 'flex', 
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle background glow */}
        <div style={{
          position: 'absolute',
          top: '20%',
          right: '10%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(229, 9, 20, 0.12) 0%, rgba(11, 14, 20, 0) 70%)',
          borderRadius: '50%',
          zIndex: 0,
          pointerEvents: 'none'
        }}></div>

        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          gap: '60px',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Left Column */}
          <div>
            <div style={{ 
              display: 'inline-block', 
              padding: '6px 12px', 
              background: 'rgba(229, 9, 20, 0.1)', 
              color: 'var(--accent-red)',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '1px',
              marginBottom: '20px',
              border: '1px solid rgba(229, 9, 20, 0.2)'
            }}>
              NUEVA TEMPORADA 2025/26
            </div>
            
            <h1 className="hero-title">
              VISTE LA GALAXIA<br/>INTERIOR
            </h1>
            
            <p className="text-silver" style={{ fontSize: '1.15rem', lineHeight: 1.6, marginBottom: '40px', maxWidth: '90%' }}>
              Descubre nuestra colección exclusiva de jerseys y gorras de tus equipos favoritos. Diseñados para campeones, fabricados con calidad galáctica.
            </p>
            
            <div style={{ display: 'flex', gap: '20px', marginBottom: '60px' }}>
              <a href="#catalog" className="btn btn-primary">
                Comprar Colección <ArrowRight size={20} />
              </a>
              <a href="#" className="btn btn-outline">
                Ver Catálogo
              </a>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'flex', gap: '40px' }}>
              <div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--text-white)' }}>200+</h3>
                <span className="text-silver" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Clubes Oficiales</span>
              </div>
              <div style={{ width: '1px', background: 'var(--glass-border)' }}></div>
              <div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--text-white)' }}>50K+</h3>
                <span className="text-silver" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Jugadores Activos</span>
              </div>
              <div style={{ width: '1px', background: 'var(--glass-border)' }}></div>
              <div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--text-white)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  4.9 <Star size={20} color="#FBBF24" fill="#FBBF24" />
                </h3>
                <span className="text-silver" style={{ fontSize: '0.9rem', fontWeight: 600 }}>Calificación</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ position: 'relative' }}>
            {/* Main Image Card */}
            <div style={{
              background: 'var(--bg-space-lighter)',
              borderRadius: '24px',
              border: '1px solid var(--glass-border)',
              padding: '16px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 40px rgba(229, 9, 20, 0.15)',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute', top: '30px', left: '30px',
                background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)',
                padding: '6px 14px', borderRadius: '12px', zIndex: 2,
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-white)', letterSpacing: '2px' }}>NUEVO LANZAMIENTO</span>
              </div>
              
              <img 
                src="https://images.unsplash.com/photo-1577223625816-7546f13df25d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="New Drop Jersey" 
                style={{ width: '100%', height: '480px', objectFit: 'cover', borderRadius: '16px' }}
              />
            </div>

            {/* Floating Review Card */}
            <div style={{
              position: 'absolute',
              bottom: '-20px',
              left: '-40px',
              background: 'rgba(21, 26, 35, 0.85)',
              backdropFilter: 'blur(16px)',
              border: '1px solid var(--glass-border)',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              gap: '15px',
              alignItems: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              zIndex: 3,
              maxWidth: '300px'
            }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--accent-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', flexShrink: 0 }}>
                MV
              </div>
              <div>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '6px' }}>
                  {[1,2,3,4,5].map(star => <Star key={star} size={14} color="#FBBF24" fill="#FBBF24" />)}
                </div>
                <p style={{ fontSize: '0.9rem', fontStyle: 'italic', margin: '0 0 5px 0', color: 'var(--text-white)' }}>"Ropa de calidad galáctica. Ajuste absolutamente perfecto."</p>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-silver)', fontWeight: 600 }}>- Marco V.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATALOG SECTION */}
      <section id="catalog" className="container" style={{ padding: '80px 0 120px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 10px 0', color: 'var(--text-white)' }}>EN TENDENCIA</h2>
            <p className="text-silver" style={{ fontSize: '1.1rem' }}>Las piezas más buscadas en toda la galaxia.</p>
          </div>
          <a href="#" style={{ color: 'var(--accent-red)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}>
            Ver Todo <ArrowRight size={18} />
          </a>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2rem' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid var(--accent-red)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
            Cargando catálogo...
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {error && (
          <div style={{ padding: '20px', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', textAlign: 'center', background: 'rgba(239, 68, 68, 0.05)' }}>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px', background: 'var(--bg-space-lighter)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
            <p style={{ color: 'var(--text-silver)', fontSize: '1.1rem' }}>Aún no hay productos en la tienda.</p>
          </div>
        )}

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '30px' 
        }}>
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
