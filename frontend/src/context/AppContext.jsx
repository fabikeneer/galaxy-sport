import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

const loadCartFromStorage = () => {
  try {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [cart, setCart] = useState(loadCartFromStorage);
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'USDT');

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

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, variant, quantity, dorsal = null) => {
    setCart(prev => [...prev, { product, variant, quantity, dorsal }]);
  };

  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index, newQuantity) => {
    setCart(prev => prev.map((item, i) => i === index ? { ...item, quantity: newQuantity } : item));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

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
