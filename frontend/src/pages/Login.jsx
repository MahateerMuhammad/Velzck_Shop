import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login');
        }
    };

    return (
        <>
            <Header />
            <div style={{ paddingTop: '10rem', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ backgroundColor: 'rgba(0,0,0,0.8)', padding: '4rem', borderRadius: '1rem', width: '90%', maxWidth: '400px' }}>
                    <h2 style={{ color: '#fff', textAlign: 'center', marginBottom: '2rem', textTransform: 'uppercase' }}>Login</h2>
                    {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ padding: '1rem', borderRadius: '0.5rem', border: 'none' }}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ padding: '1rem', borderRadius: '0.5rem', border: 'none' }}
                            required
                        />
                        <button
                            type="submit"
                            style={{
                                padding: '1rem',
                                backgroundColor: '#fff',
                                color: '#000',
                                border: 'none',
                                borderRadius: '0.5rem',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            Login
                        </button>
                    </form>
                    <p style={{ color: '#ccc', textAlign: 'center', marginTop: '2rem' }}>
                        Don't have an account? <Link to="/register" style={{ color: '#fff', textDecoration: 'underline' }}>Register</Link>
                    </p>
                </div>
            </div>
        </>
    );
};

export default Login;
