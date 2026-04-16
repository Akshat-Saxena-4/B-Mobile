import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FiBarChart2, FiTrash2, FiX } from 'react-icons/fi';
import Button from '../common/Button.jsx';
import SafeImg from '../common/SafeImg.jsx';
import { useExperience } from '../../hooks/useExperience.js';
import { clearCompare, removeCompareItem } from '../../store/slices/experienceSlice.js';

const CompareDock = () => {
  const dispatch = useDispatch();
  const { compare } = useExperience();

  return (
    <AnimatePresence>
      {compare.length ? (
        <motion.aside
          className="compare-dock"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 32 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="compare-dock__copy">
            <p className="eyebrow">Compare</p>
            <h3>{compare.length} devices pinned</h3>
            <p className="muted-text">
              Stack specs, pricing, and ratings before you move anything into the cart.
            </p>
          </div>

          <div className="compare-dock__rail" role="list" aria-label="Pinned comparison devices">
            {compare.map((product) => (
              <div key={product._id} className="compare-dock__item" role="listitem">
                <div className="compare-dock__thumb">
                  <SafeImg src={product.thumbnail || product.images?.[0]} alt={product.title} decoding="async" />
                </div>
                <div className="compare-dock__meta">
                  <strong>{product.title}</strong>
                  <span>{product.brand}</span>
                </div>
                <button
                  type="button"
                  className="compare-dock__remove"
                  aria-label={`Remove ${product.title} from compare`}
                  onClick={() => dispatch(removeCompareItem(product._id))}
                >
                  <FiX />
                </button>
              </div>
            ))}
          </div>

          <div className="compare-dock__actions">
            <Link to="/compare">
              <Button size="sm">
                <FiBarChart2 />
                Open compare
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => dispatch(clearCompare())}>
              <FiTrash2 />
              Clear
            </Button>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
};

export default CompareDock;
