import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Loader from '../../components/common/Loader.jsx';
import { addToCart, toggleWishlist } from '../../store/slices/cartSlice.js';
import {
  clearCurrentProduct,
  createReview,
  fetchProductDetails,
} from '../../store/slices/productSlice.js';
import { useAuth } from '../../hooks/useAuth.js';
import formatCurrency from '../../utils/formatCurrency.js';
import { ROLES } from '../../utils/constants.js';

const ProductDetails = () => {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProduct, isLoading } = useSelector((state) => state.products);
  const { wishlist } = useSelector((state) => state.cart);
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: '',
  });

  useEffect(() => {
    dispatch(fetchProductDetails(identifier));
    return () => dispatch(clearCurrentProduct());
  }, [dispatch, identifier]);

  useEffect(() => {
    if (currentProduct?.thumbnail) {
      setSelectedImage(currentProduct.thumbnail);
    }
  }, [currentProduct]);

  const wishlistIds = new Set(wishlist.map((item) => item._id || item.product?._id));

  if (isLoading || !currentProduct) {
    return <Loader label="Loading product" />;
  }

  const handleCustomerAction = (callback) => {
    if (user?.role !== ROLES.CUSTOMER) {
      navigate('/login');
      return;
    }

    callback();
  };

  return (
    <section className="container page-stack">
      <div className="product-detail-grid">
        <div className="gallery-panel">
          <img
            src={selectedImage || currentProduct.thumbnail || currentProduct.images?.[0]}
            alt={currentProduct.title}
            className="detail-hero-image"
          />
          <div className="thumbnail-row">
            {currentProduct.images?.map((image) => (
              <button
                key={image}
                type="button"
                className={`thumbnail-button ${selectedImage === image ? 'active' : ''}`.trim()}
                onClick={() => setSelectedImage(image)}
              >
                <img src={image} alt={currentProduct.title} />
              </button>
            ))}
          </div>
        </div>

        <div className="detail-panel">
          <p className="eyebrow">{currentProduct.brand}</p>
          <h1>{currentProduct.title}</h1>
          <p className="section-copy">{currentProduct.description}</p>
          <div className="price-row detail-price">
            <strong>{formatCurrency(currentProduct.price)}</strong>
            {currentProduct.compareAtPrice ? (
              <span>{formatCurrency(currentProduct.compareAtPrice)}</span>
            ) : null}
          </div>
          <div className="chip-row">
            <span className="meta-chip">Category: {currentProduct.category}</span>
            <span className="meta-chip">
              Seller: {currentProduct.seller?.sellerProfile?.shopName || currentProduct.seller?.firstName}
            </span>
            <span className="meta-chip">Stock: {currentProduct.inventory?.stock}</span>
          </div>
          <div className="quantity-inline">
            <Input
              label="Quantity"
              type="number"
              min="1"
              max={currentProduct.inventory?.stock || 1}
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
            />
          </div>
          <div className="hero-actions">
            <Button
              onClick={() =>
                handleCustomerAction(() =>
                  dispatch(addToCart({ productId: currentProduct._id, quantity }))
                )
              }
            >
              Add to Cart
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                handleCustomerAction(() => dispatch(toggleWishlist(currentProduct._id)))
              }
            >
              {wishlistIds.has(currentProduct._id) ? 'Saved' : 'Save to Wishlist'}
            </Button>
          </div>
        </div>
      </div>

      <div className="detail-columns">
        <article className="surface-card">
          <p className="eyebrow">Specifications</p>
          <div className="spec-list">
            {currentProduct.specifications?.map((spec) => (
              <div key={`${spec.label}-${spec.value}`} className="spec-row">
                <span>{spec.label}</span>
                <strong>{spec.value}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="surface-card">
          <p className="eyebrow">Reviews</p>
          <div className="review-list">
            {currentProduct.reviews?.length ? (
              currentProduct.reviews.map((review) => (
                <div key={review._id} className="review-card">
                  <div className="review-topline">
                    <strong>{review.user?.firstName}</strong>
                    <span>{review.rating}/5</span>
                  </div>
                  <p>{review.title}</p>
                  <p className="muted-text">{review.comment}</p>
                </div>
              ))
            ) : (
              <div className="empty-state">No reviews yet.</div>
            )}
          </div>

          {user?.role === ROLES.CUSTOMER ? (
            <form
              className="review-form"
              onSubmit={(event) => {
                event.preventDefault();
                dispatch(
                  createReview({
                    productId: currentProduct._id,
                    payload: reviewForm,
                  })
                );
              }}
            >
              <div className="grid-two">
                <Input
                  label="Rating"
                  type="number"
                  min="1"
                  max="5"
                  value={reviewForm.rating}
                  onChange={(event) =>
                    setReviewForm((current) => ({
                      ...current,
                      rating: Number(event.target.value),
                    }))
                  }
                />
                <Input
                  label="Title"
                  value={reviewForm.title}
                  onChange={(event) =>
                    setReviewForm((current) => ({ ...current, title: event.target.value }))
                  }
                />
              </div>
              <Input
                label="Comment"
                as="textarea"
                rows="4"
                value={reviewForm.comment}
                onChange={(event) =>
                  setReviewForm((current) => ({ ...current, comment: event.target.value }))
                }
              />
              <Button type="submit">Submit Review</Button>
            </form>
          ) : null}
        </article>
      </div>
    </section>
  );
};

export default ProductDetails;
