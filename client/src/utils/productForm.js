export const createProductFormState = (product = {}) => ({
  title: product.title || '',
  brand: product.brand || '',
  category: product.category || '',
  subcategory: product.subcategory || '',
  shortDescription: product.shortDescription || '',
  description: product.description || '',
  price: product.price || '',
  compareAtPrice: product.compareAtPrice || '',
  costPrice: product.costPrice || '',
  sku: product.inventory?.sku || '',
  stock: product.inventory?.stock || '',
  lowStockThreshold: product.inventory?.lowStockThreshold || 10,
  status: product.status || 'PUBLISHED',
  isFeatured: Boolean(product.isFeatured),
  images:
    product.images?.join(', ') ||
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
  specifications:
    product.specifications?.map((item) => `${item.label}: ${item.value}`).join('\n') ||
    'Material: Premium alloy\nWarranty: 1 year',
});

export const buildProductPayload = (form) => ({
  title: form.title,
  brand: form.brand,
  category: form.category,
  subcategory: form.subcategory,
  shortDescription: form.shortDescription,
  description: form.description,
  price: Number(form.price),
  compareAtPrice: Number(form.compareAtPrice || 0),
  costPrice: Number(form.costPrice || 0),
  sku: form.sku,
  stock: Number(form.stock),
  lowStockThreshold: Number(form.lowStockThreshold || 10),
  status: form.status,
  isFeatured: Boolean(form.isFeatured),
  images: form.images
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean),
  specifications: form.specifications
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...valueParts] = line.split(':');
      return {
        label: label.trim(),
        value: valueParts.join(':').trim(),
      };
    })
    .filter((item) => item.label && item.value),
});
