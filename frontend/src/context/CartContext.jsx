import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('foodexpress_cart');
    return saved ? JSON.parse(saved) : { items: [], restaurant: null };
  });

  const [conflictModal, setConflictModal] = useState({
    isOpen: false,
    pendingItem: null,
    pendingRestaurant: null
  });

  useEffect(() => {
    localStorage.setItem('foodexpress_cart', JSON.stringify(cart));
  }, [cart]);

  const addItem = (item, restaurant) => {
    // Check if cart has items from another restaurant
    if (cart.restaurant && cart.restaurant.restaurant_id !== restaurant.restaurant_id && cart.items.length > 0) {
      setConflictModal({
        isOpen: true,
        pendingItem: item,
        pendingRestaurant: restaurant
      });
      return false;
    }

    setCart((prev) => {
      const existingIndex = prev.items.findIndex((i) => i.item_id === item.item_id);
      let updatedItems;

      if (existingIndex > -1) {
        updatedItems = prev.items.map((i, idx) =>
          idx === existingIndex ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        updatedItems = [
          ...prev.items,
          {
            item_id: item.item_id,
            name: item.name,
            price: parseFloat(item.price),
            image_url: item.image_url,
            is_vegetarian: item.is_vegetarian,
            quantity: 1
          }
        ];
      }

      return {
        restaurant: {
          restaurant_id: restaurant.restaurant_id,
          name: restaurant.name,
          city: restaurant.city
        },
        items: updatedItems
      };
    });

    return true;
  };

  const confirmResetCartWithNewItem = () => {
    if (conflictModal.pendingItem && conflictModal.pendingRestaurant) {
      setCart({
        restaurant: {
          restaurant_id: conflictModal.pendingRestaurant.restaurant_id,
          name: conflictModal.pendingRestaurant.name,
          city: conflictModal.pendingRestaurant.city
        },
        items: [
          {
            item_id: conflictModal.pendingItem.item_id,
            name: conflictModal.pendingItem.name,
            price: parseFloat(conflictModal.pendingItem.price),
            image_url: conflictModal.pendingItem.image_url,
            is_vegetarian: conflictModal.pendingItem.is_vegetarian,
            quantity: 1
          }
        ]
      });
    }
    setConflictModal({ isOpen: false, pendingItem: null, pendingRestaurant: null });
  };

  const cancelConflict = () => {
    setConflictModal({ isOpen: false, pendingItem: null, pendingRestaurant: null });
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.item_id === itemId ? { ...item, quantity } : item
      )
    }));
  };

  const removeItem = (itemId) => {
    setCart((prev) => {
      const updatedItems = prev.items.filter((item) => item.item_id !== itemId);
      return {
        restaurant: updatedItems.length === 0 ? null : prev.restaurant,
        items: updatedItems
      };
    });
  };

  const clearCart = () => {
    setCart({ items: [], restaurant: null });
  };

  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const deliveryFee = cart.items.length > 0 ? 40.00 : 0.00;
  const total = Math.round((subtotal + tax + deliveryFee) * 100) / 100;
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        tax,
        deliveryFee,
        total,
        itemCount,
        conflictModal,
        confirmResetCartWithNewItem,
        cancelConflict
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

