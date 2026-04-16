import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiBarChart2, FiHeart, FiMapPin, FiTruck } from 'react-icons/fi';
import Button from '../../components/common/Button.jsx';
import SafeImg from '../../components/common/SafeImg.jsx';
import Input from '../../components/common/Input.jsx';
import Loader from '../../components/common/Loader.jsx';
import ProductList from '../../components/product/ProductList.jsx';
import productService from '../../services/productService.js';
import { addToCart, toggleWishlist } from '../../store/slices/cartSlice.js';
import {
  clearCurrentProduct,
  createReview,
  fetchProductDetails,
} from '../../store/slices/productSlice.js';
import {
  addRecentlyViewed,
  toggleCompareItem,
} from '../../store/slices/experienceSlice.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useExperience } from '../../hooks/useExperience.js';
import formatCurrency from '../../utils/formatCurrency.js';
import {
  calculateEmi,
  estimateDeliveryWindow,
  estimateTradeIn,
} from '../../utils/commerceTools.js';
import { ROLES } from '../../utils/constants.js';

const FINANCE_MONTH_OPTIONS = [
  { value: '6', label: '6 months' },
  { value: '9', label: '9 months' },
  { value: '12', label: '12 months' },
  { value: '18', label: '18 months' },
  { value: '24', label: '24 months' },
];

const TRADE_IN_AGE_OPTIONS = [
  { value: '0', label: 'Less than 1 year' },
  { value: '1', label: '1 year old' },
  { value: '2', label: '2 years old' },
  { value: '3', label: '3 years old' },
  { value: '4', label: '4+ years old' },
];

const TRADE_IN_CONDITION_OPTIONS = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'rough', label: 'Rough' },
];

