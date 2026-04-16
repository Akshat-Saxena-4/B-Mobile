import { FiBarChart2, FiGrid, FiLayout } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { CATALOG_SORT_OPTIONS } from '../../utils/constants.js';

const CatalogToolbar = ({
  total = 0,
  page = 1,
  limit = 12,
  sort,
  onSortChange,
  gridDensity,
  onGridDensityChange,
  isLoading,
  compareCount = 0,
}) => {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="catalog-toolbar">
      <div className="catalog-toolbar__primary">
        <p className="catalog-toolbar__meta" aria-live="polite">
          {isLoading ? (
            <span className="catalog-toolbar__loading">Refreshing results...</span>
          ) : (
            <>
              <strong>{total === 0 ? 'No matches' : `${from}-${to}`}</strong>
              <span className="catalog-toolbar__meta-muted">
                {total === 0 ? '' : ` of ${total} products`}
              </span>
            </>
          )}
        </p>

        <div className="catalog-toolbar__secondary">
          <Link to="/compare" className={`catalog-compare-pill${compareCount ? ' is-active' : ''}`}>
            <FiBarChart2 aria-hidden />
            <span>Compare {compareCount ? `(${compareCount})` : ''}</span>
          </Link>

          <div className="catalog-view-toggle" role="group" aria-label="Grid density">
            <button
              type="button"
              className={`view-toggle-btn${gridDensity === 'comfortable' ? ' is-active' : ''}`}
              onClick={() => onGridDensityChange('comfortable')}
              aria-pressed={gridDensity === 'comfortable'}
              title="Comfortable grid"
            >
              <FiLayout aria-hidden />
              <span>Comfort</span>
            </button>
            <button
              type="button"
              className={`view-toggle-btn${gridDensity === 'compact' ? ' is-active' : ''}`}
              onClick={() => onGridDensityChange('compact')}
              aria-pressed={gridDensity === 'compact'}
              title="Dense grid"
            >
              <FiGrid aria-hidden />
              <span>Dense</span>
            </button>
          </div>
        </div>
      </div>

      <div className="catalog-sort-pills" role="tablist" aria-label="Sort products">
        {CATALOG_SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={sort === opt.value}
            className={`sort-pill${sort === opt.value ? ' is-active' : ''}`}
            onClick={() => onSortChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CatalogToolbar;
