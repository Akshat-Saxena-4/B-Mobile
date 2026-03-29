import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import productService from '../../services/productService.js';
import { buildProductPayload, createProductFormState } from '../../utils/productForm.js';

const AddProduct = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(createProductFormState());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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
      description="Use concise merchandising copy, clear imagery, and structured specifications."
    >
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
          {submitting ? 'Publishing...' : 'Publish Product'}
        </Button>
      </form>
    </DashboardLayout>
  );
};

export default AddProduct;

