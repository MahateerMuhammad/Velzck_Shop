import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const CartContext = createContext(null);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/cart');
            setCart(data.data.cart);
        } catch (error) {
            console.error('Fetch cart error:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId, size, quantity = 1) => {
        try {
            const { data } = await api.post('/cart', { productId, size, quantity });
            setCart(data.data.cart);
            return data;
        } catch (error) {
            throw error;
        }
    };

    const updateCartItem = async (itemId, quantity) => {
        try {
            const { data } = await api.put(`/cart/${itemId}`, { quantity });
            setCart(data.data.cart);
            return data;
        } catch (error) {
            throw error;
        }
    };

    const removeFromCart = async (itemId) => {
        try {
            const { data } = await api.delete(`/cart/${itemId}`);
            setCart(data.data.cart);
            return data;
        } catch (error) {
            throw error;
        }
    };

    const clearCart = async () => {
        try {
            const { data } = await api.delete('/cart');
            setCart(data.data.cart);
            return data;
        } catch (error) {
            throw error;
        }
    };

    const value = {
        cart,
        loading,
        fetchCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        itemCount: cart?.totalItems || 0,
        subtotal: cart?.subtotal || 0,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
