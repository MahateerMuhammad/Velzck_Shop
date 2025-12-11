import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import api from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = Cookies.get('token');
        if (token) {
            try {
                const { data } = await api.get('/auth/profile');
                setUser(data.data.user);
            } catch (error) {
                console.error('Auth check failed:', error);
                Cookies.remove('token');
                Cookies.remove('refreshToken');
            }
        }
        setLoading(false);
    };

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        Cookies.set('token', data.token, { expires: 7 });
        Cookies.set('refreshToken', data.refreshToken, { expires: 7 });
        setUser(data.data.user);
        return data;
    };

    const register = async (name, email, password) => {
        const { data } = await api.post('/auth/register', { name, email, password });
        Cookies.set('token', data.token, { expires: 7 });
        Cookies.set('refreshToken', data.refreshToken, { expires: 7 });
        setUser(data.data.user);
        return data;
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        }
        Cookies.remove('token');
        Cookies.remove('refreshToken');
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
