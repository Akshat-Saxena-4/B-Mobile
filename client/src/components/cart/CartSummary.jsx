import { Link } from 'react-router-dom';
import Button from '../common/Button.jsx';
import formatCurrency from '../../utils/formatCurrency.js';

const CartSummary = ({ summary, ctaLabel = 'Proceed to Checkout', ctaLink = '/checkout' }) => (
  <aside className="summary-card">
    <div className="summary-row">
      <span>Subtotal</span>
      <strong>{formatCurrency(summary.itemsTotal)}</strong>
    </div>
    <div className="summary-row">
      <span>Shipping</span>
      <strong>{formatCurrency(summary.shippingFee)}</strong>
    </div>
    <div className="summary-row">
      <span>Taxes</span>
      <strong>{formatCurrency(summary.taxAmount)}</strong>
    </div>
    <div className="summary-row summary-total">
      <span>Total</span>
      <strong>{formatCurrency(summary.grandTotal)}</strong>
    </div>
    <Link to={ctaLink}>
      <Button fullWidth>{ctaLabel}</Button>
    </Link>
  </aside>
);

export default CartSummary;

