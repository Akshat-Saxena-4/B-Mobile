import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import CartSummary from '../../components/cart/CartSummary.jsx';
import couponService from '../../services/couponService.js';
import orderService from '../../services/orderService.js';
import { fetchCart } from '../../store/slices/cartSlice.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useCart } from '../../hooks/useCart.js';
import { PAYMENT_OPTIONS } from '../../utils/constants.js';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, summary } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponState, setCouponState] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    fullName: user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    phone: user?.phone || '',
    line1: user?.addresses?.[0]?.line1 || '',
    line2: user?.addresses?.[0]?.line2 || '',
    city: user?.addresses?.[0]?.city || '',
    state: user?.addresses?.[0]?.state || '',
    postalCode: user?.addresses?.[0]?.postalCode || '',
    country: user?.addresses?.[0]?.country || 'India',
    paymentMethod: 'COD',
  });

  const adjustedSummary = {
    ...summary,
    grandTotal: Math.max(summary.grandTotal - (couponState?.discountAmount || 0), 0),
  };

  const applyCoupon = async () => {
    if (!couponCode) return;

    try {
      const response = await couponService.validateCoupon({
        code: couponCode,
        subtotal: summary.itemsTotal,
      });
      setCouponState(response);
      setError('');
    } catch (requestError) {
      setCouponState(null);
      setError(requestError.response?.data?.message || 'Unable to validate coupon');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await orderService.createOrder({
        items: items.map((item) => ({
          productId: item.product?._id,
          quantity: item.quantity,
        })),
        shippingAddress: {
          fullName: form.fullName,
          phone: form.phone,
          line1: form.line1,
          line2: form.line2,
          city: form.city,
          state: form.state,
          postalCode: form.postalCode,
          country: form.country,
        },
        paymentMethod: form.paymentMethod,
        couponCode: couponState?.code || couponCode,
      });
      await dispatch(fetchCart());
      navigate('/orders');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container page-stack">
      <div className="section-header">
        <div>
          <p className="eyebrow">Checkout</p>
          <h1>Confirm shipping and complete payment.</h1>
        </div>
      </div>

      <div className="checkout-grid">
        <form className="surface-card stack-list" onSubmit={handleSubmit}>
          <div className="grid-two">
            <Input
              label="Full Name"
              required
              value={form.fullName}
              onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
            />
            <Input
              label="Phone"
              required
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
            />
          </div>
          <Input
            label="Address Line 1"
            required
            value={form.line1}
            onChange={(event) => setForm((current) => ({ ...current, line1: event.target.value }))}
          />
          <Input
            label="Address Line 2"
            value={form.line2}
            onChange={(event) => setForm((current) => ({ ...current, line2: event.target.value }))}
          />
          <div className="grid-two">
            <Input
              label="City"
              required
              value={form.city}
              onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
            />
            <Input
              label="State"
              required
              value={form.state}
              onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))}
            />
          </div>
          <div className="grid-two">
            <Input
              label="Postal Code"
              required
              value={form.postalCode}
              onChange={(event) =>
                setForm((current) => ({ ...current, postalCode: event.target.value }))
              }
            />
            <Input
              label="Payment Method"
              as="select"
              options={PAYMENT_OPTIONS}
              value={form.paymentMethod}
              onChange={(event) =>
                setForm((current) => ({ ...current, paymentMethod: event.target.value }))
              }
            />
          </div>

          <div className="coupon-row">
            <Input
              label="Coupon"
              placeholder="VELORA10"
              value={couponCode}
              onChange={(event) => setCouponCode(event.target.value)}
            />
            <Button type="button" variant="secondary" onClick={applyCoupon}>
              Apply
            </Button>
          </div>

          {couponState ? (
            <div className="alert alert-success">
              Coupon applied. Discount: {couponState.discountAmount}
            </div>
          ) : null}
          {error ? <div className="alert alert-error">{error}</div> : null}

          <Button type="submit" fullWidth disabled={submitting}>
            {submitting ? 'Placing order...' : 'Place Order'}
          </Button>
        </form>

        <CartSummary summary={adjustedSummary} ctaLabel="Order Summary" ctaLink="/checkout" />
      </div>
    </section>
  );
};

export default Checkout;
