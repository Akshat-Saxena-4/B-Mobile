import Button from '../common/Button.jsx';
import SafeImg from '../common/SafeImg.jsx';
import formatCurrency from '../../utils/formatCurrency.js';

const CartItem = ({ item, onQuantityChange, onRemove }) => {
  const unit = item.product?.price ?? 0;
  const line = unit * (item.quantity || 1);

  return (
    <article className="cart-item-card cart-item-card--enhanced">
      <div className="cart-item-media">
        <SafeImg
          src={item.product?.thumbnail || item.product?.images?.[0]}
          alt={item.product?.title || 'Product'}
          decoding="async"
        />
        <div className="cart-item-media__prices">
          <span className="cart-item-media__unit">{formatCurrency(unit)}</span>
          <span className="cart-item-media__line">Line: {formatCurrency(line)}</span>
        </div>
      </div>
      <div className="cart-item-body">
        <div>
          <h3>{item.product?.title}</h3>
          <p className="muted-text">{item.product?.brand}</p>
        </div>
        <div className="cart-item-footer">
          <strong>{formatCurrency(unit)}</strong>
          <div className="quantity-wrap">
            <Button variant="ghost" size="sm" onClick={() => onQuantityChange(item, item.quantity - 1)}>
              -
            </Button>
            <span>{item.quantity}</span>
            <Button variant="ghost" size="sm" onClick={() => onQuantityChange(item, item.quantity + 1)}>
              +
            </Button>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => onRemove(item.product?._id)}>
          Remove
        </Button>
      </div>
    </article>
  );
};

export default CartItem;
