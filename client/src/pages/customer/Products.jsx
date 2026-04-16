import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiBarChart2, FiSliders, FiX } from 'react-icons/fi';
import Button from '../../components/common/Button.jsx';
import ProductFilter from '../../components/product/ProductFilter.jsx';
import ProductList from '../../components/product/ProductList.jsx';
import ProductGridSkeleton from '../../components/product/ProductGridSkeleton.jsx';
import CatalogToolbar from '../../components/product/CatalogToolbar.jsx';
import { fetchProducts, setProductFilters } from '../../store/slices/productSlice.js';
import { addToCart, toggleWishlist } from '../../store/slices/cartSlice.js';
import { toggleCompareItem } from '../../store/slices/experienceSlice.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import { useExperience } from '../../hooks/useExperience.js';
import { isApiBaseUrlConfigured } from '../../services/api.js';
import {
  DEVICE_CATEGORY_META,
  EXPLORE_QUICK_FILTERS,
  ROLES,
} from '../../utils/constants.js';

const GRID_STORAGE_KEY = 'bmobile-catalog-grid';

const defaultFilters = () => ({
  page: 1,
  limit: 12,
  sort: 'featured',
  category: '',
  subcategory: '',
  brand: '',
  minPrice: '',
  maxPrice: '',
});

const readInitialGrid = () => {
  try {
    const value = localStorage.getItem(GRID_STORAGE_KEY);
    return value === 'compact' ? 'compact' : 'comfortable';
  } catch {
    return 'comfortable';
  }
};

const isQuickFilterActive = (preset, filters) => {
  if (preset.id === 'all') {
    return !(filters.category || '').trim() && !(filters.subcategory || '').trim() && !(filters.brand || '').trim();
  }

  return (
    (filters.category || '') === preset.patch.category &&
    (filters.subcategory || '') === preset.patch.subcategory &&
    (filters.brand || '') === preset.patch.brand
  );
};

