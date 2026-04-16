import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiBarChart2, FiTrash2 } from 'react-icons/fi';
import Button from '../../components/common/Button.jsx';
import SafeImg from '../../components/common/SafeImg.jsx';
import ProductList from '../../components/product/ProductList.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useExperience } from '../../hooks/useExperience.js';
import { useCart } from '../../hooks/useCart.js';
import { addToCart, toggleWishlist } from '../../store/slices/cartSlice.js';
import {
  clearCompare,
  removeCompareItem,
  toggleCompareItem,
} from '../../store/slices/experienceSlice.js';
import { COMPARE_SPEC_PRIORITY, ROLES } from '../../utils/constants.js';
import { getSpecValue } from '../../utils/commerceTools.js';
import formatCurrency from '../../utils/formatCurrency.js';

const Compare = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { compare, recentlyViewed } = useExperience();
  const { wishlist } = useCart();
  const { user } = useAuth();

  const wishlistIds = new Set(wishlist.map((item) => item._id || item.product?._id));

  const comparisonRows = useMemo(() => {
    const labelSet = new Set();

    compare.forEach((product) => {
      product.specifications?.forEach((spec) => labelSet.add(spec.label));
    });

    const priority = COMPARE_SPEC_PRIORITY.filter((label) => labelSet.has(label));
    const remaining = [...labelSet].filter((label) => !COMPARE_SPEC_PRIORITY.includes(label)).sort();

    return [...priority, ...remaining];
  }, [compare]);

  const cheapestId = useMemo(() => {
    if (!compare.length) return '';
    return compare.reduce((best, current) => (current.price < best.price ? current : best))._id;
  }, [compare]);

  const topRatedId = useMemo(() => {
    if (!compare.length) return '';
    return compare.reduce((best, current) =>
      (current.ratings?.average || 0) > (best.ratings?.average || 0) ? current : best
    )._id;
  }, [compare]);

  const recommendations = useMemo(
    () => recentlyViewed.filter((product) => !compare.some((entry) => entry._id === product._id)).slice(0, 4),
    [compare, recentlyViewed]
  );
  const tableColumns = useMemo(
    () => ({ gridTemplateColumns: `16rem repeat(${compare.length}, minmax(13rem, 1fr))` }),
    [compare.length]
  );

  const guardedCustomerAction = (callback) => {
    if (user?.role !== ROLES.CUSTOMER) {
      navigate('/login');
      return;
    }

    callback();
  };

  if (!compare.length) {
    return (
      <section className="container empty-page compare-page compare-page--empty">
        <div className="empty-state empty-state--card">
          Your comparison board is empty. Pin devices from the catalog to compare pricing, key specs, and ratings side by side.
        </div>
        <Link to="/products">
          <Button>
            Explore catalog
            <FiArrowRight />
          </Button>
        </Link>
      </section>
    );
  }

  return (
    <section className="container page-stack compare-page">
      <section className="surface-card compare-hero">
        <div>
          <p className="eyebrow">Comparison board</p>
          <h1>Side-by-side device comparison that actually helps you decide.</h1>
          <p className="section-copy">
            Price, rating, stock, and spec rows stay visible in one place so the trade-offs are obvious.
          </p>
        </div>
        <div className="compare-hero__actions">
          <Link to="/products">
            <Button variant="ghost">Add more devices</Button>
          </Link>
          <Button variant="secondary" onClick={() => dispatch(clearCompare())}>
            <FiTrash2 />
            Clear board
          </Button>
        </div>
      </section>

      <section className="compare-grid">
        {compare.map((product) => (
          <article
            key={product._id}
            className={`surface-card compare-device-card${product._id === cheapestId ? ' is-cheapest' : ''}${
              product._id === topRatedId ? ' is-top-rated' : ''
            }`}
          >
            <div className="compare-device-card__media">
              <SafeImg src={product.thumbnail || product.images?.[0]} alt={product.title} decoding="async" />
              <div className="compare-device-card__price">
                <strong>{formatCurrency(product.price)}</strong>
                {product.compareAtPrice ? <span>{formatCurrency(product.compareAtPrice)}</span> : null}
              </div>
            </div>

            <div className="compare-device-card__body">
              <div className="chip-row">
                {product._id === cheapestId ? <span className="meta-chip">Best price</span> : null}
                {product._id === topRatedId ? <span className="meta-chip">Top rated</span> : null}
                <span className="meta-chip">{product.category}</span>
              </div>
              <h3>{product.title}</h3>
              <p className="muted-text">{product.shortDescription}</p>

              <div className="info-list compare-device-card__facts">
                <div className="info-item">
                  <span>Rating</span>
                  <strong>{product.ratings?.average || 0}/5</strong>
                </div>
                <div className="info-item">
                  <span>Reviews</span>
                  <strong>{product.ratings?.count || 0}</strong>
                </div>
                <div className="info-item">
                  <span>Availability</span>
                  <strong>{product.inventory?.stock ? `${product.inventory.stock} in stock` : 'Limited'}</strong>
                </div>
              </div>

              <div className="inline-actions">
                <Link to={`/products/${product.slug || product._id}`}>
                  <Button size="sm">View details</Button>
                </Link>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    guardedCustomerAction(() =>
                      dispatch(addToCart({ productId: product._id, quantity: 1 }))
                    )
                  }
                >
                  Add to cart
                </Button>
                <Button variant="ghost" size="sm" onClick={() => dispatch(removeCompareItem(product._id))}>
                  Remove
                </Button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="surface-card compare-table-card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Spec table</p>
            <h2>Key differences, row by row</h2>
          </div>
        </div>

        <div className="compare-table" role="table" aria-label="Device comparison table">
          <div className="compare-table__head" role="rowgroup">
            <div className="compare-table__row compare-table__row--head" role="row" style={tableColumns}>
              <div className="compare-table__cell compare-table__cell--label" role="columnheader">
                Specification
              </div>
              {compare.map((product) => (
                <div key={product._id} className="compare-table__cell" role="columnheader">
                  {product.title}
                </div>
              ))}
            </div>
          </div>

          <div className="compare-table__body" role="rowgroup">
            {comparisonRows.map((label) => (
              <div key={label} className="compare-table__row" role="row" style={tableColumns}>
                <div className="compare-table__cell compare-table__cell--label" role="rowheader">
                  {label}
                </div>
                {compare.map((product) => (
                  <div key={`${product._id}-${label}`} className="compare-table__cell" role="cell">
                    {getSpecValue(product, label)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {recommendations.length ? (
        <section className="content-section">
          <div className="section-header">
            <div>
              <p className="eyebrow">Recently viewed</p>
              <h2>Still deciding? Pull these into the board.</h2>
            </div>
          </div>

          <ProductList
            products={recommendations}
            onAddToCart={(product) =>
              guardedCustomerAction(() => dispatch(addToCart({ productId: product._id, quantity: 1 })))
            }
            onToggleWishlist={(productId) =>
              guardedCustomerAction(() => dispatch(toggleWishlist(productId)))
            }
            onToggleCompare={(product) => dispatch(toggleCompareItem(product))}
            isCompared={(product) => compare.some((entry) => entry._id === product._id)}
            isWishlisted={(product) => wishlistIds.has(product._id)}
          />
        </section>
      ) : null}
    </section>
  );
};

export default Compare;
