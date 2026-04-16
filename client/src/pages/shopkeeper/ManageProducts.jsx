import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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

const STOCK_OPTIONS = [
  { value: 'ALL', label: 'All inventory' },
  { value: 'HEALTHY', label: 'Healthy stock' },
  { value: 'LOW', label: 'Low stock' },
  { value: 'OUT', label: 'Out of stock' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'priceDesc', label: 'Highest price' },
  { value: 'priceAsc', label: 'Lowest price' },
  { value: 'stockAsc', label: 'Stock: low to high' },
  { value: 'alpha', label: 'A to Z' },
];

const EDIT_STATUS_OPTIONS = STATUS_OPTIONS.filter((option) => option.value !== 'ALL');

const getStockState = (product) => {
  const stock = product.inventory?.stock || 0;
  const threshold = product.inventory?.lowStockThreshold || 0;

  if (stock <= 0) return 'OUT';
  if (stock <= threshold) return 'LOW';
  return 'HEALTHY';
};

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

const getStockTone = (stockState) => {
  switch (stockState) {
    case 'HEALTHY':
      return 'status-tag--success';
    case 'LOW':
      return 'status-tag--warning';
    case 'OUT':
      return 'status-tag--danger';
    default:
      return 'status-tag--default';
  }
};

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(createProductFormState());
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [busyId, setBusyId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [modalError, setModalError] = useState('');
  const deferredQuery = useDeferredValue(query);

  const loadProducts = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const response = await productService.getSellerProducts();
      setProducts(response);
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
  }, []);

  const metrics = useMemo(() => {
    const lowStock = products.filter((product) => getStockState(product) === 'LOW').length;
    const outOfStock = products.filter((product) => getStockState(product) === 'OUT').length;

    return {
      total: products.length,
      published: products.filter((product) => product.status === 'PUBLISHED' && product.isActive)
        .length,
      featured: products.filter((product) => product.isFeatured).length,
      lowStock,
      outOfStock,
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    const nextProducts = products
      .filter((product) => {
        if (statusFilter !== 'ALL' && product.status !== statusFilter) {
          return false;
        }

        if (stockFilter !== 'ALL' && getStockState(product) !== stockFilter) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        return [
          product.title,
          product.brand,
          product.category,
          product.subcategory,
          product.inventory?.sku,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedQuery));
      })
      .slice();

    nextProducts.sort((left, right) => {
      switch (sortBy) {
        case 'priceAsc':
          return left.price - right.price;
        case 'priceDesc':
          return right.price - left.price;
        case 'stockAsc':
          return (left.inventory?.stock || 0) - (right.inventory?.stock || 0);
        case 'alpha':
          return left.title.localeCompare(right.title);
        case 'newest':
        default:
          return new Date(right.createdAt) - new Date(left.createdAt);
      }
    });

    return nextProducts;
  }, [deferredQuery, products, sortBy, statusFilter, stockFilter]);

  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm(createProductFormState(product));
    setModalError('');
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    setForm(createProductFormState());
    setModalError('');
  };

  const handleArchive = async (product) => {
    const confirmed = window.confirm(`Archive ${product.title}? Customers will no longer see it.`);

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

  const handleDuplicate = async (product) => {
    try {
      setBusyId(product._id);
      const timestampSuffix = Date.now().toString().slice(-4);
      const duplicateForm = createProductFormState(product);
      duplicateForm.title = `${product.title} Copy`;
      duplicateForm.sku = `${product.inventory?.sku || 'SKU'}-${timestampSuffix}`;
      duplicateForm.status = 'DRAFT';
      duplicateForm.isFeatured = false;

      await productService.createProduct(buildProductPayload(duplicateForm));
      await loadProducts(false);
      setMessage('Draft duplicate created successfully');
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to duplicate product');
    } finally {
      setBusyId('');
    }
  };

  const exportProducts = () => {
    downloadCsv({
      filename: 'seller-catalog.csv',
      columns: [
        { label: 'Title', key: 'title' },
        { label: 'Brand', key: 'brand' },
        { label: 'Category', value: (product) => `${product.category} / ${product.subcategory || '-'}` },
        { label: 'Status', key: 'status' },
        { label: 'SKU', value: (product) => product.inventory?.sku || '' },
        { label: 'Stock', value: (product) => product.inventory?.stock || 0 },
        { label: 'Price', value: (product) => product.price },
        { label: 'Featured', value: (product) => (product.isFeatured ? 'Yes' : 'No') },
        { label: 'Created', value: (product) => formatDate(product.createdAt) },
      ],
      rows: filteredProducts,
    });
  };

  if (loading) {
    return <Loader label="Loading seller catalog" />;
  }

  return (
    <DashboardLayout
      role="SHOPKEEPER"
      title="Manage product catalog"
      description="Search faster, spot inventory risks, duplicate winning listings, and edit merchandising details from one workspace."
      actions={
        <>
          <Button variant="ghost" onClick={exportProducts} disabled={!filteredProducts.length}>
            Export CSV
          </Button>
          <Link to="/seller/products/new">
            <Button>Add Product</Button>
          </Link>
        </>
      }
    >
      <section className="surface-card console-hero console-hero--seller">
        <div>
          <p className="eyebrow">Catalog performance</p>
          <h3>Keep your assortment healthy and ready to sell.</h3>
          <p className="section-copy">
            Use the filters below to find slow movers, low-stock SKUs, or draft listings that still need work.
          </p>
        </div>
        <div className="console-hero__stats">
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
          <div className="console-stat">
            <span>Out of stock</span>
            <strong>{metrics.outOfStock}</strong>
          </div>
        </div>
      </section>

      {message ? <div className="alert alert-success">{message}</div> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}

      <section className="surface-card control-shell">
        <div className="control-grid">
          <Input
            label="Search catalog"
            placeholder="Search title, brand, SKU, or category"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Input
            label="Status"
            as="select"
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          />
          <Input
            label="Stock health"
            as="select"
            options={STOCK_OPTIONS}
            value={stockFilter}
            onChange={(event) => setStockFilter(event.target.value)}
          />
          <Input
            label="Sort by"
            as="select"
            options={SORT_OPTIONS}
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          />
        </div>
      </section>

      <div className="stack-list">
        {filteredProducts.length ? (
          filteredProducts.map((product) => {
            const stockState = getStockState(product);

            return (
              <article
                key={product._id}
                className="surface-card entity-card entity-card--product"
              >
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
                        <span className={`status-tag ${getStockTone(stockState)}`}>
                          {stockState === 'OUT' ? 'Out of stock' : stockState === 'LOW' ? 'Low stock' : 'Healthy'}
                        </span>
                        {product.isFeatured ? <span className="status-tag status-tag--info">Featured</span> : null}
                      </div>
                      <h3>{product.title}</h3>
                    </div>
                    <div className="entity-card__summary">
                      <strong>{formatCurrency(product.price)}</strong>
                      <span className="muted-text">
                        Updated {formatDate(product.updatedAt || product.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="data-points">
                    <span className="meta-chip">{product.brand}</span>
                    <span className="meta-chip">{product.category}{product.subcategory ? ` / ${product.subcategory}` : ''}</span>
                    <span className="meta-chip">SKU {product.inventory?.sku}</span>
                    <span className="meta-chip">Stock {product.inventory?.stock || 0}</span>
                    <span className="meta-chip">
                      Threshold {product.inventory?.lowStockThreshold || 0}
                    </span>
                  </div>

                  <p className="section-copy">{product.shortDescription}</p>
                </div>

                <div className="entity-card__aside">
                  <Button variant="ghost" onClick={() => openEditModal(product)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={busyId === product._id}
                    onClick={() => handleDuplicate(product)}
                  >
                    Duplicate
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
            No products match the current filters. Try switching the status or stock view.
          </div>
        )}
      </div>

      <Modal isOpen={Boolean(editingProduct)} title="Edit Product" onClose={closeEditModal}>
        <form
          className="stack-list"
          onSubmit={async (event) => {
            event.preventDefault();

            try {
              await productService.updateProduct(editingProduct._id, buildProductPayload(form));
              closeEditModal();
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
              required
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            />
            <Input
              label="Brand"
              required
              value={form.brand}
              onChange={(event) => setForm((current) => ({ ...current, brand: event.target.value }))}
            />
          </div>

          <div className="grid-two">
            <Input
              label="Category"
              required
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
              label="Cost Price"
              type="number"
              value={form.costPrice}
              onChange={(event) =>
                setForm((current) => ({ ...current, costPrice: event.target.value }))
              }
            />
          </div>

          <div className="grid-three">
            <Input
              label="SKU"
              value={form.sku}
              onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value }))}
            />
            <Input
              label="Stock"
              type="number"
              value={form.stock}
              onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))}
            />
            <Input
              label="Low Stock Threshold"
              type="number"
              value={form.lowStockThreshold}
              onChange={(event) =>
                setForm((current) => ({ ...current, lowStockThreshold: event.target.value }))
              }
            />
          </div>

          <div className="grid-two">
            <Input
              label="Listing status"
              as="select"
              options={EDIT_STATUS_OPTIONS}
              value={form.status}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
            />
            <label className="field">
              <span className="field-label">Merchandising</span>
              <span className="checkbox-row field-input field-input--checkbox">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, isFeatured: event.target.checked }))
                  }
                />
                <span>Feature this product on the storefront</span>
              </span>
            </label>
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

          {modalError ? <div className="alert alert-error">{modalError}</div> : null}

          <div className="inline-actions">
            <Button type="submit">Save Changes</Button>
            <Button type="button" variant="ghost" onClick={closeEditModal}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default ManageProducts;
