import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';

function App() {
    const { isAuthenticated } = useAuth();
    const { fetchCart } = useCart();

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        }
    }, [isAuthenticated]);

    return (
        <div className="App">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/cart" element={<Cart />} />
            </Routes>
        </div>
    );
}

export default App;
