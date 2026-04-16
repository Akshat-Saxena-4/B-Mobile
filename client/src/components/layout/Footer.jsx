import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="site-footer">
    <div className="container footer-grid footer-grid--upgraded">
      <div className="footer-copy">
        <p className="eyebrow">B-mobile</p>
        <h3>Built to feel like a premium device marketplace, not a generic storefront.</h3>
        <p>
          Discover phones, tablets, and laptops with comparison tools, delivery estimates, finance planning,
          and a smoother buying flow before payment is ever involved.
        </p>
      </div>

      <div className="footer-links">
        <div>
          <p className="footer-links__title">Shop</p>
          <Link to="/products?category=Smartphones">Phones</Link>
          <Link to="/products?category=Tablets">Tablets</Link>
          <Link to="/products?category=Laptops">Laptops</Link>
        </div>
        <div>
          <p className="footer-links__title">Tools</p>
          <Link to="/compare">Compare board</Link>
          <Link to="/wishlist">Wishlist</Link>
          <Link to="/cart">Cart</Link>
        </div>
        <div>
          <p className="footer-links__title">Platform</p>
          <Link to="/register">Create account</Link>
          <Link to="/seller">Seller Studio</Link>
          <Link to="/admin">Admin Panel</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
