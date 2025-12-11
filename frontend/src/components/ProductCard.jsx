import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
    const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
    const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

    return (
        <Link to={`/product/${product.slug}`} className="product-card">
            <div className="product-image">
                <img src={primaryImage?.url || '/imgs/placeholder.webp'} alt={product.name} />
                {hasDiscount && (
                    <span className="discount-badge">
                        -{product.discountPercentage}%
                    </span>
                )}
            </div>
            <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-brand">{product.brand}</p>
                <div className="product-price">
                    <span className="price-current">${product.price.toFixed(2)}</span>
                    {hasDiscount && (
                        <span className="price-original">${product.compareAtPrice.toFixed(2)}</span>
                    )}
                </div>
                {product.ratings?.average > 0 && (
                    <div className="product-rating">
                        <span className="stars">{'★'.repeat(Math.round(product.ratings.average))}</span>
                        <span className="rating-count">({product.ratings.count})</span>
                    </div>
                )}
            </div>
        </Link>
    );
};

export default ProductCard;
