import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import Button from '../../components/common/Button.jsx';
import SafeImg from '../../components/common/SafeImg.jsx';
import ProductList from '../../components/product/ProductList.jsx';
import { fetchFeaturedProducts } from '../../store/slices/productSlice.js';
import { addToCart, toggleWishlist } from '../../store/slices/cartSlice.js';
import { useAuth } from '../../hooks/useAuth.js';
import { HOME_HERO_FALLBACK, HOME_SPOTLIGHT_LINKS, ROLES } from '../../utils/constants.js';
import formatCurrency from '../../utils/formatCurrency.js';
import { fadeUp, stagger } from '../../utils/motion.js';

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { featured } = useSelector((state) => state.products);
  const { wishlist } = useSelector((state) => state.cart);
  const { user } = useAuth();
  const wishlistIds = new Set(wishlist.map((item) => item._id || item.product?._id));

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
  }, [dispatch]);

  const heroTiles = useMemo(() => {
    if (featured?.length >= 3) {
      return featured.slice(0, 3).map((p, index) => ({
        key: p._id,
        title: p.title,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        image: p.thumbnail || p.images?.[0],
        to: `/products/${p.slug || p._id}`,
        large: index === 0,
      }));
    }
    return HOME_HERO_FALLBACK.map((item, index) => ({
      ...item,
      compareAtPrice: null,
      large: index === 0,
    }));
  }, [featured]);

  const guardedCustomerAction = (callback) => {
    if (user?.role !== ROLES.CUSTOMER) {
      navigate('/login');
      return;
    }

    callback();
  };

  return (
    <div className="container page-stack home-page">
      <section className="hero-banner home-hero">
        <motion.div className="hero-copy" initial="hidden" animate="visible" variants={stagger}>
          <motion.p className="eyebrow" variants={fadeUp}>
            B-Mobile · Smartphone store
          </motion.p>
          <motion.h1 variants={fadeUp}>
            Real device photos, clear INR pricing, checkout tuned for your phone.
          </motion.h1>
          <motion.p className="section-copy" variants={fadeUp}>
            Every tile shows what you pay. Explore segments, save favorites, and check out with the same
            flow on mobile or desktop.
          </motion.p>
          <motion.div className="hero-actions" variants={fadeUp}>
            <Link to="/products">
              <Button>
                Explore phones
                <FiArrowRight />
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="ghost">Sell on B-Mobile</Button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="home-hero-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {heroTiles.map((tile) => (
            <motion.div
              key={tile.key}
              className={tile.large ? 'home-hero-tile home-hero-tile--large' : 'home-hero-tile'}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.992 }}
            >
              <Link to={tile.to} className="home-hero-tile__link">
                <div className="home-hero-tile__media">
                  <SafeImg src={tile.image} alt={tile.title} loading="lazy" decoding="async" />
                  <div className="home-hero-tile__price-strip">
                    <span className="home-hero-tile__price">{formatCurrency(tile.price)}</span>
                    {tile.compareAtPrice ? (
                      <span className="home-hero-tile__was">{formatCurrency(tile.compareAtPrice)}</span>
                    ) : null}
                  </div>
                </div>
                <div className="home-hero-tile__meta">
                  <strong>{tile.title}</strong>
                  <span className="home-hero-tile__cta">View details</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="spotlight-grid home-spotlight">
        {HOME_SPOTLIGHT_LINKS.map((item) => (
          <Link
            key={item.name}
            to={item.to}
            className={`spotlight-card spotlight-card--link${item.coverImage ? ' spotlight-card--cover' : ''}`}
            style={item.coverImage ? { '--spotlight-cover': `url(${item.coverImage})` } : undefined}
          >
            <p className="eyebrow">{item.name}</p>
            <h3>{item.description}</h3>
            <span className="spotlight-card__hint">Shop segment →</span>
          </Link>
        ))}
      </section>

      <section className="content-section home-featured">
        <div className="section-header">
          <div>
            <p className="eyebrow">Featured</p>
            <h2>Hand-picked devices with price on every photo</h2>
          </div>
          <Link to="/products" className="text-link">
            View all
          </Link>
        </div>
        <ProductList
          products={featured}
          onAddToCart={(product) =>
            guardedCustomerAction(() =>
              dispatch(addToCart({ productId: product._id, quantity: 1 }))
            )
          }
          onToggleWishlist={(productId) =>
            guardedCustomerAction(() => dispatch(toggleWishlist(productId)))
          }
          isWishlisted={(product) => wishlistIds.has(product._id)}
        />
      </section>

      <section className="promo-strip home-promo home-promo--banner">
        <div>
          <p className="eyebrow">Why B-Mobile</p>
          <h3>Transparent pricing, trusted sellers, and a stack ready to scale.</h3>
        </div>
        <Link to="/products">
          <Button variant="secondary">Browse catalog</Button>
        </Link>
      </section>
    </div>
  );
};

export default Home;
