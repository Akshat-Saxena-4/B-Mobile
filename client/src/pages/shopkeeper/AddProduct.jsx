import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import SafeImg from '../../components/common/SafeImg.jsx';
import productService from '../../services/productService.js';
import formatCurrency from '../../utils/formatCurrency.js';
import { buildProductPayload, createProductFormState } from '../../utils/productForm.js';

const STATUS_OPTIONS = [
  { value: 'PUBLISHED', label: 'Publish now' },
  { value: 'DRAFT', label: 'Save as draft' },
];

const AddProduct = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(createProductFormState());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const preview = useMemo(() => {
    const previewImage = form.images
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)[0];
    const price = Number(form.price || 0);
    const compareAtPrice = Number(form.compareAtPrice || 0);
    const costPrice = Number(form.costPrice || 0);
    const margin = price > 0 && costPrice > 0 ? (((price - costPrice) / price) * 100).toFixed(1) : null;
    const savings =
      compareAtPrice > price && compareAtPrice > 0
        ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
        : 0;

    return {
      image: previewImage,
      price,
      compareAtPrice,
      margin,
      savings,
    };
  }, [form.compareAtPrice, form.costPrice, form.images, form.price]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await productService.createProduct(buildProductPayload(form));
      navigate('/seller/products');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to create product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      role="SHOPKEEPER"
      title="Launch a new product"
      description="Create polished listings with better pricing context, richer structure, and a live preview before you publish."
    >
      <div className="dashboard-two-up">
        <form className="surface-card stack-list" onSubmit={handleSubmit}>
          <div className="grid-two">
            <Input
              label="Product Title"
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

          <div className="grid-three">
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
            <Input
              label="Publishing mode"
              as="select"
              options={STATUS_OPTIONS}
              value={form.status}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
            />
          </div>

          <Input
            label="Short Description"
            required
            value={form.shortDescription}
            onChange={(event) =>
              setForm((current) => ({ ...current, shortDescription: event.target.value }))
            }
          />
          <Input
            label="Description"
            as="textarea"
            rows="5"
            required
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
          />

          <div className="grid-three">
            <Input
              label="Price"
              type="number"
              required
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
              required
              value={form.sku}
              onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value }))}
            />
            <Input
              label="Stock"
              type="number"
              required
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

          <Input
            label="Image URLs"
            as="textarea"
            rows="4"
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

          <div className="toggle-row">
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(event) =>
                  setForm((current) => ({ ...current, isFeatured: event.target.checked }))
                }
              />
              <span>Feature this product on the homepage</span>
            </label>
          </div>

          {error ? <div className="alert alert-error">{error}</div> : null}
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving listing...' : form.status === 'DRAFT' ? 'Save Draft' : 'Publish Product'}
          </Button>
        </form>

        <div className="stack-list">
          <article className="surface-card preview-card">
            <p className="eyebrow">Live preview</p>
            <div className="preview-card__media">
              <SafeImg src={preview.image} alt={form.title || 'Product preview'} decoding="async" />
              <div className="preview-card__overlay">
                <strong>{preview.price ? formatCurrency(preview.price) : 'Set a selling price'}</strong>
                {preview.compareAtPrice ? <span>{formatCurrency(preview.compareAtPrice)}</span> : null}
              </div>
            </div>
            <div className="stack-list">
              <div>
                <h3>{form.title || 'Your listing title will appear here'}</h3>
                <p className="muted-text">{form.shortDescription || 'Short description for card previews and search results.'}</p>
              </div>
              <div className="data-points">
                {form.brand ? <span className="meta-chip">{form.brand}</span> : null}
                {form.category ? <span className="meta-chip">{form.category}</span> : null}
                {form.subcategory ? <span className="meta-chip">{form.subcategory}</span> : null}
                {form.isFeatured ? <span className="status-tag status-tag--info">Featured</span> : null}
              </div>
            </div>
          </article>

          <article className="surface-card">
            <p className="eyebrow">Launch checklist</p>
            <div className="info-list">
              <div className="info-item">
                <span>Inventory readiness</span>
                <strong>{form.stock || 0} units with alert at {form.lowStockThreshold || 0}</strong>
              </div>
              <div className="info-item">
                <span>Pricing angle</span>
                <strong>
                  {preview.savings > 0
                    ? `${preview.savings}% visible savings for customers`
                    : 'Add a compare-at price to show savings'}
                </strong>
              </div>
              <div className="info-item">
                <span>Margin signal</span>
                <strong>{preview.margin ? `${preview.margin}% gross margin` : 'Add cost price to estimate margin'}</strong>
              </div>
              <div className="info-item">
                <span>Publishing state</span>
                <strong>{form.status === 'DRAFT' ? 'This will be hidden until you publish it' : 'This will appear in the storefront once saved'}</strong>
              </div>
            </div>
          </article>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddProduct;
