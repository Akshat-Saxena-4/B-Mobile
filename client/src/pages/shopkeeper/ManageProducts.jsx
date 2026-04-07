import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Modal from '../../components/common/Modal.jsx';
import productService from '../../services/productService.js';
import formatCurrency from '../../utils/formatCurrency.js';
import SafeImg from '../../components/common/SafeImg.jsx';
import { buildProductPayload, createProductFormState } from '../../utils/productForm.js';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(createProductFormState());

  const loadProducts = async () => {
    const response = await productService.getSellerProducts();
    setProducts(response);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <DashboardLayout
      role="SHOPKEEPER"
      title="Manage product catalog"
      description="Adjust inventory, merchandising, and listing visibility as your storefront evolves."
    >
      <div className="stack-list">
        {products.map((product) => (
          <article key={product._id} className="surface-card product-admin-row product-admin-row--thumb">
            <div className="admin-product-thumb">
              <SafeImg
                src={product.thumbnail || product.images?.[0]}
                alt=""
                decoding="async"
              />
              <span className="admin-product-thumb__price">{formatCurrency(product.price)}</span>
            </div>
            <div>
              <p className="eyebrow">{product.status}</p>
              <h3>{product.title}</h3>
              <p className="muted-text">Stock {product.inventory?.stock}</p>
            </div>
            <div className="inline-actions">
              <Button
                variant="ghost"
                onClick={() => {
                  setEditingProduct(product);
                  setForm(createProductFormState(product));
                }}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                onClick={async () => {
                  await productService.deleteProduct(product._id);
                  loadProducts();
                }}
              >
                Archive
              </Button>
            </div>
          </article>
        ))}
      </div>

      <Modal isOpen={Boolean(editingProduct)} title="Edit Product" onClose={() => setEditingProduct(null)}>
        <form
          className="stack-list"
          onSubmit={async (event) => {
            event.preventDefault();
            await productService.updateProduct(editingProduct._id, buildProductPayload(form));
            setEditingProduct(null);
            loadProducts();
          }}
        >
          <Input
            label="Title"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          />
          <Input
            label="Short Description"
            value={form.shortDescription}
            onChange={(event) =>
              setForm((current) => ({ ...current, shortDescription: event.target.value }))
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
              label="Stock"
              type="number"
              value={form.stock}
              onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))}
            />
            <Input
              label="Status"
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
            rows="4"
            value={form.specifications}
            onChange={(event) =>
              setForm((current) => ({ ...current, specifications: event.target.value }))
            }
          />
          <Button type="submit">Save Changes</Button>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default ManageProducts;

