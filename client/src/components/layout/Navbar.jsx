import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiHeart, FiMenu, FiSearch, FiShoppingBag, FiUser, FiX } from 'react-icons/fi';
import Button from '../common/Button.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useCart } from '../../hooks/useCart.js';
import { ROLES } from '../../utils/constants.js';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { summary } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [search, setSearch] = useState('');

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
        <Link to="/" className="brand-mark">
          <span className="brand-badge">V</span>
          <div>
            <strong>Velora</strong>
            <span>Premium Commerce</span>
          </div>
        </Link>

        <form className="search-shell desktop-only" onSubmit={handleSearch}>
          <FiSearch />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search premium products, brands, collections"
          />
        </form>

        <nav className="desktop-nav desktop-only">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/products">Explore</NavLink>
          {user?.role === ROLES.SHOPKEEPER ? <NavLink to="/seller/dashboard">Seller</NavLink> : null}
          {user?.role === ROLES.ADMIN ? <NavLink to="/admin/dashboard">Admin</NavLink> : null}
        </nav>

        <div className="nav-actions">
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
            {user?.role === ROLES.SHOPKEEPER ? (
              <NavLink onClick={() => setIsMenuOpen(false)} to="/seller/dashboard">
                Seller Dashboard
              </NavLink>
            ) : null}
            {user?.role === ROLES.ADMIN ? (
              <NavLink onClick={() => setIsMenuOpen(false)} to="/admin/dashboard">
                Admin Dashboard
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

