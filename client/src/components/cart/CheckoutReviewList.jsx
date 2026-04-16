import SafeImg from '../common/SafeImg.jsx';
import formatCurrency from '../../utils/formatCurrency.js';

const CheckoutReviewList = ({ items }) => (
  <div className="checkout-review surface-card">
    <p className="checkout-review__title">In your bag</p>
    <ul className="checkout-review__list">
      {items.map((item) => {
        const product = item.product;
        const unit = product?.price ?? 0;
        const qty = item.quantity ?? 1;
        const line = unit * qty;

        return (
          <li key={product?._id || item._id} className="checkout-review__row">
            <div className="checkout-review__thumb">
              <SafeImg
                src={product?.thumbnail || product?.images?.[0]}
                alt={product?.title || 'Item'}
                decoding="async"
              />
              <span className="checkout-review__price-badge">{formatCurrency(unit)}</span>
            </div>
            <div className="checkout-review__info">
              <span className="checkout-review__name">{product?.title}</span>
              <span className="checkout-review__qty muted-text">
                Qty {qty} | {formatCurrency(unit)} each
              </span>
            </div>
            <strong className="checkout-review__line">{formatCurrency(line)}</strong>
          </li>
        );
      })}
    </ul>
  </div>
);

export default CheckoutReviewList;
