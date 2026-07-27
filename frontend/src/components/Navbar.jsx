import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Menu, Search, ShoppingCart, User, X } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const navItems = [
  { label: 'Inicio', to: '/' },
  { label: 'Camisetas', to: '/?category=jersey' },
  { label: 'Gorras', to: '/?category=cap' },
  { label: 'Nuevos', to: '/?view=new' },
  { label: 'Ofertas', to: '/?view=offers', accent: true }
];

const Navbar = () => {
  const { cart, user, currency, setCurrency } = useContext(AppContext);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
  }, [searchParams]);

  const isActive = (to) => {
    if (to === '/') {
      return location.pathname === '/' && !location.search;
    }
    return `${location.pathname}${location.search}` === to;
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const term = searchTerm.trim();
    if (!term) {
      navigate('/');
      return;
    }
    navigate(`/?search=${encodeURIComponent(term)}`);
  };

  const goToCatalog = (event) => {
    if (location.pathname === '/') {
      event.preventDefault();
      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMenuOpen(false);
    }
  };

  return (
    <nav className="site-nav">
      <div className="container site-nav__inner">
        <Link to="/" className="site-nav__brand">
          <span className="site-nav__logo">
            <img src="/logo-galaxy.jpeg" alt="Galaxy Sport" />
          </span>
          <span className="site-nav__brand-text">GALAXY SPORT</span>
        </Link>

        <div className={`site-nav__links ${menuOpen ? 'is-open' : ''}`}>
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`site-nav__link ${item.accent ? 'is-accent' : ''} ${isActive(item.to) ? 'is-active' : ''}`}
            >
              {item.label}
            </Link>
          ))}

          <div className="site-nav__mobile-extras">
            {user?.role === 'admin' && (
              <Link to="/admin/dashboard" className="site-nav__admin site-nav__admin--mobile">
                PANEL ADMIN
              </Link>
            )}
            <label className="site-nav__mobile-currency">
              <span>Moneda</span>
              <select
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
                aria-label="Moneda"
              >
                <option value="USDT">USDT (Binance)</option>
                <option value="BCV">Bolívares</option>
                <option value="EURO">Euros</option>
              </select>
            </label>
            <Link to="/" className="btn btn-primary" onClick={goToCatalog}>
              COMPRAR
            </Link>
          </div>
        </div>

        <div className="site-nav__actions">
          {user?.role === 'admin' && (
            <Link to="/admin/dashboard" className="site-nav__admin site-nav__admin--desktop">
              PANEL ADMIN
            </Link>
          )}

          <select
            className="site-nav__currency site-nav__currency--desktop"
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
            aria-label="Moneda"
          >
            <option value="USDT">USDT (Binance)</option>
            <option value="BCV">Bolívares</option>
            <option value="EURO">Euros</option>
          </select>

          <button
            type="button"
            className="site-nav__icon-btn"
            aria-label="Buscar"
            onClick={() => {
              setSearchOpen((open) => !open);
              setMenuOpen(false);
            }}
          >
            <Search size={20} />
          </button>

          <Link to="/login" className="site-nav__icon-btn" aria-label="Cuenta">
            <User size={20} />
          </Link>

          <Link to="/cart" className="site-nav__icon-btn site-nav__cart" aria-label="Carrito">
            <ShoppingCart size={20} />
            {cart.length > 0 && <span className="site-nav__badge">{cart.length}</span>}
          </Link>

          <Link to="/" className="btn btn-primary site-nav__buy" onClick={goToCatalog}>
            COMPRAR
          </Link>

          <button
            type="button"
            className="site-nav__menu-btn"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            onClick={() => {
              setMenuOpen((open) => !open);
              setSearchOpen(false);
            }}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="container site-nav__search">
          <form onSubmit={handleSearchSubmit} className="site-nav__search-form">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por nombre..."
              aria-label="Buscar productos"
              autoFocus
            />
            <button type="submit" className="btn btn-primary">
              Buscar
            </button>
          </form>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
