import Button from '../common/Button.jsx';
import Input from '../common/Input.jsx';
import { DEVICE_CATEGORY_OPTIONS } from '../../utils/constants.js';

const ProductFilter = ({
  searchValue,
  onSearchChange,
  filters,
  onChange,
  onReset,
  id = 'catalog-filters',
}) => (
  <div className="filter-panel catalog-filter-panel" id={id}>
    <div className="catalog-filter-section">
      <p className="catalog-filter-heading">Search</p>
      <Input
        label={null}
        placeholder="Model, brand, category..."
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        autoComplete="off"
        aria-label="Search catalog"
      />
    </div>

    <div className="catalog-filter-section">
      <p className="catalog-filter-heading">Category</p>
      <Input
        label="Device category"
        as="select"
        options={DEVICE_CATEGORY_OPTIONS}
        value={filters.category || ''}
        onChange={(event) => onChange('category', event.target.value)}
      />
    </div>

    <div className="catalog-filter-section">
      <p className="catalog-filter-heading">Refine</p>
      <div className="filter-grid catalog-filter-grid">
        <Input
          label="Segment"
          placeholder="Flagship, Student, Gaming..."
          value={filters.subcategory || ''}
          onChange={(event) => onChange('subcategory', event.target.value)}
        />
        <Input
          label="Brand"
          placeholder="Apple, Samsung, Lenovo..."
          value={filters.brand || ''}
          onChange={(event) => onChange('brand', event.target.value)}
        />
      </div>
    </div>

    <div className="catalog-filter-section">
      <p className="catalog-filter-heading">Price (INR)</p>
      <div className="filter-grid catalog-filter-grid catalog-filter-grid--price">
        <Input
          label="Min"
          type="number"
          placeholder="0"
          min={0}
          value={filters.minPrice || ''}
          onChange={(event) => onChange('minPrice', event.target.value)}
        />
        <Input
          label="Max"
          type="number"
          placeholder="250000"
          min={0}
          value={filters.maxPrice || ''}
          onChange={(event) => onChange('maxPrice', event.target.value)}
        />
      </div>
    </div>

    <div className="filter-actions catalog-filter-actions">
      <Button type="button" variant="ghost" onClick={onReset}>
        Clear all filters
      </Button>
    </div>
  </div>
);

export default ProductFilter;
