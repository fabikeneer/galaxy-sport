import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [cart, setCart] = useState([]);
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'USDT');

  // Load user data if token exists (simplified for now)
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const addToCart = (product, variant, quantity) => {
    setCart(prev => [...prev, { product, variant, quantity }]);
  };

  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index, newQuantity) => {
    setCart(prev => prev.map((item, i) => i === index ? { ...item, quantity: newQuantity } : item));
  };

  const clearCart = () => setCart([]);

  return (
    <AppContext.Provider value={{
      user, setUser,
      token, setToken,
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      currency, setCurrency
    }}>
      {children}
    </AppContext.Provider>
  );
};
