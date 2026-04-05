import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard.jsx';
import Button from '../common/Button.jsx';
import { stagger } from '../../utils/motion.js';

const ProductList = ({
  products,
  gridClassName = '',
  onEmptyReset,
  showImagePriceOverlay = true,
  ...cardProps
}) => {
  if (!products?.length) {
    return (
      <div className="catalog-empty">
        <div className="catalog-empty__card surface-card">
          <p className="eyebrow">No matches</p>
          <h2>Try another segment, brand, or price band.</h2>
          <p className="section-copy">
            Presets and chips update the query instantly. Widen your price range or clear filters to see
            more devices.
          </p>
          <div className="catalog-empty__actions">
            {onEmptyReset ? (
              <Button type="button" onClick={onEmptyReset}>
                Clear all filters
              </Button>
            ) : null}
            <Link to="/">
              <Button variant="ghost">Back to home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`product-grid ${gridClassName}`.trim()}
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          showImagePriceOverlay={showImagePriceOverlay}
          {...cardProps}
        />
      ))}
    </motion.div>
  );
};

export default ProductList;
