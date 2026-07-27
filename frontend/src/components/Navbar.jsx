import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Search, Flame } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const Navbar = () => {
  const { cart, user, currency, setCurrency } = useContext(AppContext);

  const navLinkStyle = {
    color: 'var(--text-silver)',
    textTransform: 'uppercase',
    fontSize: '0.85rem',
    fontWeight: 600,
    letterSpacing: '1px',
    transition: 'color 0.2s ease',
    textDecoration: 'none'
  };

  return (
    <nav style={{ 
      position: 'sticky', top: 0, zIndex: 100, 
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--glass-border)',
      padding: '16px 0'
    }}>
      <div className="container" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'nowrap'
      }}>
        
        {/* Logo - Left */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-white)', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
            boxShadow: '0 0 15px rgba(229, 9, 20, 0.4)', border: '2px solid rgba(255,255,255,0.1)'
          }}>
            <img src="/logo-galaxy.jpeg" alt="Galaxy Sport Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          GALAXY SPORT
        </Link>
        
        {/* Links - Center */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center', flex: 1, whiteSpace: 'nowrap' }}>
          <Link to="/" style={navLinkStyle} onMouseEnter={(e)=>e.target.style.color='var(--text-white)'} onMouseLeave={(e)=>e.target.style.color='var(--text-silver)'}>Inicio</Link>
          <Link to="/" style={navLinkStyle} onMouseEnter={(e)=>e.target.style.color='var(--text-white)'} onMouseLeave={(e)=>e.target.style.color='var(--text-silver)'}>Camisetas</Link>
          <Link to="/" style={navLinkStyle} onMouseEnter={(e)=>e.target.style.color='var(--text-white)'} onMouseLeave={(e)=>e.target.style.color='var(--text-silver)'}>Gorras</Link>
          <Link to="/" style={navLinkStyle} onMouseEnter={(e)=>e.target.style.color='var(--text-white)'} onMouseLeave={(e)=>e.target.style.color='var(--text-silver)'}>Nuevos</Link>
          <Link to="/" style={{...navLinkStyle, color: 'var(--accent-red)'}}>Ofertas</Link>
        </div>
        
        {/* Actions - Right */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexShrink: 0 }}>
          {user?.role === 'admin' && (
            <Link to="/admin/dashboard" style={{ color: 'var(--accent-red)', fontWeight: 'bold', fontSize: '0.9rem', textDecoration: 'none', border: '1px solid var(--accent-red)', padding: '5px 10px', borderRadius: '8px' }}>
              PANEL ADMIN
            </Link>
          )}

          {/* Currency Selector */}
          <select 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value)}
            style={{
              background: 'rgba(0,0,0,0.5)', color: 'var(--text-white)', border: '1px solid var(--glass-border)',
              borderRadius: '8px', padding: '6px 10px', fontSize: '0.85rem', outline: 'none', cursor: 'pointer'
            }}
          >
            <option value="USDT">USDT (Binance)</option>
            <option value="BCV">Bolívares</option>
            <option value="EURO">Euros (€)</option>
          </select>

          <Link to="/" style={{ color: 'var(--text-white)' }}><Search size={20} /></Link>
          <Link to="/login" style={{ color: 'var(--text-white)' }}><User size={20} /></Link>
          
          <Link to="/cart" style={{ position: 'relative', color: 'var(--text-white)' }}>
            <ShoppingCart size={20} /> 
            {cart.length > 0 && (
              <span style={{ 
                position: 'absolute', top: '-8px', right: '-12px',
                background: 'var(--accent-red)', color: 'white',
                fontSize: '0.7rem', fontWeight: 'bold',
                width: '18px', height: '18px',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {cart.length}
              </span>
            )}
          </Link>

          <Link to="/" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
            COMPRAR
          </Link>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
