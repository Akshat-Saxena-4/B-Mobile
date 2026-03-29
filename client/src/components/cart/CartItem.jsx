import Button from '../common/Button.jsx';
import formatCurrency from '../../utils/formatCurrency.js';

const CartItem = ({ item, onQuantityChange, onRemove }) => (
  <article className="cart-item-card">
    <img src={item.product?.thumbnail || item.product?.images?.[0]} alt={item.product?.title} />
    <div className="cart-item-body">
      <div>
        <h3>{item.product?.title}</h3>
        <p className="muted-text">{item.product?.brand}</p>
      </div>
      <div className="cart-item-footer">
        <strong>{formatCurrency(item.product?.price)}</strong>
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

export default CartItem;

