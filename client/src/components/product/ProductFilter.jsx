import Button from '../common/Button.jsx';
import Input from '../common/Input.jsx';

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
        placeholder="Model, brand, category…"
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        autoComplete="off"
        aria-label="Search catalog"
      />
    </div>

    <div className="catalog-filter-section">
      <p className="catalog-filter-heading">Refine</p>
      <div className="filter-grid catalog-filter-grid">
        <Input
          label="Category"
          placeholder="e.g. Smartphones"
          value={filters.category || ''}
          onChange={(event) => onChange('category', event.target.value)}
        />
        <Input
          label="Subcategory"
          placeholder="Flagship, Mid-Range…"
          value={filters.subcategory || ''}
          onChange={(event) => onChange('subcategory', event.target.value)}
        />
        <Input
          label="Brand"
          placeholder="Apple, Samsung…"
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
          placeholder="200000"
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
