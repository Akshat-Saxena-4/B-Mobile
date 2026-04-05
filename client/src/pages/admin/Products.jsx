import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/common/Button.jsx';
import productService from '../../services/productService.js';
import formatCurrency from '../../utils/formatCurrency.js';
import SafeImg from '../../components/common/SafeImg.jsx';

const Products = () => {
  const [products, setProducts] = useState([]);

  const loadProducts = async () => {
    const response = await productService.getAdminProducts({ sort: 'newest' });
    setProducts(response.data);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <DashboardLayout
      role="ADMIN"
      title="Monitor platform catalog"
      description="Review pricing, status, and seller inventory from one oversight layer."
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
              <p className="muted-text">{product.seller?.sellerProfile?.shopName || 'Seller'}</p>
            </div>
            <div className="inline-actions">
              <span className="meta-chip">Stock {product.inventory?.stock}</span>
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
    </DashboardLayout>
  );
};

export default Products;

