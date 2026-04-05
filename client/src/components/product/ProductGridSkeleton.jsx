const ProductGridSkeleton = ({ count = 8, gridClassName = '' }) => (
  <div className={`product-grid product-grid--skeleton ${gridClassName}`.trim()} aria-hidden>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="product-skeleton-card">
        <div className="product-skeleton-card__shine" />
        <div className="product-skeleton-card__media" />
        <div className="product-skeleton-card__body">
          <div className="product-skeleton-card__line product-skeleton-card__line--short" />
          <div className="product-skeleton-card__line" />
          <div className="product-skeleton-card__line product-skeleton-card__line--mid" />
          <div className="product-skeleton-card__price" />
        </div>
      </div>
    ))}
  </div>
);

export default ProductGridSkeleton;
