import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import ProductFilter from '../../components/product/ProductFilter.jsx';
import ProductList from '../../components/product/ProductList.jsx';
import Loader from '../../components/common/Loader.jsx';
import { fetchProducts, setProductFilters } from '../../store/slices/productSlice.js';
import { addToCart, toggleWishlist } from '../../store/slices/cartSlice.js';
import { useAuth } from '../../hooks/useAuth.js';
import { ROLES } from '../../utils/constants.js';

const Products = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, meta, filters, isLoading } = useSelector((state) => state.products);
  const { wishlist } = useSelector((state) => state.cart);
  const { user } = useAuth();
  const [localFilters, setLocalFilters] = useState({
    ...filters,
    search: searchParams.get('search') || '',
  });

  useEffect(() => {
    const params = {
      ...localFilters,
      page: localFilters.page || 1,
      limit: 12,
    };
    dispatch(setProductFilters(params));
    dispatch(fetchProducts(params));
    setSearchParams(params.search ? { search: params.search } : {});
  }, [dispatch, localFilters, setSearchParams]);

  const wishlistIds = new Set(wishlist.map((item) => item._id || item.product?._id));

  const guardedCustomerAction = (callback) => {
    if (user?.role !== ROLES.CUSTOMER) {
      navigate('/login');
      return;
    }

    callback();
  };

  return (
    <section className="container page-stack">
      <div className="section-header">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1>Filter by brand, price, and product intent.</h1>
        </div>
      </div>

      <ProductFilter
        filters={localFilters}
        onChange={(key, value) =>
          setLocalFilters((current) => ({
            ...current,
            [key]: value,
            page: 1,
          }))
        }
        onReset={() =>
          setLocalFilters({
            page: 1,
            limit: 12,
            sort: 'featured',
            search: '',
            category: '',
            brand: '',
            minPrice: '',
            maxPrice: '',
          })
        }
      />

      {isLoading ? <Loader label="Loading catalog" /> : null}

      <ProductList
        products={items}
        onAddToCart={(product) =>
          guardedCustomerAction(() =>
            dispatch(addToCart({ productId: product._id, quantity: 1 }))
          )
        }
        onToggleWishlist={(productId) =>
          guardedCustomerAction(() => dispatch(toggleWishlist(productId)))
        }
        isWishlisted={(product) => wishlistIds.has(product._id)}
      />

      <div className="pagination-bar">
        <Button
          variant="ghost"
          onClick={() =>
            setLocalFilters((current) => ({ ...current, page: Math.max(current.page - 1, 1) }))
          }
          disabled={meta.page <= 1}
        >
          Previous
        </Button>
        <span>
          Page {meta.page} of {meta.totalPages}
        </span>
        <Button
          variant="ghost"
          onClick={() =>
            setLocalFilters((current) => ({
              ...current,
              page: Math.min(current.page + 1, meta.totalPages || 1),
            }))
          }
          disabled={meta.page >= meta.totalPages}
        >
          Next
        </Button>
      </div>
    </section>
  );
};

export default Products;
