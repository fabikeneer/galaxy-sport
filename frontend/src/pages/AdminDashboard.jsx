import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, PackagePlus, ShoppingCart, RefreshCw, AlertTriangle, Save, DollarSign, ExternalLink, Activity, DollarSign as DollarIcon, TrendingUp, Package, UploadCloud, X, Plus, ClipboardList, Eye, CheckCheck, XCircle, Pencil, Trash2 } from 'lucide-react';
import api from '../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [metrics, setMetrics] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    netProfit: 0
  });
  const [metricsLoading, setMetricsLoading] = useState(true);

  // Sales Module State
  const [sales, setSales] = useState([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [productsForSale, setProductsForSale] = useState([]);
  const [manualSale, setManualSale] = useState({
    product_id: '',
    variant_id: '',
    quantity: 1,
    dorsal: ''
  });
  const [manualSaleLoading, setManualSaleLoading] = useState(false);

  // Orders Module State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersFilter, setOrdersFilter] = useState('paid_to_verify');
  const [orderActionLoading, setOrderActionLoading] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Product Edit State
  const [editingProduct, setEditingProduct] = useState(null);
  const [productList, setProductList] = useState([]);
  const [productListLoading, setProductListLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'jersey',
    description: '',
    precio_costo: '',
    precio_venta: '',
    image_url: '',
    imageFiles: [],
    size: 'Unica',
    stock: 0,
    stockS: 0,
    stockM: 0,
    stockL: 0,
    stockXL: 0,
    dorsales: ''
  });

  const [priceWarning, setPriceWarning] = useState(false);

  useEffect(() => {
    if (activeTab === 'home') {
      fetchMetrics();
    } else if (activeTab === 'sales') {
      fetchSales();
      fetchProductsForSale();
    } else if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'inventory') {
      fetchProductList();
    }
  }, [activeTab]);

  const fetchMetrics = async () => {
    setMetricsLoading(true);
    try {
      const response = await api.get('/dashboard/metrics');
      setMetrics(response.data);
    } catch (err) {
      console.error('Error fetching metrics', err);
    } finally {
      setMetricsLoading(false);
    }
  };

  const fetchSales = async () => {
    setSalesLoading(true);
    try {
      const response = await api.get('/dashboard/sales');
      setSales(response.data);
    } catch (err) {
      console.error('Error fetching sales', err);
    } finally {
      setSalesLoading(false);
    }
  };

  const fetchProductsForSale = async () => {
    try {
      const response = await api.get('/products');
      setProductsForSale(response.data);
    } catch (err) {
      console.error('Error fetching products for sale', err);
    }
  };

  const fetchOrders = async (status = ordersFilter) => {
    setOrdersLoading(true);
    try {
      const response = await api.get(`/dashboard/orders?status=${status}`);
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleOrderStatus = async (orderId, newStatus) => {
    setOrderActionLoading(orderId);
    try {
      await api.patch(`/dashboard/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.filter(o => o.id !== orderId));
      setSuccessMsg(`Orden #${orderId} marcada como "${newStatus === 'completed' ? 'completada' : 'cancelada'}".`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Error al actualizar el estado.');
    } finally {
      setOrderActionLoading(null);
    }
  };

  const fetchProductList = async () => {
    setProductListLoading(true);
    try {
      const response = await api.get('/products');
      setProductList(response.data);
    } catch (err) {
      console.error('Error fetching product list', err);
    } finally {
      setProductListLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar este producto? Esta acción no se puede deshacer.')) return;
    try {
      await api.delete(`/products/${id}`);
      setProductList(prev => prev.filter(p => p.id !== id));
      setSuccessMsg('Producto eliminado correctamente.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Error al eliminar el producto.');
    }
  };

  const handleToggleHidden = async (product) => {
    try {
      await api.patch(`/products/${product.id}`, { hidden: !product.hidden });
      setProductList(prev => prev.map(p => p.id === product.id ? { ...p, hidden: !p.hidden } : p));
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Error al actualizar el producto.');
    }
  };

  const handleManualSaleSubmit = async (e) => {
    e.preventDefault();
    setManualSaleLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      await api.post('/dashboard/sales/manual', manualSale);
      setSuccessMsg('Venta manual registrada exitosamente.');
      setShowManualModal(false);
      setManualSale({ product_id: '', variant_id: '', quantity: 1, dorsal: '' });
      fetchSales(); // Refresh sales list
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Error al registrar la venta manual.');
    } finally {
      setManualSaleLoading(false);
    }
  };

  // Helper to get selected product's variants
  const selectedProduct = productsForSale.find(p => p.id === parseInt(manualSale.product_id));
  const selectedVariants = selectedProduct?.variants || [];

  // Smart Price Calculation
  useEffect(() => {
    if (formData.precio_costo) {
      const costo = parseFloat(formData.precio_costo);
      if (!isNaN(costo)) {
        const suggested = costo * 1.50;
        const currentVenta = parseFloat(formData.precio_venta);
        
        if (!isNaN(currentVenta) && currentVenta < suggested) {
          setPriceWarning(true);
        } else {
          setPriceWarning(false);
        }
      }
    } else {
      setPriceWarning(false);
    }
  }, [formData.precio_costo, formData.precio_venta]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'imageFiles') {
      setFormData(prev => ({ ...prev, imageFiles: [...prev.imageFiles, ...Array.from(files)] }));
      return;
    }

    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      if (name === 'precio_costo' && value !== '') {
        const costo = parseFloat(value);
        if (!isNaN(costo)) {
          updated.precio_venta = (costo * 1.50).toFixed(2);
        }
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('category', formData.category);
      payload.append('description', formData.description);
      // Ensure we send numbers as strings for proper backend parsing
      payload.append('precio_costo', parseFloat(formData.precio_costo).toString());
      payload.append('precio_venta', parseFloat(formData.precio_venta).toString());
      payload.append('price', parseFloat(formData.precio_venta).toString());
      
      // Construir variantes dinámicamente
      let variants = [];
      if (formData.category === 'jersey') {
        if (parseInt(formData.stockS) > 0) variants.push({ model: 'Default', size: 'S', stock: parseInt(formData.stockS) });
        if (parseInt(formData.stockM) > 0) variants.push({ model: 'Default', size: 'M', stock: parseInt(formData.stockM) });
        if (parseInt(formData.stockL) > 0) variants.push({ model: 'Default', size: 'L', stock: parseInt(formData.stockL) });
        if (parseInt(formData.stockXL) > 0) variants.push({ model: 'Default', size: 'XL', stock: parseInt(formData.stockXL) });
      } else {
        variants.push({ model: 'Default', size: formData.size || 'Unica', stock: parseInt(formData.stock) });
      }

      payload.append('variants', JSON.stringify(variants));
      
      if (formData.dorsales) {
        payload.append('dorsales', formData.dorsales);
      }

      if (formData.imageFiles && formData.imageFiles.length > 0) {
        formData.imageFiles.forEach(file => {
          payload.append('images', file);
        });
      } else if (formData.image_url) {
        payload.append('image_url', formData.image_url);
      }

      await api.post('/products', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setSuccessMsg('¡Producto guardado exitosamente!');
      setFormData({
        name: '', category: 'jersey', description: '', precio_costo: '', precio_venta: '', image_url: '', imageFiles: [], size: 'Unica', stock: 0, stockS: 0, stockM: 0, stockL: 0, stockXL: 0, dorsales: ''
      });
      
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Error al guardar el producto.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '14px',
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid var(--glass-border)',
    borderRadius: '10px',
    color: 'var(--text-white)',
    fontSize: '1rem',
    outline: 'none',
    marginBottom: '15px'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    color: 'var(--text-silver)',
    fontSize: '0.9rem',
    fontWeight: 600
  };

  const sidebarBtnStyle = (tabId) => ({
    background: activeTab === tabId ? 'var(--accent-red)' : 'transparent',
    color: 'white', border: 'none', padding: '15px 20px', borderRadius: '12px',
    textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px',
    cursor: 'pointer', transition: 'all 0.2s ease-in-out', fontWeight: 600,
    fontSize: '1rem', marginBottom: '8px'
  });

  const MetricCard = ({ title, value, icon, prefix = '' }) => (
    <div style={{
      background: 'var(--bg-space-lighter)',
      border: '1px solid var(--glass-border)',
      borderRadius: '16px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <span style={{ color: 'var(--text-silver)', fontWeight: 600, fontSize: '0.95rem' }}>{title}</span>
        <div style={{ padding: '10px', background: 'rgba(229, 9, 20, 0.1)', borderRadius: '10px', color: 'var(--accent-red)' }}>
          {icon}
        </div>
      </div>
      <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-white)' }}>
        {prefix}{value}
      </span>
      {/* Decorative glow */}
      <div style={{
        position: 'absolute', bottom: '-20px', right: '-20px', width: '100px', height: '100px',
        background: 'var(--accent-red)', filter: 'blur(50px)', opacity: 0.1, borderRadius: '50%'
      }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)', background: 'var(--bg-space)' }}>
      {/* Sidebar ERP Style */}
      <div style={{ 
        width: '280px', 
        background: 'var(--bg-space-lighter)', 
        borderRight: '1px solid var(--glass-border)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 20px rgba(0,0,0,0.3)'
      }}>
        <div style={{ padding: '30px 20px', borderBottom: '1px solid var(--glass-border)' }}>
          <h2 style={{ color: 'var(--text-white)', fontSize: '0.85rem', letterSpacing: '2px', fontWeight: 700, margin: 0, opacity: 0.6 }}>
            ADMINISTRACIÓN
          </h2>
        </div>
        
        <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <button onClick={() => setActiveTab('home')} style={sidebarBtnStyle('home')}>
            <LayoutDashboard size={20} /> Inicio
          </button>
          
          <button onClick={() => setActiveTab('inventory')} style={sidebarBtnStyle('inventory')}>
            <PackagePlus size={20} /> Inventario / Cargar
          </button>

          <button onClick={() => setActiveTab('orders')} style={sidebarBtnStyle('orders')}>
            <ClipboardList size={20} /> Verificar Pagos
          </button>

          <button onClick={() => setActiveTab('sales')} style={sidebarBtnStyle('sales')}>
            <ShoppingCart size={20} /> Módulo de Ventas
          </button>

          <button onClick={() => setActiveTab('exchange')} style={sidebarBtnStyle('exchange')}>
            <RefreshCw size={20} /> Tasas de Cambio
          </button>
        </div>

        <div style={{ padding: '20px', borderTop: '1px solid var(--glass-border)' }}>
          <a href="/" target="_blank" rel="noopener noreferrer" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            background: 'rgba(255,255,255,0.05)', color: 'var(--text-white)', padding: '15px',
            borderRadius: '12px', textDecoration: 'none', fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            Ver Tienda <ExternalLink size={18} />
          </a>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        
        {/* --- INICIO TAB --- */}
        {activeTab === 'home' && (
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h1 style={{ color: 'var(--text-white)', fontSize: '2.2rem', marginBottom: '10px', fontWeight: 800 }}>Dashboard General</h1>
            <p style={{ color: 'var(--text-silver)', marginBottom: '40px', fontSize: '1.1rem' }}>Resumen del rendimiento intergaláctico de la tienda.</p>

            {metricsLoading ? (
              <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-silver)' }}>
                <Activity size={40} style={{ animation: 'pulse 2s infinite', marginBottom: '15px', color: 'var(--accent-red)' }} />
                <p>Calculando métricas...</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                <MetricCard 
                  title="Productos en Catálogo" 
                  value={metrics.totalProducts} 
                  icon={<Package size={24} />} 
                />
                <MetricCard 
                  title="Total Ventas (Artículos)" 
                  value={metrics.totalSales} 
                  icon={<ShoppingCart size={24} />} 
                />
                <MetricCard 
                  title="Ingresos Totales" 
                  value={Number(metrics.totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 2 })} 
                  prefix="$"
                  icon={<DollarIcon size={24} />} 
                />
                <MetricCard 
                  title="Ganancia Neta" 
                  value={Number(metrics.netProfit).toLocaleString('en-US', { minimumFractionDigits: 2 })} 
                  prefix="$"
                  icon={<TrendingUp size={24} />} 
                />
              </div>
            )}
          </div>
        )}

        {/* --- INVENTORY TAB --- */}
        {activeTab === 'inventory' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ color: 'var(--text-white)', fontSize: '2rem', marginBottom: '10px' }}>Inventario / Cargar Mercancía</h1>
            <p style={{ color: 'var(--text-silver)', marginBottom: '30px' }}>Añade nuevos productos al arsenal intergaláctico.</p>

            <div style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)',
              borderRadius: '24px', padding: '40px', backdropFilter: 'blur(10px)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
            }}>
              
              {successMsg && (
                <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', padding: '16px', borderRadius: '12px', marginBottom: '25px', border: '1px solid rgba(74, 222, 128, 0.3)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   ✅ {successMsg}
                </div>
              )}
              {errorMsg && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', padding: '16px', borderRadius: '12px', marginBottom: '25px', border: '1px solid rgba(248, 113, 113, 0.3)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <AlertTriangle size={20} /> {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                    <label style={labelStyle}>Nombre del Producto</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleInputChange} style={inputStyle} placeholder="Ej. Jersey Real Madrid" />
                  </div>
                  <div>
                    <label style={labelStyle}>Categoría</label>
                    <select name="category" value={formData.category} onChange={handleInputChange} style={inputStyle}>
                      <option value="jersey">Jersey</option>
                      <option value="cap">Cap</option>
                    </select>
                  </div>
                </div>

                {formData.category === 'jersey' ? (
                  <>
                    <div style={{ marginBottom: '24px' }}>
                      <label style={labelStyle}>Dorsales Disponibles (Jugadores / Estrellas)</label>
                      <input type="text" name="dorsales" value={formData.dorsales} onChange={handleInputChange} style={inputStyle} placeholder="Ej. Vinicius Jr #7, Bellingham #5" />
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{...labelStyle, marginBottom: '15px'}}>Inventario por Tallas</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                        <div>
                          <label style={{...labelStyle, fontSize: '0.8rem', color: '#fff'}}>Talla S</label>
                          <input required type="number" min="0" name="stockS" value={formData.stockS} onChange={handleInputChange} style={{...inputStyle, padding: '10px'}} />
                        </div>
                        <div>
                          <label style={{...labelStyle, fontSize: '0.8rem', color: '#fff'}}>Talla M</label>
                          <input required type="number" min="0" name="stockM" value={formData.stockM} onChange={handleInputChange} style={{...inputStyle, padding: '10px'}} />
                        </div>
                        <div>
                          <label style={{...labelStyle, fontSize: '0.8rem', color: '#fff'}}>Talla L</label>
                          <input required type="number" min="0" name="stockL" value={formData.stockL} onChange={handleInputChange} style={{...inputStyle, padding: '10px'}} />
                        </div>
                        <div>
                          <label style={{...labelStyle, fontSize: '0.8rem', color: '#fff'}}>Talla XL</label>
                          <input required type="number" min="0" name="stockXL" value={formData.stockXL} onChange={handleInputChange} style={{...inputStyle, padding: '10px'}} />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div>
                      <label style={labelStyle}>Talla Principal</label>
                      <input required type="text" name="size" value={formData.size} onChange={handleInputChange} style={inputStyle} placeholder="Ej. Unica" />
                    </div>
                    <div>
                      <label style={labelStyle}>Stock Inicial</label>
                      <input required type="number" min="0" name="stock" value={formData.stock} onChange={handleInputChange} style={inputStyle} />
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
                  <div>
                    <label style={labelStyle}>Imágenes del Producto</label>
                    <label style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '20px',
                      background: formData.imageFiles.length > 0 ? 'rgba(34, 197, 94, 0.05)' : 'rgba(255,255,255,0.03)',
                      border: `2px dashed ${formData.imageFiles.length > 0 ? '#4ade80' : 'var(--glass-border)'}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      color: formData.imageFiles.length > 0 ? '#4ade80' : 'var(--text-silver)',
                      gap: '10px'
                    }}
                    onMouseOver={(e) => { 
                      if(formData.imageFiles.length === 0) {
                        e.currentTarget.style.borderColor = 'var(--accent-red)'; 
                        e.currentTarget.style.color = 'var(--text-white)'; 
                      }
                    }}
                    onMouseOut={(e) => { 
                      if(formData.imageFiles.length === 0) {
                        e.currentTarget.style.borderColor = 'var(--glass-border)'; 
                        e.currentTarget.style.color = 'var(--text-silver)'; 
                      }
                    }}
                    >
                      <UploadCloud size={28} />
                      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                        {formData.imageFiles.length > 0 ? `✅ ${formData.imageFiles.length} archivo(s) listo(s)` : 'Haz clic para seleccionar imágenes'}
                      </span>
                      <input type="file" name="imageFiles" onChange={handleInputChange} style={{ display: 'none' }} accept="image/*" multiple />
                    </label>
                    
                    {formData.imageFiles.length > 0 && (
                      <button 
                        type="button" 
                        onClick={() => setFormData(prev => ({ ...prev, imageFiles: [] }))} 
                        style={{
                          marginTop: '10px', width: '100%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', 
                          border: '1px solid rgba(239, 68, 68, 0.3)', padding: '8px', borderRadius: '8px', 
                          fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                        }}
                      >
                        <X size={14} /> Borrar selección
                      </button>
                    )}
                  </div>
                  <div>
                    <label style={labelStyle}>O usa una URL externa</label>
                    <input type="text" name="image_url" value={formData.image_url} onChange={handleInputChange} style={inputStyle} placeholder="https://..." disabled={formData.imageFiles.length > 0} />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '30px 0', paddingTop: '30px' }}>
                  <h3 style={{ color: 'var(--text-white)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem' }}>
                    <div style={{ background: 'rgba(229, 9, 20, 0.2)', padding: '8px', borderRadius: '8px' }}>
                      <DollarSign size={20} color="var(--accent-red)" />
                    </div>
                    Configuración Financiera (USDT)
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div>
                      <label style={labelStyle}>Precio de Costo</label>
                      <input required type="number" step="0.01" min="0" name="precio_costo" value={formData.precio_costo} onChange={handleInputChange} style={inputStyle} placeholder="0.00" />
                    </div>
                    <div>
                      <label style={labelStyle}>Precio de Venta Sugerido</label>
                      <input required type="number" step="0.01" min="0" name="precio_venta" value={formData.precio_venta} onChange={handleInputChange} style={{...inputStyle, borderColor: priceWarning ? '#facc15' : 'var(--glass-border)'}} placeholder="0.00" />
                    </div>
                  </div>

                  {priceWarning && (
                    <div style={{ 
                      background: 'rgba(250, 204, 21, 0.05)', color: '#facc15', padding: '14px 18px', 
                      borderRadius: '12px', border: '1px solid rgba(250, 204, 21, 0.3)', display: 'flex', alignItems: 'center', gap: '12px',
                      fontSize: '0.95rem', marginTop: '5px', marginBottom: '20px'
                    }}>
                      <AlertTriangle size={20} /> 
                      <span><strong>Advertencia de Margen:</strong> El precio asignado está por debajo de la sugerencia automática.</span>
                    </div>
                  )}
                </div>

                <button type="submit" disabled={loading} style={{
                  background: 'var(--accent-red)', color: 'white', padding: '18px 30px', border: 'none',
                  borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', cursor: loading ? 'wait' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px', transition: 'all 0.3s',
                  width: '100%', boxShadow: '0 10px 20px rgba(229, 9, 20, 0.2)'
                }}>
                  <Save size={20} /> {loading ? 'Procesando en el servidor...' : 'Guardar Producto en el Catálogo'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* --- SALES TAB --- */}
        {activeTab === 'sales' && (
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h1 style={{ color: 'var(--text-white)', fontSize: '2rem', marginBottom: '5px' }}>Módulo de Ventas</h1>
                <p style={{ color: 'var(--text-silver)' }}>Historial de órdenes y registro manual.</p>
              </div>
              <button 
                onClick={() => setShowManualModal(true)}
                style={{
                  background: 'var(--accent-red)', color: 'white', padding: '12px 20px', border: 'none',
                  borderRadius: '10px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 5px 15px rgba(229, 9, 20, 0.2)'
                }}
              >
                <Plus size={18} /> Registrar Venta Manual
              </button>
            </div>

            {successMsg && (
              <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid rgba(74, 222, 128, 0.3)' }}>
                 ✅ {successMsg}
              </div>
            )}
            
            {errorMsg && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid rgba(248, 113, 113, 0.3)' }}>
                 <AlertTriangle size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px' }}/> {errorMsg}
              </div>
            )}

            <div style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)',
              borderRadius: '16px', overflow: 'hidden', backdropFilter: 'blur(10px)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: 'var(--text-white)' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--glass-border)' }}>
                    <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-silver)' }}>Fecha</th>
                    <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-silver)' }}>Producto</th>
                    <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-silver)' }}>Variante / Dorsal</th>
                    <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-silver)' }}>Cant.</th>
                    <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-silver)' }}>Precio Total</th>
                    <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-silver)' }}>Ganancia Neta</th>
                    <th style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--text-silver)' }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {salesLoading ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-silver)' }}>
                        <Activity size={30} style={{ animation: 'pulse 2s infinite', color: 'var(--accent-red)' }} />
                      </td>
                    </tr>
                  ) : sales.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-silver)' }}>No hay ventas registradas aún.</td>
                    </tr>
                  ) : (
                    sales.map(sale => (
                      <tr key={sale.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '15px 20px', fontSize: '0.9rem' }}>{new Date(sale.created_at).toLocaleDateString()}</td>
                        <td style={{ padding: '15px 20px' }}>
                          <span style={{ fontWeight: 600 }}>{sale.productName}</span>
                          <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-silver)' }}>{sale.category}</span>
                        </td>
                        <td style={{ padding: '15px 20px' }}>
                          <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.85rem' }}>{sale.variantSize}</span>
                          {sale.dorsal && <span style={{ display: 'block', fontSize: '0.85rem', marginTop: '4px', color: 'var(--text-silver)' }}>Dorsal: {sale.dorsal}</span>}
                        </td>
                        <td style={{ padding: '15px 20px', fontWeight: 'bold' }}>{sale.quantity}</td>
                        <td style={{ padding: '15px 20px' }}>${Number(sale.total).toFixed(2)}</td>
                        <td style={{ padding: '15px 20px', color: '#4ade80', fontWeight: 'bold' }}>+${Number(sale.profit).toFixed(2)}</td>
                        <td style={{ padding: '15px 20px' }}>
                          <span style={{ 
                            background: sale.status === 'completed' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(250, 204, 21, 0.1)', 
                            color: sale.status === 'completed' ? '#4ade80' : '#facc15',
                            padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 
                          }}>
                            {sale.status === 'completed' ? 'Completado' : 'Pendiente'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal de Venta Manual */}
            {showManualModal && (
              <div style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
              }}>
                <div style={{
                  background: 'var(--bg-space)', border: '1px solid var(--glass-border)',
                  borderRadius: '24px', padding: '30px', width: '100%', maxWidth: '500px',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ color: 'var(--text-white)', margin: 0 }}>Registrar Venta Manual</h2>
                    <button onClick={() => setShowManualModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-silver)', cursor: 'pointer' }}>
                      <X size={24} />
                    </button>
                  </div>
                  
                  <form onSubmit={handleManualSaleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                      <label style={labelStyle}>Producto</label>
                      <select required style={inputStyle} value={manualSale.product_id} onChange={(e) => setManualSale({...manualSale, product_id: e.target.value, variant_id: ''})}>
                        <option value="">Seleccione un producto</option>
                        {productsForSale.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (${p.precio_venta || p.price})</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <label style={labelStyle}>Variante / Talla</label>
                      <select required style={inputStyle} value={manualSale.variant_id} onChange={(e) => setManualSale({...manualSale, variant_id: e.target.value})} disabled={!manualSale.product_id}>
                        <option value="">Seleccione una variante</option>
                        {selectedVariants.map(v => (
                          <option key={v.id} value={v.id} disabled={v.stock <= 0}>
                            Talla: {v.size} (Stock: {v.stock})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                      <div>
                        <label style={labelStyle}>Cantidad</label>
                        <input required type="number" min="1" style={inputStyle} value={manualSale.quantity} onChange={(e) => setManualSale({...manualSale, quantity: parseInt(e.target.value)})} />
                      </div>
                      <div>
                        <label style={labelStyle}>Dorsal (Opcional)</label>
                        <input type="text" placeholder="Ej. Vinicius Jr #7" style={inputStyle} value={manualSale.dorsal} onChange={(e) => setManualSale({...manualSale, dorsal: e.target.value})} disabled={selectedProduct?.category !== 'jersey'} />
                      </div>
                    </div>

                    <button type="submit" disabled={manualSaleLoading} style={{
                      background: 'var(--accent-red)', color: 'white', padding: '16px', border: 'none',
                      borderRadius: '12px', fontSize: '1.05rem', fontWeight: 'bold', cursor: manualSaleLoading ? 'wait' : 'pointer',
                      width: '100%', marginTop: '10px'
                    }}>
                      {manualSaleLoading ? 'Registrando...' : 'Confirmar Venta y Descontar Stock'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- ORDERS TAB --- */}
        {activeTab === 'orders' && (
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h1 style={{ color: 'var(--text-white)', fontSize: '2rem', marginBottom: '8px' }}>Verificar Pagos</h1>
            <p style={{ color: 'var(--text-silver)', marginBottom: '24px' }}>Revisa los comprobantes y cambia el estado de las órdenes.</p>

            {successMsg && <div style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80', padding: '14px', borderRadius: '10px', marginBottom: '16px', border: '1px solid rgba(74,222,128,0.3)' }}>{successMsg}</div>}
            {errorMsg && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', padding: '14px', borderRadius: '10px', marginBottom: '16px', border: '1px solid rgba(248,113,113,0.3)' }}>{errorMsg}</div>}

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {[
                { key: 'paid_to_verify', label: 'Por verificar' },
                { key: 'pending', label: 'Pendientes' },
                { key: 'completed', label: 'Completadas' },
                { key: 'cancelled', label: 'Canceladas' }
              ].map(f => (
                <button key={f.key} onClick={() => { setOrdersFilter(f.key); fetchOrders(f.key); }}
                  style={{
                    padding: '8px 18px', borderRadius: '20px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s',
                    background: ordersFilter === f.key ? 'var(--accent-red)' : 'transparent',
                    border: `1px solid ${ordersFilter === f.key ? 'var(--accent-red)' : 'var(--glass-border)'}`,
                    color: ordersFilter === f.key ? 'white' : 'var(--text-silver)'
                  }}
                >{f.label}</button>
              ))}
            </div>

            {ordersLoading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-silver)' }}>
                <Activity size={36} style={{ animation: 'pulse 2s infinite', color: 'var(--accent-red)' }} />
              </div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-silver)', border: '1px dashed var(--glass-border)', borderRadius: '16px' }}>
                No hay órdenes en este estado.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {orders.map(order => (
                  <div key={order.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '16px', overflow: 'hidden' }}>
                    {/* Order header */}
                    <div style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ color: 'var(--text-white)', fontWeight: 700, fontSize: '1.05rem' }}>Orden #{order.id}</span>
                        <span style={{ color: 'var(--text-silver)', fontSize: '0.9rem' }}>{order.userName} — {order.userEmail}</span>
                        <span style={{ color: 'var(--text-silver)', fontSize: '0.85rem' }}>{new Date(order.created_at).toLocaleDateString()}</span>
                        <span style={{
                          padding: '3px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600,
                          background: order.status === 'completed' ? 'rgba(34,197,94,0.1)' : order.status === 'paid_to_verify' ? 'rgba(250,204,21,0.1)' : order.status === 'cancelled' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.08)',
                          color: order.status === 'completed' ? '#4ade80' : order.status === 'paid_to_verify' ? '#facc15' : order.status === 'cancelled' ? '#f87171' : 'var(--text-silver)'
                        }}>{order.status}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ color: 'var(--accent-red)', fontWeight: 800, fontSize: '1.1rem' }}>${Number(order.total).toFixed(2)}</span>
                        <button onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                          style={{ background: 'rgba(255,255,255,0.07)', border: 'none', color: 'var(--text-silver)', cursor: 'pointer', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem' }}>
                          <Eye size={14} /> {expandedOrder === order.id ? 'Cerrar' : 'Ver detalles'}
                        </button>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {expandedOrder === order.id && (
                      <div style={{ borderTop: '1px solid var(--glass-border)', padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                          <h4 style={{ color: 'var(--text-silver)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px 0' }}>Datos de Envío</h4>
                          <p style={{ color: 'var(--text-white)', margin: '4px 0' }}><strong>Nombre:</strong> {order.shipping_name || '—'}</p>
                          <p style={{ color: 'var(--text-white)', margin: '4px 0' }}><strong>Teléfono:</strong> {order.shipping_phone || '—'}</p>
                          <p style={{ color: 'var(--text-white)', margin: '4px 0' }}><strong>Dirección:</strong> {order.shipping_address || '—'}</p>
                        </div>
                        <div>
                          <h4 style={{ color: 'var(--text-silver)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px 0' }}>Pago</h4>
                          <p style={{ color: 'var(--text-white)', margin: '4px 0' }}><strong>Método:</strong> {order.payment_method || '—'}</p>
                          <p style={{ color: 'var(--text-white)', margin: '4px 0' }}><strong>Referencia:</strong> {order.reference || '—'}</p>
                          <p style={{ color: 'var(--text-white)', margin: '4px 0' }}><strong>Monto declarado:</strong> ${order.paymentAmount ? Number(order.paymentAmount).toFixed(2) : '—'}</p>
                          {order.receipt_url && (
                            <a href={`http://localhost:5000${order.receipt_url}`} target="_blank" rel="noopener noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '10px', color: '#60a5fa', fontSize: '0.9rem', fontWeight: 600 }}>
                              <Eye size={14} /> Ver comprobante
                            </a>
                          )}
                        </div>

                        {/* Action buttons */}
                        {(order.status === 'paid_to_verify' || order.status === 'pending') && (
                          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', paddingTop: '12px', borderTop: '1px solid var(--glass-border)' }}>
                            <button
                              onClick={() => handleOrderStatus(order.id, 'completed')}
                              disabled={orderActionLoading === order.id}
                              style={{ flex: 1, padding: '12px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                              <CheckCheck size={16} /> Marcar como Completada
                            </button>
                            <button
                              onClick={() => handleOrderStatus(order.id, 'cancelled')}
                              disabled={orderActionLoading === order.id}
                              style={{ flex: 1, padding: '12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                              <XCircle size={16} /> Cancelar Orden
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- EXCHANGE TAB --- */}
        {activeTab === 'exchange' && (
          <div>
            <h1 style={{ color: 'var(--text-white)', fontSize: '2rem', marginBottom: '10px' }}>Tasas de Cambio</h1>
            <p style={{ color: 'var(--text-silver)' }}>En desarrollo...</p>
          </div>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}} />
    </div>
  );
};

export default AdminDashboard;