const ProductDetails = () => {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProduct, isLoading } = useSelector((state) => state.products);
  const { wishlist } = useSelector((state) => state.cart);
  const { compare } = useExperience();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [deliveryPin, setDeliveryPin] = useState('');
  const [finance, setFinance] = useState({
    downPayment: 9999,
    months: '12',
    annualRate: 14,
  });
  const [tradeIn, setTradeIn] = useState({
    deviceAge: '1',
    condition: 'good',
  });
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
    if (!currentProduct) return;

    const firstImage = currentProduct.thumbnail || currentProduct.images?.[0] || '';
    setSelectedImage(firstImage);
    dispatch(addRecentlyViewed(currentProduct));

    let ignore = false;

    const loadRelated = async () => {
      try {
        const response = await productService.getProducts({
          category: currentProduct.category,
          limit: 5,
          sort: 'featured',
        });

        if (!ignore) {
          setRelatedProducts(
            response.data.filter((product) => product._id !== currentProduct._id).slice(0, 4)
          );
        }
      } catch {
        if (!ignore) {
          setRelatedProducts([]);
        }
      }
    };

    loadRelated();

    return () => {
      ignore = true;
    };
  }, [currentProduct, dispatch]);

  const wishlistIds = new Set(wishlist.map((item) => item._id || item.product?._id));
  const compareIds = new Set(compare.map((item) => item._id));

  const deliveryEstimate = useMemo(() => estimateDeliveryWindow(deliveryPin), [deliveryPin]);
  const emiEstimate = useMemo(
    () =>
      calculateEmi({
        principal: currentProduct?.price || 0,
        months: Number(finance.months),
        annualRate: Number(finance.annualRate),
        downPayment: Number(finance.downPayment),
      }),
    [currentProduct?.price, finance.annualRate, finance.downPayment, finance.months]
  );

  const tradeInValue = useMemo(
    () =>
      estimateTradeIn({
        productPrice: currentProduct?.price || 0,
        deviceAge: tradeIn.deviceAge,
        condition: tradeIn.condition,
        category: currentProduct?.category,
      }),
    [currentProduct?.category, currentProduct?.price, tradeIn.condition, tradeIn.deviceAge]
  );

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
    <section className="container page-stack product-detail-page product-detail-page--upgraded">
      <div className="product-detail-grid product-detail-grid--upgraded">
        <div className="gallery-panel gallery-panel--enhanced">
          <div className="detail-gallery-frame">
            <SafeImg
              src={selectedImage || currentProduct.thumbnail || currentProduct.images?.[0]}
              alt={currentProduct.title}
              className="detail-hero-image"
              decoding="async"
            />
            <div className="detail-gallery-price-float" aria-hidden="true">
              <span className="detail-gallery-price-float__deal">{formatCurrency(currentProduct.price)}</span>
              {currentProduct.compareAtPrice ? (
                <span className="detail-gallery-price-float__mrp">
                  M.R.P. {formatCurrency(currentProduct.compareAtPrice)}
                </span>
              ) : null}
            </div>
          </div>

          <div className="thumbnail-row">
            {currentProduct.images?.map((image) => (
              <button
                key={image}
                type="button"
                className={`thumbnail-button ${selectedImage === image ? 'active' : ''}`.trim()}
                onClick={() => setSelectedImage(image)}
              >
                <SafeImg src={image} alt={currentProduct.title} decoding="async" />
              </button>
            ))}
          </div>
        </div>

        <div className="detail-panel detail-panel--upgraded">
          <div className="detail-panel__heading">
            <p className="eyebrow">{currentProduct.brand}</p>
            <h1>{currentProduct.title}</h1>
            <p className="section-copy">{currentProduct.description}</p>
          </div>

          <div className="chip-row">
            <span className="meta-chip">{currentProduct.category}</span>
            {currentProduct.subcategory ? <span className="meta-chip">{currentProduct.subcategory}</span> : null}
            <span className="meta-chip">Rating {currentProduct.ratings?.average || 0}/5</span>
            <span className="meta-chip">{currentProduct.inventory?.stock} in stock</span>
          </div>

          <div className="price-row detail-price price-row--retail">
            <div className="price-deal">
              <strong>{formatCurrency(currentProduct.price)}</strong>
            </div>
            {currentProduct.compareAtPrice ? (
              <div className="price-mrp">
                <span className="mrp-label">M.R.P.</span>
                <span className="mrp-value">{formatCurrency(currentProduct.compareAtPrice)}</span>
              </div>
            ) : null}
          </div>

          <p className="price-disclaimer muted-text">
            Transparent demo pricing in INR, paired with delivery and finance planning before checkout.
          </p>

          <div className="detail-panel__controls">
            <div className="quantity-inline">
              <Input
                label="Quantity"
                type="number"
                min="1"
                max={currentProduct.inventory?.stock || 1}
                value={quantity}
                onChange={(event) =>
                  setQuantity(
                    Math.max(
                      1,
                      Math.min(
                        Number(event.target.value) || 1,
                        currentProduct.inventory?.stock || 1
                      )
                    )
                  )
                }
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
                <FiHeart />
                {wishlistIds.has(currentProduct._id) ? 'Saved' : 'Save'}
              </Button>
              <Button variant="secondary" onClick={() => dispatch(toggleCompareItem(currentProduct))}>
                <FiBarChart2 />
                {compareIds.has(currentProduct._id) ? 'Pinned to Compare' : 'Add to Compare'}
              </Button>
            </div>
          </div>

          <div className="detail-buying-grid">
            <article className="surface-card surface-card--subtle detail-buying-card">
              <p className="eyebrow">Delivery check</p>
              <Input
                label="PIN code"
                placeholder="560001"
                value={deliveryPin}
                onChange={(event) => setDeliveryPin(event.target.value)}
              />
              <div className="info-list">
                <div className="info-item">
                  <span>Service lane</span>
                  <strong>{deliveryEstimate.label}</strong>
                </div>
                <div className="info-item">
                  <span>Estimated arrival</span>
                  <strong>{deliveryEstimate.etaDays ? `${deliveryEstimate.etaDays} days` : 'Pending'}</strong>
                </div>
              </div>
            </article>

            <article className="surface-card surface-card--subtle detail-buying-card">
              <p className="eyebrow">EMI preview</p>
              <div className="grid-two">
                <Input
                  label="Down payment"
                  type="number"
                  min="0"
                  value={finance.downPayment}
                  onChange={(event) =>
                    setFinance((current) => ({ ...current, downPayment: Number(event.target.value) || 0 }))
                  }
                />
                <Input
                  label="Tenure"
                  as="select"
                  options={FINANCE_MONTH_OPTIONS}
                  value={finance.months}
                  onChange={(event) =>
                    setFinance((current) => ({ ...current, months: event.target.value }))
                  }
                />
              </div>
              <div className="info-list">
                <div className="info-item">
                  <span>Monthly estimate</span>
                  <strong>{formatCurrency(emiEstimate.monthlyInstallment)}</strong>
                </div>
                <div className="info-item">
                  <span>Total payable</span>
                  <strong>{formatCurrency(emiEstimate.totalPayable)}</strong>
                </div>
              </div>
            </article>

            <article className="surface-card surface-card--subtle detail-buying-card">
              <p className="eyebrow">Trade-in estimate</p>
              <div className="grid-two">
                <Input
                  label="Current device age"
                  as="select"
                  options={TRADE_IN_AGE_OPTIONS}
                  value={tradeIn.deviceAge}
                  onChange={(event) =>
                    setTradeIn((current) => ({ ...current, deviceAge: event.target.value }))
                  }
                />
                <Input
                  label="Condition"
                  as="select"
                  options={TRADE_IN_CONDITION_OPTIONS}
                  value={tradeIn.condition}
                  onChange={(event) =>
                    setTradeIn((current) => ({ ...current, condition: event.target.value }))
                  }
                />
              </div>
              <div className="info-list">
                <div className="info-item">
                  <span>Estimated exchange value</span>
                  <strong>{formatCurrency(tradeInValue)}</strong>
                </div>
                <div className="info-item">
                  <span>Effective device cost</span>
                  <strong>{formatCurrency(Math.max(currentProduct.price - tradeInValue, 0))}</strong>
                </div>
              </div>
            </article>
          </div>

          <div className="detail-support-strip">
            <span>
              <FiTruck />
              Protected delivery options
            </span>
            <span>
              <FiMapPin />
              Store reservation flow available
            </span>
          </div>
        </div>
      </div>

      <div className="detail-columns detail-columns--upgraded">
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
          <p className="eyebrow">Seller</p>
          <div className="info-list">
            <div className="info-item">
              <span>Seller name</span>
              <strong>
                {currentProduct.seller?.sellerProfile?.shopName ||
                  currentProduct.seller?.firstName ||
                  'Marketplace seller'}
              </strong>
            </div>
            <div className="info-item">
              <span>Stock</span>
              <strong>{currentProduct.inventory?.stock} units ready</strong>
            </div>
            <div className="info-item">
              <span>SKU</span>
              <strong>{currentProduct.inventory?.sku}</strong>
            </div>
          </div>
        </article>
      </div>

      <article className="surface-card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Reviews</p>
            <h2>Customer feedback</h2>
          </div>
        </div>

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
            onSubmit={async (event) => {
              event.preventDefault();
              await dispatch(
                createReview({
                  productId: currentProduct._id,
                  payload: reviewForm,
                })
              );
              setReviewForm({ rating: 5, title: '', comment: '' });
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
        ) : (
          <p className="muted-text">
            <Link to="/login" className="text-link">
              Sign in
            </Link>{' '}
            as a customer to review this product.
          </p>
        )}
      </article>

      {relatedProducts.length ? (
        <section className="content-section">
          <div className="section-header">
            <div>
              <p className="eyebrow">Related devices</p>
              <h2>Stay in the lane, compare the alternatives.</h2>
            </div>
          </div>

          <ProductList
            products={relatedProducts}
            onAddToCart={(product) =>
              handleCustomerAction(() => dispatch(addToCart({ productId: product._id, quantity: 1 })))
            }
            onToggleWishlist={(productId) =>
              handleCustomerAction(() => dispatch(toggleWishlist(productId)))
            }
            onToggleCompare={(product) => dispatch(toggleCompareItem(product))}
            isCompared={(product) => compareIds.has(product._id)}
            isWishlisted={(product) => wishlistIds.has(product._id)}
          />
        </section>
      ) : null}
    </section>
  );
};

export default ProductDetails;
