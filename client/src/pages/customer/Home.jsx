import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiBarChart2, FiLayers, FiZap } from 'react-icons/fi';
import Button from '../../components/common/Button.jsx';
import SafeImg from '../../components/common/SafeImg.jsx';
import ProductList from '../../components/product/ProductList.jsx';
import productService from '../../services/productService.js';
import { fetchFeaturedProducts } from '../../store/slices/productSlice.js';
import { addToCart, toggleWishlist } from '../../store/slices/cartSlice.js';
import { toggleCompareItem } from '../../store/slices/experienceSlice.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useExperience } from '../../hooks/useExperience.js';
import {
  DEVICE_FEATURE_CALLOUTS,
  HOME_COLLECTIONS,
  HOME_HERO_FALLBACK,
  HOME_SPOTLIGHT_LINKS,
  ROLES,
} from '../../utils/constants.js';
import formatCurrency from '../../utils/formatCurrency.js';
import { fadeUp, stagger } from '../../utils/motion.js';

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { featured } = useSelector((state) => state.products);
  const { wishlist } = useSelector((state) => state.cart);
  const { compare, recentlyViewed } = useExperience();
  const { user } = useAuth();
  const [collections, setCollections] = useState({});

  const wishlistIds = new Set(wishlist.map((item) => item._id || item.product?._id));
  const compareIds = new Set(compare.map((item) => item._id));

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
  }, [dispatch]);

  useEffect(() => {
    let ignore = false;

    const loadCollections = async () => {
      try {
        const entries = await Promise.all(
          HOME_COLLECTIONS.map(async (collection) => {
            const response = await productService.getProducts({
              category: collection.category,
              limit: 4,
              sort: 'featured',
            });
            return [collection.category, response.data];
          })
        );

        if (!ignore) {
          setCollections(Object.fromEntries(entries));
        }
      } catch {
        if (!ignore) {
          setCollections({});
        }
      }
    };

    loadCollections();

    return () => {
      ignore = true;
    };
  }, []);

  const heroTiles = useMemo(() => {
    if (featured?.length >= 3) {
      return featured.slice(0, 3).map((product, index) => ({
        key: product._id,
        title: product.title,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        image: product.thumbnail || product.images?.[0],
        to: `/products/${product.slug || product._id}`,
        large: index === 0,
      }));
    }

    return HOME_HERO_FALLBACK.map((item, index) => ({
      ...item,
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
    <div className="container page-stack home-page home-page--upgraded">
      <section className="hero-banner home-hero home-hero--upgraded">
        <motion.div className="hero-copy" initial="hidden" animate="visible" variants={stagger}>
          <motion.p className="eyebrow" variants={fadeUp}>
            B-mobile marketplace
          </motion.p>
          <motion.h1 variants={fadeUp}>
            A device store that feels engineered for buying, comparing, and coming back.
          </motion.h1>
          <motion.p className="section-copy" variants={fadeUp}>
            Shop phones, tablets, and laptops with comparison, offline checkout options, finance previews,
            delivery insight, and an interface that adapts beautifully from mobile to desktop.
          </motion.p>
          <motion.div className="hero-actions" variants={fadeUp}>
            <Link to="/products">
              <Button>
                Explore catalog
                <FiArrowRight />
              </Button>
            </Link>
            <Link to="/compare">
              <Button variant="ghost">
                <FiBarChart2 />
                Open compare board
              </Button>
            </Link>
          </motion.div>

          <motion.div className="hero-micro-stats" variants={fadeUp}>
            <div className="hero-micro-stat">
              <FiLayers />
              <div>
                <strong>3 device worlds</strong>
                <span>Phones, tablets, laptops</span>
              </div>
            </div>
            <div className="hero-micro-stat">
              <FiBarChart2 />
              <div>
                <strong>{compare.length} pinned now</strong>
                <span>Compare side by side</span>
              </div>
            </div>
            <div className="hero-micro-stat">
              <FiZap />
              <div>
                <strong>Offline-ready checkout</strong>
                <span>No payment gateway required</span>
              </div>
            </div>
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

      <section className="device-zone-grid">
        {HOME_COLLECTIONS.map((collection) => {
          const products = collections[collection.category] || [];
          const leadImage = products[0]?.thumbnail || products[0]?.images?.[0];

          return (
            <article key={collection.key} className="surface-card device-zone-card">
              <div className="device-zone-card__copy">
                <p className="eyebrow">{collection.eyebrow}</p>
                <h3>{collection.title}</h3>
                <p className="section-copy">{collection.copy}</p>
                <div className="device-zone-card__actions">
                  <Link to={collection.to}>
                    <Button size="sm">{collection.cta}</Button>
                  </Link>
                  <span className="device-zone-card__count">{products.length || 0} featured picks loaded</span>
                </div>
              </div>

              <div className="device-zone-card__preview">
                {leadImage ? (
                  <SafeImg src={leadImage} alt={collection.title} decoding="async" />
                ) : (
                  <div className="device-zone-card__placeholder">Live catalog preview</div>
                )}
                <div className="device-zone-card__stack">
                  {products.slice(0, 3).map((product) => (
                    <Link key={product._id} to={`/products/${product.slug || product._id}`}>
                      {product.title}
                    </Link>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
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
            <span className="spotlight-card__hint">Shop this lane</span>
          </Link>
        ))}
      </section>

      <section className="device-feature-grid">
        {DEVICE_FEATURE_CALLOUTS.map((item) => (
          <article key={item.title} className="surface-card device-feature-card">
            <p className="eyebrow">Buying edge</p>
            <h3>{item.title}</h3>
            <p className="section-copy">{item.body}</p>
          </article>
        ))}
      </section>

      <section className="content-section home-featured">
        <div className="section-header">
          <div>
            <p className="eyebrow">Featured devices</p>
            <h2>Hand-picked products with better pricing context and compare-ready cards.</h2>
          </div>
          <Link to="/products" className="text-link">
            View all
          </Link>
        </div>

        <ProductList
          products={featured}
          onAddToCart={(product) =>
            guardedCustomerAction(() => dispatch(addToCart({ productId: product._id, quantity: 1 })))
          }
          onToggleWishlist={(productId) =>
            guardedCustomerAction(() => dispatch(toggleWishlist(productId)))
          }
          onToggleCompare={(product) => dispatch(toggleCompareItem(product))}
          isCompared={(product) => compareIds.has(product._id)}
          isWishlisted={(product) => wishlistIds.has(product._id)}
        />
      </section>

      {recentlyViewed.length ? (
        <section className="content-section">
          <div className="section-header">
            <div>
              <p className="eyebrow">Recently viewed</p>
              <h2>Pick up where you left off without digging through the catalog again.</h2>
            </div>
          </div>

          <ProductList
            products={recentlyViewed.slice(0, 4)}
            onAddToCart={(product) =>
              guardedCustomerAction(() => dispatch(addToCart({ productId: product._id, quantity: 1 })))
            }
            onToggleWishlist={(productId) =>
              guardedCustomerAction(() => dispatch(toggleWishlist(productId)))
            }
            onToggleCompare={(product) => dispatch(toggleCompareItem(product))}
            isCompared={(product) => compareIds.has(product._id)}
            isWishlisted={(product) => wishlistIds.has(product._id)}
          />
        </section>
      ) : null}

      <section className="promo-strip home-promo home-promo--banner home-promo--expanded">
        <div>
          <p className="eyebrow">Why this build stands out</p>
          <h3>Comparison, finance planning, delivery insight, and responsive polish come built in.</h3>
        </div>
        <div className="inline-actions">
          <Link to="/compare">
            <Button variant="secondary">Start comparing</Button>
          </Link>
          <Link to="/products">
            <Button variant="ghost">Browse everything</Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
