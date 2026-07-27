import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, LogIn, UserPlus } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import api from '../services/api';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { setToken, setUser } = useContext(AppContext);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Login Request
        const res = await api.post('/auth/login', {
          email: formData.email,
          password: formData.password
        });
        
        // Save token to localStorage and context
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        
        // Redirect to Home
        navigate('/');
      } else {
        // Register Request
        await api.post('/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone
        });

        // Auto login after successful register
        const loginRes = await api.post('/auth/login', {
          email: formData.email,
          password: formData.password
        });

        localStorage.setItem('token', loginRes.data.token);
        setToken(loginRes.data.token);
        setUser(loginRes.data.user);
        
        navigate('/');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.response?.data?.error || 'Ocurrió un error en la transmisión de credenciales. Revisa tus datos.');
    } finally {
      setLoading(false);
    }
  };

  // Styling helpers
  const inputStyle = {
    width: '100%',
    padding: '16px',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid var(--glass-border)',
    borderRadius: '12px',
    color: 'var(--text-white)',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.3s, box-shadow 0.3s',
    marginBottom: '20px'
  };

  return (
    <div style={{ 
      minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px', position: 'relative', overflow: 'hidden'
    }}>
      {/* Background Subtle Glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(229, 9, 20, 0.12) 0%, rgba(11, 14, 20, 0) 70%)',
        borderRadius: '50%', zIndex: 0, pointerEvents: 'none'
      }}></div>

      <div style={{
        background: 'var(--bg-space-lighter)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '24px',
        padding: '50px 40px',
        width: '100%',
        maxWidth: '480px',
        zIndex: 1,
        boxShadow: '0 30px 60px rgba(0,0,0,0.6)'
      }}>
        
        {/* Logo Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '90px', height: '90px', borderRadius: '50%', overflow: 'hidden', 
            boxShadow: '0 0 30px rgba(229, 9, 20, 0.4)', border: '2px solid rgba(255,255,255,0.1)',
            marginBottom: '20px'
          }}>
            <img src="/logo-galaxy.jpeg" alt="Galaxy Sport Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-white)', margin: 0, letterSpacing: '2px' }}>
            {isLogin ? 'ACCESO SEGURO' : 'NUEVO RECLUTA'}
          </h1>
          <p style={{ color: 'var(--text-silver)', margin: '8px 0 0 0', fontSize: '1rem' }}>
            {isLogin ? 'Identifícate para continuar' : 'Únete a la legión espacial'}
          </p>
        </div>

        {error && (
          <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-red)', borderRadius: '12px', color: 'var(--accent-red)', display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '24px', fontSize: '0.9rem', lineHeight: 1.4 }}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} /> <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <input required type="text" name="name" value={formData.name} onChange={handleInputChange} style={inputStyle} placeholder="Nombre Completo" />
              <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} style={inputStyle} placeholder="Teléfono de Contacto" />
            </>
          )}

          <input required type="email" name="email" value={formData.email} onChange={handleInputChange} style={inputStyle} placeholder="Correo Electrónico" />
          <input required type="password" name="password" value={formData.password} onChange={handleInputChange} style={inputStyle} placeholder="Contraseña Segura" />

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%', padding: '20px', background: 'var(--accent-red)', color: 'white',
              border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 800,
              letterSpacing: '1px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
              cursor: loading ? 'wait' : 'pointer', transition: 'all 0.3s', opacity: loading ? 0.7 : 1,
              boxShadow: '0 10px 25px rgba(229, 9, 20, 0.3)', marginTop: '10px'
            }}
            onMouseEnter={(e) => {
              if(!loading) {
                e.currentTarget.style.background = 'var(--accent-red-hover)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 15px 30px rgba(229, 9, 20, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if(!loading) {
                e.currentTarget.style.background = 'var(--accent-red)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(229, 9, 20, 0.3)';
              }
            }}
          >
            {loading ? 'Sincronizando...' : (isLogin ? <><LogIn size={20} /> INGRESAR A LA GALAXIA</> : <><UserPlus size={20} /> ALISTARSE AHORA</>)}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button 
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(null); }}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-silver)', fontSize: '0.95rem', cursor: 'pointer', transition: 'color 0.2s', textDecoration: 'underline', fontWeight: 600 }}
            onMouseEnter={(e) => e.target.style.color = 'var(--text-white)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-silver)'}
          >
            {isLogin ? '¿Aún no tienes equipo? Regístrate aquí' : '¿Ya eres miembro? Inicia sesión'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;
