import { motion } from 'framer-motion';
import ProductCard from './ProductCard.jsx';
import { stagger } from '../../utils/motion.js';

const ProductList = ({ products, ...cardProps }) => {
  if (!products?.length) {
    return <div className="empty-state">No products matched your filters.</div>;
  }

  return (
    <motion.div className="product-grid" variants={stagger} initial="hidden" animate="visible">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} {...cardProps} />
      ))}
    </motion.div>
  );
};

export default ProductList;

