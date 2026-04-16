import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Loader from '../../components/common/Loader.jsx';
import Modal from '../../components/common/Modal.jsx';
import SafeImg from '../../components/common/SafeImg.jsx';
import productService from '../../services/productService.js';
import { downloadCsv } from '../../utils/exportCsv.js';
import { formatDate } from '../../utils/formatDate.js';
import formatCurrency from '../../utils/formatCurrency.js';
import { buildProductPayload, createProductFormState } from '../../utils/productForm.js';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ARCHIVED', label: 'Archived' },
];

const FEATURE_OPTIONS = [
  { value: 'ALL', label: 'All visibility' },
  { value: 'FEATURED', label: 'Featured only' },
  { value: 'STANDARD', label: 'Non-featured' },
];

const STOCK_OPTIONS = [
  { value: 'ALL', label: 'All stock levels' },
  { value: 'LOW', label: 'Low stock' },
  { value: 'OUT', label: 'Out of stock' },
];

const getProductStatusTone = (status) => {
  switch (status) {
    case 'PUBLISHED':
      return 'status-tag--success';
    case 'DRAFT':
      return 'status-tag--warning';
    case 'ARCHIVED':
      return 'status-tag--muted';
    default:
      return 'status-tag--default';
  }
};

const getStockState = (product) => {
  const stock = product.inventory?.stock || 0;
  const threshold = product.inventory?.lowStockThreshold || 0;

  if (stock <= 0) return 'OUT';
  if (stock <= threshold) return 'LOW';
  return 'HEALTHY';
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(createProductFormState());
  const [filters, setFilters] = useState({
    search: '',
    status: 'ALL',
    featured: 'ALL',
    stock: 'ALL',
  });
  const [busyId, setBusyId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [modalError, setModalError] = useState('');
  const deferredSearch = useDeferredValue(filters.search);

  const loadProducts = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const response = await productService.getAdminProducts({
        sort: 'newest',
        limit: 100,
        status: filters.status === 'ALL' ? '' : filters.status,
        search: deferredSearch,
        featured: filters.featured === 'FEATURED' ? 'true' : '',
      });

      setProducts(response.data);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to fetch products');
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadProducts();
  }, [deferredSearch, filters.featured, filters.status]);

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        if (filters.featured === 'STANDARD' && product.isFeatured) {
          return false;
        }

        if (filters.stock !== 'ALL' && getStockState(product) !== filters.stock) {
          return false;
        }

        return true;
      }),
    [filters.featured, filters.stock, products]
  );

  const metrics = useMemo(
    () => ({
      total: filteredProducts.length,
      published: filteredProducts.filter((product) => product.status === 'PUBLISHED').length,
      featured: filteredProducts.filter((product) => product.isFeatured).length,
      lowStock: filteredProducts.filter((product) => getStockState(product) === 'LOW').length,
      archived: filteredProducts.filter((product) => product.status === 'ARCHIVED').length,
    }),
    [filteredProducts]
  );

  const exportProducts = () => {
    downloadCsv({
      filename: 'admin-products.csv',
      columns: [
        { label: 'Title', key: 'title' },
        { label: 'Seller', value: (product) => product.seller?.sellerProfile?.shopName || '' },
        { label: 'Brand', key: 'brand' },
        { label: 'Status', key: 'status' },
        { label: 'Stock', value: (product) => product.inventory?.stock || 0 },
        { label: 'Price', value: (product) => product.price },
        { label: 'Featured', value: (product) => (product.isFeatured ? 'Yes' : 'No') },
        { label: 'Created', value: (product) => formatDate(product.createdAt) },
      ],
      rows: filteredProducts,
    });
  };

  const quickUpdateProduct = async (product, patch, successMessage) => {
    try {
      setBusyId(product._id);
      const nextForm = {
        ...createProductFormState(product),
        ...patch,
      };

      await productService.updateProduct(product._id, buildProductPayload(nextForm));
      await loadProducts(false);
      setMessage(successMessage);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update product');
    } finally {
      setBusyId('');
    }
  };

  const handleArchive = async (product) => {
    const confirmed = window.confirm(`Archive ${product.title}?`);

    if (!confirmed) {
      return;
    }

    try {
      setBusyId(product._id);
      await productService.deleteProduct(product._id);
      await loadProducts(false);
      setMessage('Product archived successfully');
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to archive product');
    } finally {
      setBusyId('');
    }
  };

  if (loading) {
    return <Loader label="Loading products" />;
  }

  return (
    <DashboardLayout
      role="ADMIN"
      title="Monitor platform catalog"
      description="Moderate listings, toggle visibility, and export the current catalog view without leaving the admin workspace."
      actions={
        <Button variant="ghost" onClick={exportProducts} disabled={!filteredProducts.length}>
          Export CSV
        </Button>
      }
    >
      <section className="surface-card console-hero console-hero--admin">
        <div>
          <p className="eyebrow">Catalog moderation</p>
          <h3>Find risky listings faster and make merchandising decisions with more context.</h3>
          <p className="section-copy">
            Combine search, status, visibility, and stock health to review the catalog the way an ops team actually works.
          </p>
        </div>
        <div className="console-hero__stats">
          <div className="console-stat">
            <span>Loaded listings</span>
            <strong>{metrics.total}</strong>
          </div>
          <div className="console-stat">
            <span>Published</span>
            <strong>{metrics.published}</strong>
          </div>
          <div className="console-stat">
            <span>Featured</span>
            <strong>{metrics.featured}</strong>
          </div>
          <div className="console-stat">
            <span>Low stock</span>
            <strong>{metrics.lowStock}</strong>
          </div>
        </div>
      </section>

      {message ? <div className="alert alert-success">{message}</div> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}

      <section className="surface-card control-shell">
        <div className="control-grid">
          <Input
            label="Search catalog"
            placeholder="Title, brand, or product copy"
            value={filters.search}
            onChange={(event) =>
              setFilters((current) => ({ ...current, search: event.target.value }))
            }
          />
          <Input
            label="Status"
            as="select"
            options={STATUS_OPTIONS}
            value={filters.status}
            onChange={(event) =>
              setFilters((current) => ({ ...current, status: event.target.value }))
            }
          />
          <Input
            label="Visibility"
            as="select"
            options={FEATURE_OPTIONS}
            value={filters.featured}
            onChange={(event) =>
              setFilters((current) => ({ ...current, featured: event.target.value }))
            }
          />
          <Input
            label="Stock health"
            as="select"
            options={STOCK_OPTIONS}
            value={filters.stock}
            onChange={(event) =>
              setFilters((current) => ({ ...current, stock: event.target.value }))
            }
          />
        </div>
      </section>

      <div className="stack-list">
        {filteredProducts.length ? (
          filteredProducts.map((product) => {
            const stockState = getStockState(product);

            return (
              <article key={product._id} className="surface-card entity-card entity-card--product">
                <div className="admin-product-thumb">
                  <SafeImg src={product.thumbnail || product.images?.[0]} alt="" decoding="async" />
                  <span className="admin-product-thumb__price">{formatCurrency(product.price)}</span>
                </div>

                <div className="entity-card__body">
                  <div className="entity-card__header">
                    <div>
                      <div className="inline-actions">
                        <span className={`status-tag ${getProductStatusTone(product.status)}`}>
                          {product.status}
                        </span>
                        {product.isFeatured ? <span className="status-tag status-tag--info">Featured</span> : null}
                        <span className={`status-tag ${stockState === 'LOW' ? 'status-tag--warning' : stockState === 'OUT' ? 'status-tag--danger' : 'status-tag--success'}`}>
                          {stockState === 'OUT' ? 'Out of stock' : stockState === 'LOW' ? 'Low stock' : 'Healthy'}
                        </span>
                      </div>
                      <h3>{product.title}</h3>
                    </div>
                    <div className="entity-card__summary">
                      <strong>{formatCurrency(product.price)}</strong>
                      <span className="muted-text">{product.seller?.sellerProfile?.shopName || 'Seller'}</span>
                    </div>
                  </div>

                  <div className="data-points">
                    <span className="meta-chip">{product.brand}</span>
                    <span className="meta-chip">{product.category}{product.subcategory ? ` / ${product.subcategory}` : ''}</span>
                    <span className="meta-chip">Stock {product.inventory?.stock || 0}</span>
                    <span className="meta-chip">Updated {formatDate(product.updatedAt || product.createdAt)}</span>
                  </div>

                  <p className="section-copy">{product.shortDescription}</p>
                </div>

                <div className="entity-card__aside">
                  <Button variant="ghost" onClick={() => {
                    setEditingProduct(product);
                    setForm(createProductFormState(product));
                    setModalError('');
                  }}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={busyId === product._id}
                    onClick={() =>
                      quickUpdateProduct(
                        product,
                        { isFeatured: !product.isFeatured },
                        product.isFeatured ? 'Removed from featured placements' : 'Added to featured placements'
                      )
                    }
                  >
                    {product.isFeatured ? 'Unfeature' : 'Feature'}
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={busyId === product._id}
                    onClick={() =>
                      quickUpdateProduct(
                        product,
                        { status: product.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' },
                        product.status === 'PUBLISHED' ? 'Product moved to draft' : 'Product published'
                      )
                    }
                  >
                    {product.status === 'PUBLISHED' ? 'Move to Draft' : 'Publish'}
                  </Button>
                  <Button
                    variant="danger"
                    disabled={busyId === product._id}
                    onClick={() => handleArchive(product)}
                  >
                    Archive
                  </Button>
                </div>
              </article>
            );
          })
        ) : (
          <div className="empty-state empty-state--card">
            No products match the selected filters.
          </div>
        )}
      </div>

      <Modal
        isOpen={Boolean(editingProduct)}
        title={editingProduct ? `Edit ${editingProduct.title}` : 'Edit Product'}
        onClose={() => {
          setEditingProduct(null);
          setModalError('');
        }}
      >
        <form
          className="stack-list"
          onSubmit={async (event) => {
            event.preventDefault();

            try {
              await productService.updateProduct(editingProduct._id, buildProductPayload(form));
              setEditingProduct(null);
              setModalError('');
              await loadProducts(false);
              setMessage('Product updated successfully');
              setError('');
            } catch (requestError) {
              setModalError(requestError.response?.data?.message || 'Unable to update product');
            }
          }}
        >
          <div className="grid-two">
            <Input
              label="Title"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            />
            <Input
              label="Brand"
              value={form.brand}
              onChange={(event) => setForm((current) => ({ ...current, brand: event.target.value }))}
            />
          </div>
          <div className="grid-two">
            <Input
              label="Category"
              value={form.category}
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
            />
            <Input
              label="Subcategory"
              value={form.subcategory}
              onChange={(event) =>
                setForm((current) => ({ ...current, subcategory: event.target.value }))
              }
            />
          </div>
          <Input
            label="Short Description"
            value={form.shortDescription}
            onChange={(event) =>
              setForm((current) => ({ ...current, shortDescription: event.target.value }))
            }
          />
          <Input
            label="Description"
            as="textarea"
            rows="4"
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
          />
          <div className="grid-three">
            <Input
              label="Price"
              type="number"
              value={form.price}
              onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
            />
            <Input
              label="Compare At"
              type="number"
              value={form.compareAtPrice}
              onChange={(event) =>
                setForm((current) => ({ ...current, compareAtPrice: event.target.value }))
              }
            />
            <Input
              label="Stock"
              type="number"
              value={form.stock}
              onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))}
            />
          </div>
          <div className="grid-three">
            <Input
              label="SKU"
              value={form.sku}
              onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value }))}
            />
            <Input
              label="Low stock threshold"
              type="number"
              value={form.lowStockThreshold}
              onChange={(event) =>
                setForm((current) => ({ ...current, lowStockThreshold: event.target.value }))
              }
            />
            <Input
              label="Status"
              as="select"
              options={STATUS_OPTIONS.filter((option) => option.value !== 'ALL')}
              value={form.status}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
            />
          </div>
          <Input
            label="Image URLs"
            as="textarea"
            rows="3"
            value={form.images}
            onChange={(event) => setForm((current) => ({ ...current, images: event.target.value }))}
          />
          <Input
            label="Specifications"
            as="textarea"
            rows="5"
            value={form.specifications}
            onChange={(event) =>
              setForm((current) => ({ ...current, specifications: event.target.value }))
            }
          />
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(event) =>
                setForm((current) => ({ ...current, isFeatured: event.target.checked }))
              }
            />
            <span>Feature this product</span>
          </label>
          {modalError ? <div className="alert alert-error">{modalError}</div> : null}
          <div className="inline-actions">
            <Button type="submit">Save Changes</Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setEditingProduct(null);
                setModalError('');
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default Products;
