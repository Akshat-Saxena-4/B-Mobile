import { motion } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Button from '../common/Button.jsx';
import formatCurrency from '../../utils/formatCurrency.js';
import { fadeUp } from '../../utils/motion.js';

const ProductCard = ({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
}) => {
  const wished = typeof isWishlisted === 'function' ? isWishlisted(product) : isWishlisted;

  return (
    <motion.article className="product-card" variants={fadeUp}>
    <button type="button" className="wishlist-chip" onClick={() => onToggleWishlist?.(product._id)}>
      <FiHeart className={wished ? 'filled-heart' : ''} />
    </button>
    <Link to={`/products/${product.slug || product._id}`} className="product-image-wrap">
      <img src={product.thumbnail || product.images?.[0]} alt={product.title} className="product-image" />
    </Link>
    <div className="product-card-body">
      <div className="product-card-topline">
        <span>{product.brand}</span>
        <span className="rating-chip">
          <FiStar />
          {product.ratings?.average || 0}
        </span>
      </div>
      <Link to={`/products/${product.slug || product._id}`} className="product-title-link">
        <h3>{product.title}</h3>
      </Link>
      <p className="muted-text">{product.shortDescription}</p>
      <div className="price-row">
        <strong>{formatCurrency(product.price)}</strong>
        {product.compareAtPrice ? <span>{formatCurrency(product.compareAtPrice)}</span> : null}
      </div>
      {onAddToCart ? (
        <Button variant="secondary" className="product-cta" onClick={() => onAddToCart(product)}>
          <FiShoppingCart />
          Add to cart
        </Button>
      ) : null}
    </div>
    </motion.article>
  );
};

export default ProductCard;
