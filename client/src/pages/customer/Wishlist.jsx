import { useDeferredValue, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import ProductList from '../../components/product/ProductList.jsx';
import { addToCart, toggleWishlist } from '../../store/slices/cartSlice.js';
import { useCart } from '../../hooks/useCart.js';
import { useAuth } from '../../hooks/useAuth.js';
import formatCurrency from '../../utils/formatCurrency.js';
import { ROLES } from '../../utils/constants.js';

const SORT_OPTIONS = [
  { value: 'recent', label: 'Recently saved' },
  { value: 'priceAsc', label: 'Lowest price' },
  { value: 'priceDesc', label: 'Highest price' },
  { value: 'savings', label: 'Biggest savings' },
  { value: 'brand', label: 'Brand A-Z' },
];

const Wishlist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { wishlist } = useCart();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const deferredQuery = useDeferredValue(query);

  const filteredWishlist = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    const nextItems = wishlist
      .filter((product) => {
        if (!normalizedQuery) {
          return true;
        }

        return [product.title, product.brand, product.category]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedQuery));
      })
      .slice();

    nextItems.sort((left, right) => {
      switch (sortBy) {
        case 'priceAsc':
          return left.price - right.price;
        case 'priceDesc':
          return right.price - left.price;
        case 'savings':
          return (right.compareAtPrice || right.price) - right.price - ((left.compareAtPrice || left.price) - left.price);
        case 'brand':
          return (left.brand || '').localeCompare(right.brand || '');
        case 'recent':
        default:
          return 0;
      }
    });

    return nextItems;
  }, [deferredQuery, sortBy, wishlist]);

  const potentialSavings = useMemo(
    () =>
      filteredWishlist.reduce((sum, product) => {
        const compareAtPrice = product.compareAtPrice || product.price || 0;
        return sum + Math.max(compareAtPrice - (product.price || 0), 0);
      }, 0),
    [filteredWishlist]
  );

  const guardedAddToCart = (product) => {
    if (user?.role !== ROLES.CUSTOMER) {
      navigate('/login');
      return;
    }

    dispatch(addToCart({ productId: product._id, quantity: 1 }));
  };

  const addAllToCart = async () => {
    if (user?.role !== ROLES.CUSTOMER) {
      navigate('/login');
      return;
    }

    try {
      setBusy(true);
      setMessage('');
      setError('');

      for (const product of filteredWishlist) {
        await dispatch(addToCart({ productId: product._id, quantity: 1 })).unwrap();
      }

      setMessage('Visible wishlist items were added to your cart.');
    } catch (requestError) {
      setError(requestError?.message || 'Unable to add one or more items to cart.');
    } finally {
      setBusy(false);
    }
  };

  if (!wishlist.length) {
    return (
      <section className="container empty-page wishlist-page wishlist-page--empty">
        <div className="empty-state empty-state--card">
          Your wishlist is empty. Tap the heart on any product and save devices you want to compare later.
        </div>
        <Link to="/products">
          <Button>Explore store</Button>
        </Link>
      </section>
    );
  }

  return (
    <section className="container page-stack wishlist-page">
      <section className="surface-card console-hero console-hero--customer">
        <div>
          <p className="eyebrow">Wishlist</p>
          <h1>Saved devices, cleaner comparison, and one-tap cart building.</h1>
          <p className="section-copy">
            Search your saved list, sort by savings or price, and move multiple favorites into the cart faster.
          </p>
        </div>
        <div className="console-hero__stats">
          <div className="console-stat">
            <span>Saved items</span>
            <strong>{filteredWishlist.length}</strong>
          </div>
          <div className="console-stat">
            <span>Potential savings</span>
            <strong>{formatCurrency(potentialSavings)}</strong>
          </div>
          <div className="console-stat">
            <span>Brands tracked</span>
            <strong>{new Set(filteredWishlist.map((product) => product.brand).filter(Boolean)).size}</strong>
          </div>
          <div className="console-stat">
            <span>Ready to cart</span>
            <strong>{filteredWishlist.length}</strong>
          </div>
        </div>
      </section>

      <section className="surface-card control-shell">
        <div className="control-grid">
          <Input
            label="Search wishlist"
            placeholder="Search title or brand"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Input
            label="Sort by"
            as="select"
            options={SORT_OPTIONS}
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          />
          <div className="field">
            <span className="field-label">Quick actions</span>
            <div className="inline-actions">
              <Button
                variant="secondary"
                disabled={busy || !filteredWishlist.length}
                onClick={addAllToCart}
              >
                {busy ? 'Adding...' : 'Add Visible Items to Cart'}
              </Button>
              <Link to="/products">
                <Button variant="ghost">Keep Browsing</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {message ? <div className="alert alert-success">{message}</div> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}

      <ProductList
        products={filteredWishlist}
        onAddToCart={guardedAddToCart}
        onToggleWishlist={(productId) => dispatch(toggleWishlist(productId))}
        isWishlisted
      />
    </section>
  );
};

export default Wishlist;
