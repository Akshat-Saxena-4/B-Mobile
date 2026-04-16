import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  FiBarChart2,
  FiHeart,
  FiMenu,
  FiSearch,
  FiShoppingBag,
  FiUser,
  FiX,
} from 'react-icons/fi';
import Button from '../common/Button.jsx';
import BMobileLogo from './BMobileLogo.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useCart } from '../../hooks/useCart.js';
import { useExperience } from '../../hooks/useExperience.js';
import { ROLES } from '../../utils/constants.js';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { summary } = useCart();
  const { compare } = useExperience();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [search, setSearch] = useState('');

  const dashboardLink =
    user?.role === ROLES.ADMIN
      ? { path: '/admin', label: 'Admin Panel' }
      : user?.role === ROLES.SHOPKEEPER
        ? { path: '/seller', label: 'Seller Studio' }
        : null;

  const handleSearch = (event) => {
    event.preventDefault();
    navigate(`/products${search ? `?search=${encodeURIComponent(search)}` : ''}`);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="site-header">
      <div className="container navbar">
        <Link to="/" className="brand-mark" aria-label="B-mobile home">
          <BMobileLogo />
          <div className="brand-wordmark">
            <strong className="brand-name">B-mobile</strong>
            <span className="brand-tagline">Phones, tablets, laptops</span>
          </div>
        </Link>

        <form className="search-shell desktop-only" onSubmit={handleSearch}>
          <FiSearch />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search phones, tablets, laptops..."
          />
        </form>

        <nav className="desktop-nav desktop-only">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/products">Explore</NavLink>
          <NavLink to="/compare">Compare</NavLink>
          {dashboardLink ? <NavLink to={dashboardLink.path}>{dashboardLink.label}</NavLink> : null}
        </nav>

        <div className="nav-actions">
          <NavLink to="/compare" className="icon-button cart-badge" aria-label="Compare devices">
            <FiBarChart2 />
            {compare.length ? <span>{compare.length}</span> : null}
          </NavLink>

          {user?.role === ROLES.CUSTOMER ? (
            <>
              <NavLink to="/wishlist" className="icon-button desktop-only" aria-label="Wishlist">
                <FiHeart />
              </NavLink>
              <NavLink to="/cart" className="icon-button cart-badge" aria-label="Cart">
                <FiShoppingBag />
                {summary.count ? <span>{summary.count}</span> : null}
              </NavLink>
            </>
          ) : null}

          {isAuthenticated ? (
            <div className="desktop-only profile-chip">
              <NavLink to="/profile" className="profile-link">
                <FiUser />
                <span>{user?.firstName}</span>
              </NavLink>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="desktop-only auth-actions">
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/admin/login">Admin Panel</NavLink>
              <Button size="sm" onClick={() => navigate('/register')}>
                Join Now
              </Button>
            </div>
          )}

          <button
            type="button"
            className="icon-button mobile-menu-button"
            onClick={() => setIsMenuOpen((value) => !value)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <div className="mobile-drawer">
          <form className="search-shell" onSubmit={handleSearch}>
            <FiSearch />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products"
            />
          </form>
          <div className="mobile-links">
            <NavLink onClick={() => setIsMenuOpen(false)} to="/">
              Home
            </NavLink>
            <NavLink onClick={() => setIsMenuOpen(false)} to="/products">
              Explore
            </NavLink>
            <NavLink onClick={() => setIsMenuOpen(false)} to="/compare">
              Compare
            </NavLink>
            {user?.role === ROLES.CUSTOMER ? (
              <>
                <NavLink onClick={() => setIsMenuOpen(false)} to="/wishlist">
                  Wishlist
                </NavLink>
                <NavLink onClick={() => setIsMenuOpen(false)} to="/cart">
                  Cart
                </NavLink>
                <NavLink onClick={() => setIsMenuOpen(false)} to="/orders">
                  Orders
                </NavLink>
              </>
            ) : null}
            {dashboardLink ? (
              <NavLink onClick={() => setIsMenuOpen(false)} to={dashboardLink.path}>
                {dashboardLink.label}
              </NavLink>
            ) : null}
            {isAuthenticated ? (
              <>
                <NavLink onClick={() => setIsMenuOpen(false)} to="/profile">
                  Profile
                </NavLink>
                <button type="button" className="mobile-link-button" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink onClick={() => setIsMenuOpen(false)} to="/login">
                  Login
                </NavLink>
                <NavLink onClick={() => setIsMenuOpen(false)} to="/admin/login">
                  Admin Panel
                </NavLink>
                <NavLink onClick={() => setIsMenuOpen(false)} to="/register">
                  Register
                </NavLink>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default Navbar;
