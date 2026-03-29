import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import ProductList from '../../components/product/ProductList.jsx';
import { addToCart, toggleWishlist } from '../../store/slices/cartSlice.js';
import { useCart } from '../../hooks/useCart.js';
import { useAuth } from '../../hooks/useAuth.js';
import { ROLES } from '../../utils/constants.js';

const Wishlist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { wishlist } = useCart();
  const { user } = useAuth();

  if (!wishlist.length) {
    return (
      <section className="container empty-page">
        <div className="empty-state">Your wishlist is empty. Save products you want to revisit.</div>
        <Link to="/products">
          <Button>Browse Catalog</Button>
        </Link>
      </section>
    );
  }

  return (
    <section className="container page-stack">
      <div className="section-header">
        <div>
          <p className="eyebrow">Wishlist</p>
          <h1>Keep your favorites close.</h1>
        </div>
      </div>

      <ProductList
        products={wishlist}
        onAddToCart={(product) => {
          if (user?.role !== ROLES.CUSTOMER) {
            navigate('/login');
            return;
          }

          dispatch(addToCart({ productId: product._id, quantity: 1 }));
        }}
        onToggleWishlist={(productId) => dispatch(toggleWishlist(productId))}
        isWishlisted
      />
    </section>
  );
};

export default Wishlist;
