import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import Button from '../../components/common/Button.jsx';
import ProductList from '../../components/product/ProductList.jsx';
import { fetchFeaturedProducts } from '../../store/slices/productSlice.js';
import { addToCart, toggleWishlist } from '../../store/slices/cartSlice.js';
import { useAuth } from '../../hooks/useAuth.js';
import { CATEGORY_SPOTLIGHT, ROLES } from '../../utils/constants.js';
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

  const guardedCustomerAction = (callback) => {
    if (user?.role !== ROLES.CUSTOMER) {
      navigate('/login');
      return;
    }

    callback();
  };

  return (
    <div className="container page-stack">
      <section className="hero-banner">
        <motion.div className="hero-copy" initial="hidden" animate="visible" variants={stagger}>
          <motion.p className="eyebrow" variants={fadeUp}>
            New Season. Premium Utility.
          </motion.p>
          <motion.h1 variants={fadeUp}>
            A mobile-first marketplace with Apple-grade calm and Amazon-grade momentum.
          </motion.h1>
          <motion.p className="section-copy" variants={fadeUp}>
            Discover curated products, shop from approved sellers, and move from browsing to
            checkout with polished speed on every device.
          </motion.p>
          <motion.div className="hero-actions" variants={fadeUp}>
            <Link to="/products">
              <Button>
                Explore Collection
                <FiArrowRight />
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="ghost">Become a Seller</Button>
            </Link>
          </motion.div>
        </motion.div>

        <div className="hero-mosaic">
          <div className="hero-card hero-card-large">
            <span>Featured</span>
            <strong>Smart living essentials with precise industrial design.</strong>
          </div>
          <div className="hero-card">
            <span>Fast Delivery</span>
            <strong>Real-time order tracking and multi-payment checkout.</strong>
          </div>
          <div className="hero-card">
            <span>Trusted Sellers</span>
            <strong>Role-based approvals and inventory-backed product control.</strong>
          </div>
        </div>
      </section>

      <section className="spotlight-grid">
        {CATEGORY_SPOTLIGHT.map((category) => (
          <article key={category.name} className="spotlight-card">
            <p className="eyebrow">{category.name}</p>
            <h3>{category.description}</h3>
          </article>
        ))}
      </section>

      <section className="content-section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Featured Products</p>
            <h2>Curated bestsellers from approved shopkeepers</h2>
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

      <section className="promo-strip">
        <div>
          <p className="eyebrow">Built to Scale</p>
          <h3>Customers buy. Sellers operate. Admins govern. One codebase.</h3>
        </div>
        <Link to="/products">
          <Button variant="secondary">Browse Now</Button>
        </Link>
      </section>
    </div>
  );
};

export default Home;
