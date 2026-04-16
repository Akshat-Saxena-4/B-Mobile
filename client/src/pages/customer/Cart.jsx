import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import CartItem from '../../components/cart/CartItem.jsx';
import CartSummary from '../../components/cart/CartSummary.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import ProductList from '../../components/product/ProductList.jsx';
import { addToCart, clearCart, removeCartItem, toggleWishlist } from '../../store/slices/cartSlice.js';
import { toggleCompareItem } from '../../store/slices/experienceSlice.js';
import { useCart } from '../../hooks/useCart.js';
import { useExperience } from '../../hooks/useExperience.js';
import { estimateDeliveryWindow } from '../../utils/commerceTools.js';
import formatCurrency from '../../utils/formatCurrency.js';

const Cart = () => {
  const dispatch = useDispatch();
  const { items, summary, wishlist } = useCart();
  const { compare, recentlyViewed } = useExperience();
  const [deliveryPin, setDeliveryPin] = useState('');

  const progressToFreeShipping = Math.max(999 - summary.itemsTotal, 0);
  const deliveryEstimate = useMemo(() => estimateDeliveryWindow(deliveryPin), [deliveryPin]);
  const cartIds = new Set(items.map((item) => item.product?._id));
  const wishlistIds = new Set(wishlist.map((item) => item._id || item.product?._id));
  const compareIds = new Set(compare.map((item) => item._id));

  const suggestions = useMemo(() => {
    const pool = [...compare, ...recentlyViewed];
    const unique = [];
    const seen = new Set();

    pool.forEach((product) => {
      if (!product?._id || cartIds.has(product._id) || seen.has(product._id)) return;
      seen.add(product._id);
      unique.push(product);
    });

    return unique.slice(0, 4);
  }, [cartIds, compare, recentlyViewed]);

  if (!items.length) {
    return (
      <section className="container empty-page cart-page cart-page--empty">
        <div className="empty-state empty-state--card">
          Your cart is empty. Add devices, pin a few for comparison, and the bag will start to feel like a real buying plan.
        </div>
        <Link to="/products">
          <Button>Browse catalog</Button>
        </Link>
      </section>
    );
  }

  return (
    <section className="container page-stack cart-page cart-page--upgraded">
      <section className="surface-card console-hero console-hero--customer">
        <div>
          <p className="eyebrow">Cart workspace</p>
          <h1>Review the bag, check delivery readiness, and keep alternatives close.</h1>
          <p className="section-copy">
            Your cart now acts like a planning space instead of a dead end, with progress toward free delivery and nearby comparison options.
          </p>
        </div>
        <div className="console-hero__stats">
          <div className="console-stat">
            <span>Items</span>
            <strong>{summary.count}</strong>
          </div>
          <div className="console-stat">
            <span>Subtotal</span>
            <strong>{formatCurrency(summary.itemsTotal)}</strong>
          </div>
          <div className="console-stat">
            <span>Compare board</span>
            <strong>{compare.length}</strong>
          </div>
          <div className="console-stat">
            <span>Free shipping</span>
            <strong>{progressToFreeShipping ? formatCurrency(progressToFreeShipping) : 'Unlocked'}</strong>
          </div>
        </div>
      </section>

      <div className="section-header section-header--tight">
        <div>
          <p className="eyebrow">Bag review</p>
          <h1>Everything you picked, with room to keep deciding.</h1>
        </div>
        <Button variant="ghost" onClick={() => dispatch(clearCart())}>
          Clear Cart
        </Button>
      </div>

      <div className="checkout-grid">
        <div className="stack-list">
          <section className="surface-card cart-planner-card">
            <div className="grid-two">
              <div className="info-list">
                <div className="info-item">
                  <span>Shipping status</span>
                  <strong>
                    {progressToFreeShipping
                      ? `${formatCurrency(progressToFreeShipping)} away from free shipping`
                      : 'Free shipping unlocked'}
                  </strong>
                </div>
                <div className="info-item">
                  <span>Delivery planner</span>
                  <strong>{deliveryEstimate.label}</strong>
                </div>
              </div>

              <div className="field">
                <Input
                  label="Delivery PIN code"
                  placeholder="560001"
                  value={deliveryPin}
                  onChange={(event) => setDeliveryPin(event.target.value)}
                />
                <span className="muted-text">
                  {deliveryEstimate.etaDays
                    ? `Expected transit window: ${deliveryEstimate.etaDays} days`
                    : 'Add your PIN code to preview courier timing.'}
                </span>
              </div>
            </div>
          </section>

          {items.map((item) => (
            <CartItem
              key={item.product?._id}
              item={item}
              onQuantityChange={(selectedItem, quantity) => {
                if (quantity < 1) {
                  dispatch(removeCartItem(selectedItem.product?._id));
                  return;
                }

                dispatch(
                  addToCart({
                    productId: selectedItem.product?._id,
                    quantity,
                  })
                );
              }}
              onRemove={(productId) => dispatch(removeCartItem(productId))}
            />
          ))}
        </div>

        <div className="stack-list">
          <CartSummary summary={summary} />

          <section className="surface-card cart-planner-card">
            <p className="eyebrow">Before checkout</p>
            <div className="info-list">
              <div className="info-item">
                <span>Reserve and pay later</span>
                <strong>Store pickup and finance callback flows are available during checkout.</strong>
              </div>
              <div className="info-item">
                <span>Need alternatives?</span>
                <strong>
                  <Link to="/compare" className="text-link">
                    Open your compare board
                  </Link>{' '}
                  to keep price and specs in view.
                </strong>
              </div>
            </div>
          </section>
        </div>
      </div>

      {suggestions.length ? (
        <section className="content-section">
          <div className="section-header">
            <div>
              <p className="eyebrow">Keep deciding</p>
              <h2>Devices you recently viewed or pinned to compare.</h2>
            </div>
          </div>

          <ProductList
            products={suggestions}
            onAddToCart={(product) => dispatch(addToCart({ productId: product._id, quantity: 1 }))}
            onToggleWishlist={(productId) => dispatch(toggleWishlist(productId))}
            onToggleCompare={(product) => dispatch(toggleCompareItem(product))}
            isCompared={(product) => compareIds.has(product._id)}
            isWishlisted={(product) => wishlistIds.has(product._id)}
          />
        </section>
      ) : null}
    </section>
  );
};

export default Cart;
