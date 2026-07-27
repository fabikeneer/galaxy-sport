import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

const catalogCopy = {
  default: {
    title: 'EN TENDENCIA',
    subtitle: 'Camisetas y gorras listas para pedir.'
  },
  jersey: {
    title: 'CAMISETAS',
    subtitle: 'Jerseys de clubes y selección.'
  },
  cap: {
    title: 'GORRAS',
    subtitle: 'Gorras ajustables y de club.'
  },
  new: {
    title: 'NUEVOS',
    subtitle: 'Lo más reciente del catálogo.'
  },
  offers: {
    title: 'OFERTAS',
    subtitle: 'Promociones del catálogo. Los descuentos dedicados llegan en una fase posterior.'
  },
  search: {
    title: 'RESULTADOS',
    subtitle: 'Productos que coinciden con tu búsqueda.'
  }
};

const Home = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const view = searchParams.get('view') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hasCatalogFilter = Boolean(category || search || view);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = {};
        if (category === 'jersey' || category === 'cap') {
          params.category = category;
        }
        if (search.trim()) {
          params.search = search.trim();
        }

        const response = await api.get('/products', { params });
        setProducts(response.data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('No pudimos cargar el catálogo. Intenta nuevamente.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, search, view]);

  useEffect(() => {
    if (!hasCatalogFilter) return;

    const timer = window.setTimeout(() => {
      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    return () => window.clearTimeout(timer);
  }, [hasCatalogFilter, category, search, view]);

  const getCatalogMeta = () => {
    if (search.trim()) {
      return {
        ...catalogCopy.search,
        subtitle: `Búsqueda: "${search.trim()}"`
      };
    }
    if (category === 'jersey') return catalogCopy.jersey;
    if (category === 'cap') return catalogCopy.cap;
    if (view === 'new') return catalogCopy.new;
    if (view === 'offers') return catalogCopy.offers;
    return catalogCopy.default;
  };

  const catalogMeta = getCatalogMeta();

  const emptyMessage = () => {
    if (search.trim()) {
      return `No encontramos productos para "${search.trim()}".`;
    }
    if (category === 'jersey') return 'No hay camisetas disponibles por ahora.';
    if (category === 'cap') return 'No hay gorras disponibles por ahora.';
    if (view === 'offers') return 'Aún no hay ofertas activas.';
    return 'Aún no hay productos en la tienda.';
  };

  return (
    <div>
      <section className="home-hero">
        <div className="home-hero__glow" aria-hidden="true" />

        <div className="container home-hero__grid">
          <div>
            <div className="home-hero__badge">NUEVA TEMPORADA 2025/26</div>

            <h1 className="hero-title">
              VISTE LA GALAXIA
              <br />
              INTERIOR
            </h1>

            <p className="text-silver home-hero__lead">
              Descubre nuestra colección de camisetas y gorras de tus equipos favoritos.
            </p>

            <div className="home-hero__actions">
              <a href="#catalog" className="btn btn-primary">
                Ver catálogo <ArrowRight size={20} />
              </a>
              <Link to="/?category=jersey" className="btn btn-outline">
                Ver camisetas
              </Link>
            </div>

            <div className="home-hero__stats">
              <div>
                <h3>200+</h3>
                <span className="text-silver">Clubes</span>
              </div>
              <div className="home-hero__stats-divider" />
              <div>
                <h3>50K+</h3>
                <span className="text-silver">Clientes</span>
              </div>
              <div className="home-hero__stats-divider" />
              <div>
                <h3>
                  4.9 <Star size={20} color="#FBBF24" fill="#FBBF24" />
                </h3>
                <span className="text-silver">Calificación</span>
              </div>
            </div>
          </div>

          <div className="home-hero__media">
            <div className="home-hero__image-card">
              <div className="home-hero__image-tag">NUEVO LANZAMIENTO</div>
              <img
                src="https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=800&q=80"
                alt="Camiseta destacada"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="catalog" className="container home-catalog">
        <div className="home-catalog__header">
          <div>
            <h2>{catalogMeta.title}</h2>
            <p className="text-silver">{catalogMeta.subtitle}</p>
          </div>
          {hasCatalogFilter ? (
            <Link to="/#catalog" className="home-catalog__clear">
              Ver todo <ArrowRight size={18} />
            </Link>
          ) : (
            <a href="#catalog" className="home-catalog__clear">
              Ver todo <ArrowRight size={18} />
            </a>
          )}
        </div>

        {loading && (
          <div className="home-catalog__state">
            <div className="home-catalog__spinner" />
            Cargando catálogo...
          </div>
        )}

        {error && (
          <div className="home-catalog__error">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="home-catalog__empty">
            <p>{emptyMessage()}</p>
            {hasCatalogFilter && (
              <Link to="/" className="btn btn-outline" style={{ marginTop: '20px' }}>
                Volver al inicio
              </Link>
            )}
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="home-catalog__grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
