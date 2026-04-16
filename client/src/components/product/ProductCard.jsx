import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiBarChart2, FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Button from '../common/Button.jsx';
import SafeImg from '../common/SafeImg.jsx';
import formatCurrency from '../../utils/formatCurrency.js';
import { fadeUp } from '../../utils/motion.js';

const ProductCard = ({
  product,
  onAddToCart,
  onToggleWishlist,
  onToggleCompare,
  isWishlisted = false,
  isCompared = false,
  showImagePriceOverlay = true,
}) => {
  const [hover, setHover] = useState(false);
  const wished = typeof isWishlisted === 'function' ? isWishlisted(product) : isWishlisted;
  const compared = typeof isCompared === 'function' ? isCompared(product) : isCompared;

  const primary = product.thumbnail || product.images?.[0];
  const secondary = product.images?.[1];
  const imageSrc = hover && secondary ? secondary : primary;
  const discount = product.discountPercentage || 0;
  const specHighlights = (product.specifications || []).slice(0, 2);

  return (
    <motion.article className="product-card product-card--catalog" variants={fadeUp}>
      <div className="product-card__badges">
        <span className="product-badge product-badge--category">{product.category}</span>
        {product.subcategory ? <span className="product-badge">{product.subcategory}</span> : null}
        {product.isFeatured ? <span className="product-badge product-badge--featured">Featured</span> : null}
        {discount > 0 ? <span className="product-badge product-badge--save">{discount}% off</span> : null}
      </div>

      <button type="button" className="wishlist-chip" onClick={() => onToggleWishlist?.(product._id)}>
        <FiHeart className={wished ? 'filled-heart' : ''} />
      </button>

      <Link
        to={`/products/${product.slug || product._id}`}
        className="product-image-wrap"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <SafeImg
          src={imageSrc}
          alt={product.title}
          className="product-image"
          loading="lazy"
          decoding="async"
        />
        {showImagePriceOverlay ? (
          <div className="product-card__price-overlay" aria-hidden="true">
            <span className="product-card__price-overlay-main">{formatCurrency(product.price)}</span>
            {product.compareAtPrice ? (
              <span className="product-card__price-overlay-was">{formatCurrency(product.compareAtPrice)}</span>
            ) : null}
          </div>
        ) : null}
      </Link>

      <div className="product-card-body">
        <div className="product-card-topline">
          <span className="product-card-brand">{product.brand}</span>
          <span className="rating-chip">
            <FiStar />
            {product.ratings?.average || 0}
            {product.ratings?.count ? <span className="rating-chip__count">({product.ratings.count})</span> : null}
          </span>
        </div>

        <Link to={`/products/${product.slug || product._id}`} className="product-title-link">
          <h3>{product.title}</h3>
        </Link>
        <p className="muted-text product-card-desc">{product.shortDescription}</p>

        {specHighlights.length ? (
          <div className="product-spec-pills">
            {specHighlights.map((spec) => (
              <span key={`${product._id}-${spec.label}`} className="product-spec-pill">
                <strong>{spec.label}:</strong> {spec.value}
              </span>
            ))}
          </div>
        ) : null}

        <div className="price-row price-row--retail">
          <div className="price-deal">
            <strong>{formatCurrency(product.price)}</strong>
          </div>
          {product.compareAtPrice ? (
            <div className="price-mrp">
              <span className="mrp-label">M.R.P.</span>
              <span className="mrp-value">{formatCurrency(product.compareAtPrice)}</span>
            </div>
          ) : null}
        </div>

        <div className="product-card-actions">
          {onToggleCompare ? (
            <Button
              variant={compared ? 'secondary' : 'ghost'}
              className="product-compare-cta"
              onClick={() => onToggleCompare(product)}
            >
              <FiBarChart2 />
              {compared ? 'Pinned' : 'Compare'}
            </Button>
          ) : null}

          {onAddToCart ? (
            <Button variant="secondary" className="product-cta" onClick={() => onAddToCart(product)}>
              <FiShoppingCart />
              Add to cart
            </Button>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
};

export default ProductCard;
