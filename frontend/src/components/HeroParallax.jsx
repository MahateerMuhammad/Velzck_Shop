import { useEffect } from 'react';

const HeroParallax = () => {
    useEffect(() => {
        // Initialize Rellax for parallax effect
        if (window.Rellax) {
            new window.Rellax('.rellax', {
                speed: -2,
                center: false,
                wrapper: null,
                round: true,
                vertical: true,
                horizontal: false
            });
        }
    }, []);

    return (
        <div className="hero-parallax">
            <div className="rellax snkbg" data-rellax-speed="-2.5" data-rellax-zindex="0"></div>
            <div className="rellax snk" data-rellax-speed="-1" data-rellax-zindex="1"></div>

            <div className="hero-text">
                <h1 className="hero-title">
                    <span className="hero-title-main">Premium</span>
                    <span className="hero-title-sub">Sneakers</span>
                </h1>
                <p className="hero-subtitle">Discover the latest collection</p>
            </div>
        </div>
    );
};

export default HeroParallax;