const buildPageList = (current, totalPages, max = 5) => {
  if (totalPages <= max) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const half = Math.floor(max / 2);
  let start = Math.max(1, current - half);
  let end = Math.min(totalPages, start + max - 1);
  start = Math.max(1, end - max + 1);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

const Products = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlKey = useMemo(() => searchParams.toString(), [searchParams]);
  const { items, meta, isLoading, error } = useSelector((state) => state.products);
  const { wishlist } = useSelector((state) => state.cart);
  const { compare, recentlyViewed } = useExperience();
  const { user } = useAuth();

  const [searchInput, setSearchInput] = useState(() => searchParams.get('search') || '');
  const debouncedSearch = useDebouncedValue(searchInput, 380);
  const [localFilters, setLocalFilters] = useState(() => ({
    ...defaultFilters(),
    sort: searchParams.get('sort') || 'featured',
    category: searchParams.get('category') || '',
    subcategory: searchParams.get('subcategory') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  }));

  const [gridDensity, setGridDensity] = useState(readInitialGrid);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(GRID_STORAGE_KEY, gridDensity);
    } catch {
      /* ignore */
    }
  }, [gridDensity]);

  useEffect(() => {
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const subcategory = searchParams.get('subcategory') || '';
    const brand = searchParams.get('brand') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const sort = searchParams.get('sort') || 'featured';
    setSearchInput(search);
    setLocalFilters((previous) => {
      if (
        previous.sort === sort &&
        previous.category === category &&
        previous.subcategory === subcategory &&
        previous.brand === brand &&
        previous.minPrice === minPrice &&
        previous.maxPrice === maxPrice
      ) {
        return previous;
      }

      return { ...previous, sort, category, subcategory, brand, minPrice, maxPrice, page: 1 };
    });
  }, [urlKey, searchParams]);

  const queryParams = useMemo(
    () => ({
      ...localFilters,
      search: debouncedSearch,
      page: localFilters.page || 1,
      limit: 12,
    }),
    [localFilters, debouncedSearch]
  );

  useEffect(() => {
    dispatch(setProductFilters(queryParams));
    dispatch(fetchProducts(queryParams));
  }, [dispatch, queryParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
    if (localFilters.category) params.set('category', localFilters.category);
    if (localFilters.subcategory) params.set('subcategory', localFilters.subcategory);
    if (localFilters.brand) params.set('brand', localFilters.brand);
    if (localFilters.minPrice) params.set('minPrice', localFilters.minPrice);
    if (localFilters.maxPrice) params.set('maxPrice', localFilters.maxPrice);
    if (localFilters.sort && localFilters.sort !== 'featured') params.set('sort', localFilters.sort);
    const next = params.toString();

    if (next !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [
    debouncedSearch,
    localFilters.brand,
    localFilters.category,
    localFilters.maxPrice,
    localFilters.minPrice,
    localFilters.sort,
    localFilters.subcategory,
    searchParams,
    setSearchParams,
  ]);

  const wishlistIds = new Set(wishlist.map((item) => item._id || item.product?._id));
  const compareIds = new Set(compare.map((item) => item._id));

  const guardedCustomerAction = useCallback(
    (callback) => {
      if (user?.role !== ROLES.CUSTOMER) {
        navigate('/login');
        return;
      }

      callback();
    },
    [navigate, user?.role]
  );

  const patchFilters = useCallback((patch) => {
    setLocalFilters((current) => ({
      ...current,
      ...patch,
      page: 1,
    }));
  }, []);

  const onFilterChange = useCallback((key, value) => {
    setLocalFilters((current) => ({
      ...current,
      [key]: value,
      page: 1,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setSearchInput('');
    setLocalFilters(defaultFilters());
  }, []);

  const removeChip = useCallback(
    (key) => {
      if (key === 'search') {
        setSearchInput('');
        return;
      }

      onFilterChange(key, '');
    },
    [onFilterChange]
  );

  const activeChips = useMemo(() => {
    const chips = [];
    if (debouncedSearch.trim()) chips.push({ key: 'search', label: `Search: "${debouncedSearch.trim()}"` });
    if (localFilters.category?.trim()) chips.push({ key: 'category', label: `Category: ${localFilters.category}` });
    if (localFilters.subcategory?.trim()) chips.push({ key: 'subcategory', label: `Segment: ${localFilters.subcategory}` });
    if (localFilters.brand?.trim()) chips.push({ key: 'brand', label: `Brand: ${localFilters.brand}` });
    if (localFilters.minPrice !== '' && localFilters.minPrice != null) chips.push({ key: 'minPrice', label: `Min Rs ${localFilters.minPrice}` });
    if (localFilters.maxPrice !== '' && localFilters.maxPrice != null) chips.push({ key: 'maxPrice', label: `Max Rs ${localFilters.maxPrice}` });
    return chips;
  }, [debouncedSearch, localFilters]);

  const gridClass =
    gridDensity === 'compact' ? 'product-grid--catalog-compact' : 'product-grid--catalog-comfortable';

  const skeletonCount = gridDensity === 'compact' ? 10 : 8;
  const showFullSkeleton = isLoading && (!items || items.length === 0);
  const showErrorState = Boolean(error) && !isLoading && (!items || items.length === 0);
  const pageList = buildPageList(meta.page, meta.totalPages || 1);
  const categoryMeta = DEVICE_CATEGORY_META[localFilters.category];
  const shouldShowDeployHint =
    Boolean(error) &&
    !isApiBaseUrlConfigured &&
    typeof window !== 'undefined' &&
    !['localhost', '127.0.0.1'].includes(window.location.hostname);

  return (
    <section className="catalog-page catalog-page--upgraded">
      <div className="container catalog-page-inner">
        <header className="catalog-hero surface-card catalog-hero--upgraded">
          <div className="catalog-hero__copy">
            <p className="eyebrow">{categoryMeta?.eyebrow || 'Explore everything'}</p>
            <h1>
              {categoryMeta?.title
                ? `${categoryMeta.title} with stronger discovery, clearer pricing, and faster decisions.`
                : 'Browse phones, tablets, and laptops without losing your place.'}
            </h1>
            <p className="section-copy">
              {categoryMeta?.description ||
                'Search, refine, compare, and jump between device categories without resetting the whole experience.'}
            </p>
          </div>
          <dl className="catalog-hero__stats">
            <div className="catalog-stat">
              <dt>Catalog size</dt>
              <dd>{isLoading && meta.total === 0 ? '-' : meta.total}</dd>
            </div>
            <div className="catalog-stat">
              <dt>Compare board</dt>
              <dd>{compare.length}</dd>
            </div>
            <div className="catalog-stat">
              <dt>Recently viewed</dt>
              <dd>{recentlyViewed.length}</dd>
            </div>
          </dl>
        </header>

        <div className="catalog-device-switcher">
          {Object.entries(DEVICE_CATEGORY_META).map(([key, value]) => (
            <button
              key={key}
              type="button"
              className={`catalog-device-card${localFilters.category === key ? ' is-active' : ''}`}
              onClick={() => patchFilters({ category: key, subcategory: '', brand: '' })}
            >
              <span className="catalog-device-card__eyebrow">{value.eyebrow}</span>
              <strong>{value.title}</strong>
              <span>{value.accent}</span>
            </button>
          ))}
          <button
            type="button"
            className={`catalog-device-card${!localFilters.category ? ' is-active' : ''}`}
            onClick={() => patchFilters({ category: '', subcategory: '', brand: '' })}
          >
            <span className="catalog-device-card__eyebrow">Full catalog</span>
            <strong>All devices</strong>
            <span>Cross-category discovery</span>
          </button>
        </div>

        <div className="catalog-quick-row">
          <p className="catalog-quick-label">Quick picks</p>
          <div className="catalog-quick-filters" role="group" aria-label="Quick filters">
            {EXPLORE_QUICK_FILTERS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`quick-filter-chip${isQuickFilterActive(preset, localFilters) ? ' is-active' : ''}`}
                onClick={() => patchFilters(preset.patch)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <section className="surface-card catalog-assistant-card">
          <div>
            <p className="eyebrow">Buying assistant</p>
            <h3>Pin top picks to compare before you put anything in the cart.</h3>
          </div>
          <div className="catalog-assistant-card__actions">
            <Link to="/compare" className="catalog-compare-pill is-active">
              <FiBarChart2 />
              <span>Open compare board ({compare.length})</span>
            </Link>
            <span className="muted-text">
              Use the compare button on any card to keep your shortlist visible.
            </span>
          </div>
        </section>

        <button
          type="button"
          className="catalog-mobile-filter-btn"
          onClick={() => setMobileFiltersOpen(true)}
        >
          <FiSliders aria-hidden />
          Filters and search
        </button>

        <div className="catalog-layout">
          <aside className="catalog-sidebar" aria-label="Filter sidebar">
            <ProductFilter
              searchValue={searchInput}
              onSearchChange={setSearchInput}
              filters={localFilters}
              onChange={onFilterChange}
              onReset={resetFilters}
            />
          </aside>

          {mobileFiltersOpen ? (
            <>
              <button
                type="button"
                className="catalog-drawer-backdrop"
                aria-label="Close filters"
                onClick={() => setMobileFiltersOpen(false)}
              />
              <div className="catalog-drawer" role="dialog" aria-modal="true" aria-labelledby="catalog-drawer-title">
                <div className="catalog-drawer__head">
                  <h2 id="catalog-drawer-title">Filters</h2>
                  <button
                    type="button"
                    className="icon-button catalog-drawer__close"
                    onClick={() => setMobileFiltersOpen(false)}
                    aria-label="Close"
                  >
                    <FiX />
                  </button>
                </div>
                <div className="catalog-drawer__body">
                  <ProductFilter
                    searchValue={searchInput}
                    onSearchChange={setSearchInput}
                    filters={localFilters}
                    onChange={onFilterChange}
                    onReset={resetFilters}
                  />
                </div>
                <div className="catalog-drawer__foot">
                  <Button fullWidth onClick={() => setMobileFiltersOpen(false)}>
                    View results
                  </Button>
                </div>
              </div>
            </>
          ) : null}

          <main className="catalog-main">
            {activeChips.length ? (
              <ul className="catalog-active-chips" aria-label="Active filters">
                {activeChips.map((chip) => (
                  <li key={chip.key}>
                    <span className="filter-chip">
                      {chip.label}
                      <button
                        type="button"
                        className="filter-chip__remove"
                        onClick={() => removeChip(chip.key)}
                        aria-label={`Remove ${chip.label}`}
                      >
                        x
                      </button>
                    </span>
                  </li>
                ))}
                <li>
                  <button type="button" className="catalog-clear-chips" onClick={resetFilters}>
                    Clear all
                  </button>
                </li>
              </ul>
            ) : null}

            <CatalogToolbar
              total={meta.total}
              page={meta.page}
              limit={meta.limit || 12}
              sort={localFilters.sort}
              onSortChange={(sort) => onFilterChange('sort', sort)}
              gridDensity={gridDensity}
              onGridDensityChange={setGridDensity}
              isLoading={isLoading}
              compareCount={compare.length}
            />

            {error ? (
              <div className="alert alert-error">
                <strong>Catalog unavailable.</strong> {error}
                {shouldShowDeployHint ? (
                  <div className="muted-text">
                    Set `VITE_API_URL` on Netlify to your Render `/api/v1` URL and add your Netlify
                    domain to the Render `CLIENT_URLS` allowlist.
                  </div>
                ) : null}
                <div className="inline-actions">
                  <Button type="button" variant="ghost" onClick={() => dispatch(fetchProducts(queryParams))}>
                    Retry catalog
                  </Button>
                </div>
              </div>
            ) : null}

            <div className={`catalog-results${isLoading && items?.length ? ' is-refreshing' : ''}`}>
              {showFullSkeleton ? (
                <ProductGridSkeleton count={skeletonCount} gridClassName={gridClass} />
              ) : showErrorState ? (
                <div className="catalog-empty">
                  <div className="catalog-empty__card surface-card">
                    <p className="eyebrow">Catalog error</p>
                    <h2>The storefront could not load products from the API.</h2>
                    <p className="section-copy">
                      This usually means the backend URL, CORS allowlist, or database catalog on the
                      deployed environment still needs attention.
                    </p>
                    <div className="catalog-empty__actions">
                      <Button type="button" onClick={() => dispatch(fetchProducts(queryParams))}>
                        Retry catalog
                      </Button>
                      <Link to="/">
                        <Button variant="ghost">Back to home</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <ProductList
                  products={items}
                  gridClassName={gridClass}
                  onEmptyReset={resetFilters}
                  onAddToCart={(product) =>
                    guardedCustomerAction(() => dispatch(addToCart({ productId: product._id, quantity: 1 })))
                  }
                  onToggleWishlist={(productId) =>
                    guardedCustomerAction(() => dispatch(toggleWishlist(productId)))
                  }
                  onToggleCompare={(product) => dispatch(toggleCompareItem(product))}
                  isCompared={(product) => compareIds.has(product._id)}
                  isWishlisted={(product) => wishlistIds.has(product._id)}
                />
              )}
            </div>

            {meta.totalPages > 1 ? (
              <nav className="catalog-pagination" aria-label="Pagination">
                <Button variant="ghost" type="button" onClick={() => patchFilters({ page: 1 })} disabled={meta.page <= 1}>
                  First
                </Button>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setLocalFilters((current) => ({ ...current, page: Math.max(current.page - 1, 1) }))}
                  disabled={meta.page <= 1}
                >
                  Prev
                </Button>
                <div className="catalog-pagination__pages">
                  {pageList.map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      className={`catalog-page-btn${pageNumber === meta.page ? ' is-current' : ''}`}
                      onClick={() => setLocalFilters((current) => ({ ...current, page: pageNumber }))}
                      aria-current={pageNumber === meta.page ? 'page' : undefined}
                    >
                      {pageNumber}
                    </button>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  type="button"
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
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => patchFilters({ page: meta.totalPages })}
                  disabled={meta.page >= meta.totalPages}
                >
                  Last
                </Button>
              </nav>
            ) : null}
          </main>
        </div>
      </div>
    </section>
  );
};

export default Products;
