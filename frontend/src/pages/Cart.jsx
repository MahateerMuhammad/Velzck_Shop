import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import { Link } from 'react-router-dom';

const Cart = () => {
    const { cart, removeFromCart, clearCart, subtotal } = useCart();

    return (
        <>
            <Header />
            <div style={{ paddingTop: '10rem', minHeight: '100vh', paddingBottom: '4rem' }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                    <h2 style={{ color: '#fff', textTransform: 'uppercase', marginBottom: '3rem', fontSize: '3rem' }}>Your Cart</h2>

                    {(!cart || cart.items.length === 0) ? (
                        <div style={{ color: '#fff', textAlign: 'center', fontSize: '1.5rem' }}>
                            <p>Your cart is empty.</p>
                            <Link to="/" style={{ color: '#aaa', textDecoration: 'underline', marginTop: '1rem', display: 'inline-block' }}>Continue Shopping</Link>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '4rem' }}>
                            <div className="cart-items">
                                {cart.items.map((item) => (
                                    <div key={item._id} style={{
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        borderRadius: '1rem',
                                        padding: '2rem',
                                        marginBottom: '2rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                            <img
                                                src={item.product?.images?.[0]?.url || '/imgs/1.1.webp'}
                                                alt={item.product?.name}
                                                style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '0.5rem' }}
                                            />
                                            <div>
                                                <h3 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '0.5rem' }}>{item.product?.name}</h3>
                                                <p style={{ color: '#ccc' }}>Size: {item.size}</p>
                                                <p style={{ color: '#ccc' }}>Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '1rem' }}>${(item.price * item.quantity).toFixed(2)}</p>
                                            <button
                                                onClick={() => removeFromCart(item._id)}
                                                style={{ color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase', fontSize: '0.9rem' }}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={clearCart}
                                    style={{ color: '#aaa', background: 'none', border: '1px solid #aaa', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer' }}
                                >
                                    Clear Cart
                                </button>
                            </div>

                            <div className="cart-summary" style={{
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                padding: '3rem',
                                borderRadius: '1rem',
                                height: 'fit-content'
                            }}>
                                <h3 style={{ color: '#fff', textTransform: 'uppercase', marginBottom: '2rem' }}>Summary</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#ccc' }}>
                                    <span>Subtotal</span>
                                    <span>${subtotal?.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', color: '#ccc' }}>
                                    <span>Shipping</span>
                                    <span>Free</span>
                                </div>
                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', color: '#fff', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                    <span>Total</span>
                                    <span>${subtotal?.toFixed(2)}</span>
                                </div>
                                <button style={{
                                    width: '100%',
                                    padding: '1.5rem',
                                    backgroundColor: '#fff',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem'
                                }}>
                                    Checkout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Cart;
