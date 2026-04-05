import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiSliders, FiX } from 'react-icons/fi';
import Button from '../../components/common/Button.jsx';
import ProductFilter from '../../components/product/ProductFilter.jsx';
import ProductList from '../../components/product/ProductList.jsx';
import ProductGridSkeleton from '../../components/product/ProductGridSkeleton.jsx';
import CatalogToolbar from '../../components/product/CatalogToolbar.jsx';
import { fetchProducts, setProductFilters } from '../../store/slices/productSlice.js';
import { addToCart, toggleWishlist } from '../../store/slices/cartSlice.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import { EXPLORE_QUICK_FILTERS, ROLES } from '../../utils/constants.js';

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
    const v = localStorage.getItem(GRID_STORAGE_KEY);
    return v === 'compact' ? 'compact' : 'comfortable';
  } catch {
    return 'comfortable';
  }
};

const isQuickFilterActive = (preset, filters) => {
  if (preset.id === 'all') {
    return (
      !(filters.category || '').trim() &&
      !(filters.subcategory || '').trim() &&
      !(filters.brand || '').trim()
    );
  }
  return (
    (filters.category || '') === preset.patch.category &&
    (filters.subcategory || '') === preset.patch.subcategory &&
    (filters.brand || '') === preset.patch.brand
  );
};

const buildPageList = (current, totalPages, max = 5) => {
  if (totalPages <= max) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const half = Math.floor(max / 2);
  let start = Math.max(1, current - half);
  let end = Math.min(totalPages, start + max - 1);
  start = Math.max(1, end - max + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

const Products = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlKey = useMemo(() => searchParams.toString(), [searchParams]);

  const { items, meta, isLoading } = useSelector((state) => state.products);
  const { wishlist } = useSelector((state) => state.cart);
  const { user } = useAuth();

  const [searchInput, setSearchInput] = useState(() => searchParams.get('search') || '');
  const debouncedSearch = useDebouncedValue(searchInput, 380);
  const [localFilters, setLocalFilters] = useState(() => ({
    ...defaultFilters(),
    category: searchParams.get('category') || '',
    subcategory: searchParams.get('subcategory') || '',
    brand: searchParams.get('brand') || '',
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
    setSearchInput(search);
    setLocalFilters((prev) => {
      if (
        prev.category === category &&
        prev.subcategory === subcategory &&
        prev.brand === brand
      ) {
        return prev;
      }
      return { ...prev, category, subcategory, brand, page: 1 };
    });
  }, [urlKey]);

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
    const sp = new URLSearchParams();
    if (debouncedSearch.trim()) sp.set('search', debouncedSearch.trim());
    if (localFilters.category) sp.set('category', localFilters.category);
    if (localFilters.subcategory) sp.set('subcategory', localFilters.subcategory);
    if (localFilters.brand) sp.set('brand', localFilters.brand);
    const next = sp.toString();
    if (next !== searchParams.toString()) {
      setSearchParams(sp, { replace: true });
    }
  }, [
    debouncedSearch,
    localFilters.category,
    localFilters.subcategory,
    localFilters.brand,
    setSearchParams,
    searchParams,
  ]);

  const wishlistIds = new Set(wishlist.map((item) => item._id || item.product?._id));

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

  const removeChip = useCallback((key) => {
    if (key === 'search') {
      setSearchInput('');
      return;
    }
    onFilterChange(key, '');
  }, [onFilterChange]);

  const activeChips = useMemo(() => {
    const chips = [];
    if (debouncedSearch.trim()) {
      chips.push({
        key: 'search',
        label: `Search: “${debouncedSearch.trim()}”`,
      });
    }
    if (localFilters.category?.trim()) {
      chips.push({ key: 'category', label: `Category: ${localFilters.category}` });
    }
    if (localFilters.subcategory?.trim()) {
      chips.push({ key: 'subcategory', label: `Segment: ${localFilters.subcategory}` });
    }
    if (localFilters.brand?.trim()) {
      chips.push({ key: 'brand', label: `Brand: ${localFilters.brand}` });
    }
    if (localFilters.minPrice !== '' && localFilters.minPrice != null) {
      chips.push({ key: 'minPrice', label: `Min ₹${localFilters.minPrice}` });
    }
    if (localFilters.maxPrice !== '' && localFilters.maxPrice != null) {
      chips.push({ key: 'maxPrice', label: `Max ₹${localFilters.maxPrice}` });
    }
    return chips;
  }, [debouncedSearch, localFilters]);

  const gridClass =
    gridDensity === 'compact' ? 'product-grid--catalog-compact' : 'product-grid--catalog-comfortable';

  const skeletonCount = gridDensity === 'compact' ? 10 : 8;
  const showFullSkeleton = isLoading && (!items || items.length === 0);
  const pageList = buildPageList(meta.page, meta.totalPages || 1);

  return (
    <section className="catalog-page">
      <div className="container catalog-page-inner">
        <header className="catalog-hero surface-card">
          <div className="catalog-hero__copy">
            <p className="eyebrow">Explore</p>
            <h1>Phones, filters, and sort — built for fast browsing.</h1>
            <p className="section-copy">
              Debounced search, shareable URLs, segment presets, and a grid you can tune. Prices stay in
              INR with clear M.R.P. context on each card.
            </p>
          </div>
          <dl className="catalog-hero__stats">
            <div className="catalog-stat">
              <dt>In catalog</dt>
              <dd>{isLoading && meta.total === 0 ? '—' : meta.total}</dd>
            </div>
            <div className="catalog-stat">
              <dt>Page</dt>
              <dd>
                {meta.page} / {Math.max(meta.totalPages, 1)}
              </dd>
            </div>
          </dl>
        </header>

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

        <button
          type="button"
          className="catalog-mobile-filter-btn"
          onClick={() => setMobileFiltersOpen(true)}
        >
          <FiSliders aria-hidden />
          Filters &amp; search
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
                {activeChips.map((c) => (
                  <li key={c.key}>
                    <span className="filter-chip">
                      {c.label}
                      <button
                        type="button"
                        className="filter-chip__remove"
                        onClick={() => removeChip(c.key)}
                        aria-label={`Remove ${c.label}`}
                      >
                        ×
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
            />

            <div className={`catalog-results${isLoading && items?.length ? ' is-refreshing' : ''}`}>
              {showFullSkeleton ? (
                <ProductGridSkeleton count={skeletonCount} gridClassName={gridClass} />
              ) : (
                <ProductList
                  products={items}
                  gridClassName={gridClass}
                  onEmptyReset={resetFilters}
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
              )}
            </div>

            {meta.totalPages > 1 ? (
              <nav className="catalog-pagination" aria-label="Pagination">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => patchFilters({ page: 1 })}
                  disabled={meta.page <= 1}
                >
                  First
                </Button>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() =>
                    setLocalFilters((c) => ({ ...c, page: Math.max(c.page - 1, 1) }))
                  }
                  disabled={meta.page <= 1}
                >
                  Prev
                </Button>
                <div className="catalog-pagination__pages">
                  {pageList.map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`catalog-page-btn${p === meta.page ? ' is-current' : ''}`}
                      onClick={() => setLocalFilters((c) => ({ ...c, page: p }))}
                      aria-current={p === meta.page ? 'page' : undefined}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() =>
                    setLocalFilters((c) => ({
                      ...c,
                      page: Math.min(c.page + 1, meta.totalPages || 1),
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
