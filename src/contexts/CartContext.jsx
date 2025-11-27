import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const CartContext = createContext(null);

// LocalStorage key for cart persistence
const CART_STORAGE_KEY = 'minuteserv_cart';

// Load cart from localStorage
function loadCartFromStorage() {
  try {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    // Validate that it's an array
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    return [];
  }
}

// Save cart to localStorage
function saveCartToStorage(cart) {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
}

export function CartProvider({ children }) {
  // Initialize cart from localStorage
  const [cart, setCart] = useState(() => loadCartFromStorage());

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    saveCartToStorage(cart);
  }, [cart]);

  const addToCart = useCallback((service, quantity = 1) => {
    setCart(prev => {
      // If service has ID, check by ID first (for API services)
      // Otherwise check by name+category+tier (for JSON fallback)
      const existing = service.id 
        ? prev.find(item => item.id === service.id)
        : prev.find(item => 
            item.name === service.name && 
            item.category === service.category &&
            item.tier === service.tier
          );
      
      if (existing) {
        return prev.map(item => {
          const isMatch = service.id 
            ? item.id === service.id
            : (item.name === service.name &&
               item.category === service.category &&
               item.tier === service.tier);
          
          return isMatch
            ? { ...item, quantity: item.quantity + quantity, id: service.id || item.id } // Preserve/update ID
            : item;
        });
      }
      
      // Ensure ID is included when adding new service
      return [...prev, { ...service, quantity, id: service.id || null }];
    });
  }, []);

  const removeFromCart = useCallback((serviceName, category, tier) => {
    setCart(prev => 
      prev.filter(item => 
        !(item.name === serviceName && item.category === category && item.tier === tier)
      )
    );
  }, []);

  const updateQuantity = useCallback((serviceName, category, tier, quantity) => {
    setCart(prev =>
      prev.map(item =>
        item.name === serviceName &&
        item.category === category &&
        item.tier === tier
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    // Also clear from localStorage
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error clearing cart from localStorage:', error);
    }
  }, []);

  const getTotalPrice = useCallback(() => {
    return cart.reduce((total, item) => {
      // Correct price logic: productCost is the selling price, never use marketPrice for calculations
      const price =
        item.productCost ??
        item.price ??
        item.servicePrice ??
        0;
      return total + price * item.quantity;
    }, 0);
  }, [cart]);

  const getTotalItems = useCallback(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
