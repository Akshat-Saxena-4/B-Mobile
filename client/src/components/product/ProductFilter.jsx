import Button from '../common/Button.jsx';
import Input from '../common/Input.jsx';

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'priceAsc', label: 'Price: Low to High' },
  { value: 'priceDesc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

const ProductFilter = ({ filters, onChange, onReset }) => (
  <div className="filter-panel">
    <Input
      label="Search"
      placeholder="Brand, product, category"
      value={filters.search || ''}
      onChange={(event) => onChange('search', event.target.value)}
    />
    <div className="filter-grid">
      <Input
        label="Category"
        placeholder="Electronics"
        value={filters.category || ''}
        onChange={(event) => onChange('category', event.target.value)}
      />
      <Input
        label="Brand"
        placeholder="Apple"
        value={filters.brand || ''}
        onChange={(event) => onChange('brand', event.target.value)}
      />
      <Input
        label="Min Price"
        type="number"
        placeholder="500"
        value={filters.minPrice || ''}
        onChange={(event) => onChange('minPrice', event.target.value)}
      />
      <Input
        label="Max Price"
        type="number"
        placeholder="10000"
        value={filters.maxPrice || ''}
        onChange={(event) => onChange('maxPrice', event.target.value)}
      />
      <Input
        label="Sort"
        as="select"
        options={sortOptions}
        value={filters.sort || 'featured'}
        onChange={(event) => onChange('sort', event.target.value)}
      />
    </div>
    <div className="filter-actions">
      <Button variant="ghost" onClick={onReset}>
        Reset
      </Button>
    </div>
  </div>
);

export default ProductFilter;

