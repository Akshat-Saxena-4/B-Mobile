import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import CartItem from '../../components/cart/CartItem.jsx';
import CartSummary from '../../components/cart/CartSummary.jsx';
import Button from '../../components/common/Button.jsx';
import { addToCart, clearCart, removeCartItem } from '../../store/slices/cartSlice.js';
import { useCart } from '../../hooks/useCart.js';

const Cart = () => {
  const dispatch = useDispatch();
  const { items, summary } = useCart();

  if (!items.length) {
    return (
      <section className="container empty-page">
        <div className="empty-state">
          Your cart is empty. Add a few standout products to start checkout.
        </div>
        <Link to="/products">
          <Button>Explore Products</Button>
        </Link>
      </section>
    );
  }

  return (
    <section className="container page-stack">
      <div className="section-header">
        <div>
          <p className="eyebrow">Cart</p>
          <h1>Review your order before checkout.</h1>
        </div>
        <Button variant="ghost" onClick={() => dispatch(clearCart())}>
          Clear Cart
        </Button>
      </div>

      <div className="checkout-grid">
        <div className="stack-list">
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
        <CartSummary summary={summary} />
      </div>
    </section>
  );
};

export default Cart;

