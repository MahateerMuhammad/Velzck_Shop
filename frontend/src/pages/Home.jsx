import { useState, useEffect } from 'react';
import api from '../utils/api';
import Header from '../components/Header';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const [addingToCart, setAddingToCart] = useState({});

    const [error, setError] = useState(null);

    useEffect(() => {
        // Initialize Rellax
        const script = document.createElement('script');
        script.src = '/rellax.min.js';
        script.async = true;
        script.onload = () => {
            if (window.Rellax) {
                new window.Rellax('.rellax');
            }
        };
        document.body.appendChild(script);

        fetchProducts();

        return () => {
            try {
                if (document.body.contains(script)) {
                    document.body.removeChild(script);
                }
            } catch (e) {
                // ignore
            }
        };
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products/featured');
            if (data?.data?.products) {
                setProducts(data.data.products);
            } else {
                console.error('Unexpected API response structure:', data);
                setError('Invalid Data Structure');
            }
        } catch (err) {
            console.error('Error fetching products:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (product) => {
        try {
            setAddingToCart({ ...addingToCart, [product._id]: true });
            const size = product.sizes?.[0]?.size || "OS";
            await addToCart(product._id, size, 1);
            alert('Added to cart!');
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Failed to add to cart: ' + (error.response?.data?.message || error.message));
        } finally {
            setAddingToCart({ ...addingToCart, [product._id]: false });
        }
    };

    return (
        <>
            <Header />

            {/* Hero Parallax */}
            <div className="hero-parallax">
                <div className="rellax snkbg" data-rellax-speed="-2.5" data-rellax-zindex="0"></div>
                <div className="rellax snk" data-rellax-speed="-1" data-rellax-zindex="1"></div>
            </div>

            {/* Hero Content */}
            <div className="hero-cont">
                <div className="hero">
                    <div className="heroText-cont">
                        <div className="heroText">
                            <div className="hText-cont">
                                <h2 className="hText-main">Wear your feet with</h2>
                                <div className="tbs-cont">
                                    <div className="scrollText-cont">
                                        <div className="scrollText">
                                            <h2><span>mike.</span></h2>
                                            <h2><span>the finer.</span></h2>
                                            <h2><span>the greater.</span></h2>
                                            <h2><span>the best.</span></h2>
                                            <h2><span>mike.</span></h2>
                                        </div>
                                    </div>
                                </div>
                                <p className="hText-p">
                                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sunt perferendis odit
                                    eaque cupiditate quo similique, voluptatum modi ex facilis enim eligendi repellendus laborum
                                    error placeat nam, hic doloremque perspiciatis.
                                </p>
                                <div className="cta-cont">
                                    <a className="cta" href="#shop">shop now</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="mn">
                {/* Notice Bar */}
                <div className="noticeBar" id="shop">
                    <h2 id="tx0">free shipping</h2>
                    <h2 id="tx1">50% discount</h2>
                    <h2 id="tx2">worldwide</h2>
                    <h2 id="tx3">50% discount</h2>
                    <h2 id="tx4">free shipping</h2>
                </div>

                {/* Products */}
                <div className="product-cont">
                    {loading ? (
                        <div style={{ color: '#fff', textAlign: 'center', padding: '4rem' }}>Loading products...</div>
                    ) : (
                        products.map((product, index) => {
                            const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
                            const contClass = `sneaker-cont${(index % 15) + 1}`;

                            return (
                                <div key={product._id} tabIndex="0" id="snkc" className={contClass}>
                                    <img loading="lazy" className="sneaker-img" src={primaryImage?.url || '/imgs/1.1.webp'} alt={product.name} />
                                    <div className="sneakerDesc">
                                        <div className="sneaker-decor"></div>
                                        <div className="data-cont">
                                            <div className="sneakerName">
                                                <h2>{product.name}</h2>
                                                <div className="snk-class">
                                                    <h3>{product.brand}</h3>
                                                </div>
                                            </div>
                                            <div className="btnBuy-cont" onClick={() => handleAddToCart(product)}>
                                                <div className="btnBuy">
                                                    <h3><i className="fas fa-shopping-cart"></i></h3>
                                                </div>
                                            </div>
                                            <div className="sneakerSize">
                                                <h3>Sizes</h3>
                                                <div className="sizes">
                                                    {product.sizes?.slice(0, 4).map(size => (
                                                        <span key={size._id}>{size.size}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Scroll Images - From original HTML */}
                <div className="scrollImage-cont">
                    <div id="snk" className="sneakerCont">
                        <img src="/imgs/3.1.webp" alt="" />
                    </div>
                    <div id="snk" className="sneakerCont">
                        <img src="/imgs/3.2.webp" alt="" />
                    </div>
                    <div id="snk" className="sneakerCont">
                        <img src="/imgs/3.3.webp" alt="" />
                    </div>
                    <div id="snk" className="sneakerCont">
                        <img src="/imgs/3.4.webp" alt="" />
                    </div>
                    <div id="snk" className="sneakerCont">
                        <img src="/imgs/3.1.webp" alt="" />
                    </div>
                </div>
                <div className="scrollImage-cont2">
                    <div id="snk" className="sneakerCont">
                        <img src="/imgs/3.5.webp" alt="" />
                    </div>
                    <div id="snk" className="sneakerCont">
                        <img src="/imgs/3.6.webp" alt="" />
                    </div>
                    <div id="snk" className="sneakerCont">
                        <img src="/imgs/3.7.webp" alt="" />
                    </div>
                    <div id="snk" className="sneakerCont">
                        <img src="/imgs/3.8.webp" alt="" />
                    </div>
                    <div id="snk" className="sneakerCont">
                        <img src="/imgs/3.5.webp" alt="" />
                    </div>
                </div>

            </main>

            {/* About Us Container - CORRECTED STRUCTURE */}
            <div className="aboutUs-cont">
                <div className="aboutUsTop-cont">
                    <div className="aboutUs-bar2"></div>
                    <div className="aboutUsTop">
                        <div id="aboutUs" className="aboutUsText">
                            <div className="icon_text">
                                <div className="aboutUsTop-icon"><i className="fas fa-globe"></i></div>
                                <div className="aboutUsTop-text">
                                    <h2>worldwide shipping</h2>
                                </div>
                            </div>

                            <div className="icon_text">
                                <div className="aboutUsTop-icon"><i className="fas fa-shipping-fast"></i></div>
                                <div className="aboutUsTop-text">
                                    <h2>ready to deliver</h2>
                                </div>
                            </div>

                            <div className="icon_text">
                                <div className="aboutUsTop-icon"><i className="far fa-clock"></i></div>
                                <div className="aboutUsTop-text">
                                    <h2>arrives in one week</h2>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="aboutUs">
                    <div id="a1" className="us-cont">
                        <h2>our values</h2>
                        <div className="aboutUs-bar"></div>
                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Magnam amet perspiciatis, commodi
                            est perferendis officia quas deleniti numquam ratione error quod maiores quia molestias odit
                            sequi totam tenetur optio laudantium?</p>
                    </div>
                    <div id="a2" className="us-cont">
                        <h2>about us</h2>
                        <div className="aboutUs-bar"></div>
                        <p>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Magnam amet perspiciatis, commodi
                            est Lorem ipsum dolor sit amet consectetur adipisicing elit. Magnam amet perspiciatis, commodi
                            est perferendis officia quas deleniti numquam ratione error quod maiores quia molestias odit
                            sequi totam perferendis officia quas deleniti numquam ratione error quod maiores quia molestias odit
                            sequi totam tenetur optio</p>
                    </div>
                    <div id="a3" className="us-cont">
                        <h2>our mission</h2>
                        <div className="aboutUs-bar"></div>
                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Magnam amet perspiciatis, commodi
                            est perferendis officia quas deleniti numquam ratione error quod maiores quia molestias odit
                            sequi totam tenetur optio laudantium?</p>
                    </div>
                </div>
            </div>

            {/* Footer - CORRECTED STRUCTURE */}
            <footer>
                <div id="contact" className="footerBar-cont">
                    <div className="footerBar"></div>
                </div>
                <div className="footerBar-cont2">
                    <div className="footerBar2"></div>
                </div>
                <div className="footer-cont">
                    <div className="address-cont">
                        <div className="address">
                            <h2>address</h2>
                            <p>P. sherman 42 Wallaby way - Sydney, NSW.</p>
                        </div>
                        <div className="contact">
                            <h2>contact number</h2>
                            <li><span>direct line:</span> +99 666-6969-420.</li>
                            <li><span>business:</span> +99 420-9696-666.</li>
                        </div>
                    </div>
                    <div id="FAQ" className="FAQ-cont">
                        <div className="FAQ">
                            <h2>faq</h2>
                            <li>How long does shipping take?</li>
                            <li>How can i track my order?</li>
                            <li>Can i change the product if it doesn't fit?</li>
                            <li>What methods of payment are there?</li>
                            <li>Can i cancel my order?</li>
                        </div>
                    </div>
                    <div className="socialIcons">
                        <a href="https://api.whatsapp.com/send?phone=573008211647&text=Hi,%20Alejandro,%20i'm%20interested%20on%20your%20web%20design%20services."
                            target="_blank" rel="noreferrer">
                            <i title="WhatsApp" className="fab fa-whatsapp"></i>
                        </a>

                        <a href="https://github.com/VelzckC0D3" target="_blank" rel="noreferrer">
                            <i title="GitHub" className="fab fa-github"></i>
                        </a>

                        <a href="https://www.instagram.com/alejandro.velzck/" target="_blank" rel="noreferrer">
                            <i title="Instagram" className="fab fa-instagram"></i>
                        </a>

                        <a id="in" href="https://www.linkedin.com/in/velzckcode/" target="_blank" rel="noreferrer">
                            <i title="Linkedin" className="fab fa-linkedin-in"></i>
                        </a>
                    </div>
                </div>

                <div className="velzck-cont">
                    <div className="velzck">
                        <h2 className="v1">2022 Alejandro Velasquez.</h2>
                        <h2 className="v2"><i className="fas fa-map-marker-alt"></i> Medellín, Colombia.</h2>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default Home;
