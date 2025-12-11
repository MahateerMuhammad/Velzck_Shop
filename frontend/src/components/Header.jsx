import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();
    const { itemCount } = useCart();

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const closeMenu = () => {
        setMenuOpen(false);
    };

    return (
        <header id="top">
            <div className="cont-nav pMain">
                <Link to="/" onClick={closeMenu}>
                    <h1 className="tittle">
                        <span>Zeene</span> Shop
                    </h1>
                </Link>
                <div className="menuBar"></div>
                <div className="nav-main">
                    <nav>
                        <ul className={`nav-cont ${menuOpen ? 'active' : ''}`}>
                            <div className="dec-bar"></div>

                            <div className={`ul-cont ul1 ${menuOpen ? 'active' : ''}`}>
                                <li>
                                    <a href="#shop" onClick={closeMenu}>
                                        Shop
                                    </a>
                                </li>
                            </div>

                            <div className={`ul-cont ul2 ${menuOpen ? 'active' : ''}`}>
                                <li>
                                    <a href="#aboutUs" onClick={closeMenu}>
                                        about us
                                    </a>
                                </li>
                            </div>

                            <div className={`ul-cont ul3 ${menuOpen ? 'active' : ''}`}>
                                <li>
                                    <Link to="/cart" onClick={closeMenu}>
                                        Cart {itemCount > 0 && `(${itemCount})`}
                                    </Link>
                                </li>
                            </div>

                            <div className={`ul-cont ul4 ${menuOpen ? 'active' : ''}`}>
                                <li>
                                    {isAuthenticated ? (
                                        <Link to="/profile" onClick={closeMenu}>
                                            {user?.name}
                                        </Link>
                                    ) : (
                                        <Link to="/login" onClick={closeMenu}>
                                            Login
                                        </Link>
                                    )}
                                </li>
                            </div>
                        </ul>
                    </nav>
                </div>
                <div
                    className={`menu-btn ${menuOpen ? 'btn-active' : ''}`}
                    onClick={toggleMenu}
                >
                    <i className="fas fa-bars"></i>
                </div>
                <div
                    className={`menu-btn-active ${menuOpen ? 'close-active' : ''}`}
                    onClick={toggleMenu}
                >
                    <i className="fas fa-times"></i>
                </div>
            </div>
        </header>
    );
};

export default Header;
