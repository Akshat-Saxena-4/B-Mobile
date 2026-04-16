import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import CartSummary from '../../components/cart/CartSummary.jsx';
import CheckoutReviewList from '../../components/cart/CheckoutReviewList.jsx';
import couponService from '../../services/couponService.js';
import orderService from '../../services/orderService.js';
import { fetchCart } from '../../store/slices/cartSlice.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useCart } from '../../hooks/useCart.js';
import { PAYMENT_OPTIONS } from '../../utils/constants.js';
import { calculateEmi, estimateDeliveryWindow } from '../../utils/commerceTools.js';
import { formatDateRange } from '../../utils/formatDate.js';
import formatCurrency from '../../utils/formatCurrency.js';

const submitLabelMap = {
  COD: 'Place COD Order',
  STORE_PICKUP: 'Reserve for Store Pickup',
  FINANCE_CALLBACK: 'Request Finance Callback',
};

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
    paymentMethod: 'STORE_PICKUP',
  });

  const adjustedSummary = useMemo(
    () => ({
      ...summary,
      grandTotal: Math.max(summary.grandTotal - (couponState?.discountAmount || 0), 0),
    }),
    [couponState?.discountAmount, summary]
  );

  const deliveryEstimate = useMemo(
    () => estimateDeliveryWindow(form.postalCode),
    [form.postalCode]
  );

  const emiEstimate = useMemo(
    () =>
      calculateEmi({
        principal: adjustedSummary.grandTotal,
        months: 12,
        annualRate: 14,
        downPayment: Math.min(adjustedSummary.grandTotal * 0.1, 15000),
      }),
    [adjustedSummary.grandTotal]
  );

  if (!items.length) {
    return (
      <section className="container empty-page checkout-page checkout-page--empty">
        <div className="empty-state empty-state--card">
          Your cart is empty, so there is nothing to check out yet.
        </div>
        <Link to="/products">
          <Button>Browse catalog</Button>
        </Link>
      </section>
    );
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      const response = await couponService.validateCoupon({
        code: couponCode.trim().toUpperCase(),
        subtotal: summary.itemsTotal,
      });
      setCouponState(response);
      setCouponCode(response.code);
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
    <section className="container page-stack checkout-page checkout-page--upgraded">
      <section className="surface-card console-hero console-hero--customer">
        <div>
          <p className="eyebrow">Checkout</p>
          <h1>Reserve devices, schedule payment later, and still keep the final step polished.</h1>
          <p className="section-copy">
            This checkout is built for a no-gateway phase, with cash on delivery, store pickup reservation,
            and finance callback options that still feel premium.
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
            <span>Discount</span>
            <strong>{formatCurrency(couponState?.discountAmount || 0)}</strong>
          </div>
          <div className="console-stat">
            <span>Final total</span>
            <strong>{formatCurrency(adjustedSummary.grandTotal)}</strong>
          </div>
        </div>
      </section>

      <div className="checkout-grid">
        <div className="checkout-primary stack-list">
          <CheckoutReviewList items={items} />

          <div className="dashboard-two-up">
            <article className="surface-card">
              <p className="eyebrow">Delivery outlook</p>
              <div className="info-list">
                <div className="info-item">
                  <span>Estimated window</span>
                  <strong>{formatDateRange(new Date(), new Date(Date.now() + 5 * 24 * 60 * 60 * 1000))}</strong>
                </div>
                <div className="info-item">
                  <span>PIN code planning</span>
                  <strong>{deliveryEstimate.label}</strong>
                </div>
                <div className="info-item">
                  <span>Courier estimate</span>
                  <strong>{deliveryEstimate.etaDays ? `${deliveryEstimate.etaDays} days` : 'Pending PIN code'}</strong>
                </div>
              </div>
            </article>

            <article className="surface-card">
              <p className="eyebrow">Finance planning</p>
              <div className="info-list">
                <div className="info-item">
                  <span>Approx. monthly EMI</span>
                  <strong>{formatCurrency(emiEstimate.monthlyInstallment)}</strong>
                </div>
                <div className="info-item">
                  <span>Down payment used</span>
                  <strong>{formatCurrency(Math.min(adjustedSummary.grandTotal * 0.1, 15000))}</strong>
                </div>
                <div className="info-item">
                  <span>Why this matters</span>
                  <strong>Finance callback orders help the store follow up without taking payment online.</strong>
                </div>
              </div>
            </article>
          </div>

          <form className="surface-card stack-list checkout-form-card" onSubmit={handleSubmit}>
            <p className="checkout-form-card__title">Delivery and reservation details</p>
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
                onChange={(event) => setForm((current) => ({ ...current, postalCode: event.target.value }))}
              />
              <Input
                label="Checkout flow"
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
                onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
              />
              <Button type="button" variant="secondary" onClick={applyCoupon}>
                Apply
              </Button>
            </div>

            {couponState ? (
              <div className="alert alert-success">
                Coupon applied. You saved {formatCurrency(couponState.discountAmount)}.
              </div>
            ) : null}
            {error ? <div className="alert alert-error">{error}</div> : null}

            <div className="info-list">
              <div className="info-item">
                <span>Selected flow</span>
                <strong>{PAYMENT_OPTIONS.find((option) => option.value === form.paymentMethod)?.label}</strong>
              </div>
              <div className="info-item">
                <span>Gateway status</span>
                <strong>Not required for this build. Orders remain tracked inside the platform.</strong>
              </div>
            </div>

            <Button type="submit" fullWidth disabled={submitting}>
              {submitting
                ? 'Submitting...'
                : `${submitLabelMap[form.paymentMethod]} | ${formatCurrency(adjustedSummary.grandTotal)}`}
            </Button>
          </form>
        </div>

        <CartSummary summary={adjustedSummary} ctaLabel="Order summary" ctaLink="/checkout" />
      </div>
    </section>
  );
};

export default Checkout;
