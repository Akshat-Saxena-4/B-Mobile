import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import { clearAuthError, loginUser } from '../../store/slices/authSlice.js';
import { useAuth } from '../../hooks/useAuth.js';
import { ROLES } from '../../utils/constants.js';

const Login = ({ adminOnly = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading, error } = useAuth();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (!user) return;

    const fallbackPath =
      user.role === ROLES.ADMIN
        ? '/admin/dashboard'
        : user.role === ROLES.SHOPKEEPER
          ? '/seller/dashboard'
          : '/';

    navigate(location.state?.from?.pathname || fallbackPath, { replace: true });
  }, [location.state, navigate, user]);

  useEffect(() => () => dispatch(clearAuthError()), [dispatch]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await dispatch(
      loginUser({
        ...form,
        ...(adminOnly ? { expectedRole: ROLES.ADMIN } : {}),
      })
    );
  };

  const eyebrow = adminOnly ? 'Restricted Access' : 'Access Everything';
  const title = adminOnly
    ? 'Sign in to the admin control center.'
    : 'Sign in to manage shopping, selling, and operations from one place.';
  const description = adminOnly
    ? 'This login is reserved for marketplace administrators managing approvals, performance, and catalog quality.'
    : 'Customers can track orders and save favorites. Shopkeepers manage inventory and sales. Admins oversee approvals, performance, and catalog quality.';
  const formEyebrow = adminOnly ? 'Admin Panel' : 'Welcome Back';
  const formTitle = adminOnly ? 'Admin Login' : 'Login';
  const submitLabel = isLoading
    ? 'Signing in...'
    : adminOnly
      ? 'Enter Admin Panel'
      : 'Login';

  return (
    <section className="auth-shell container">
      <div className="auth-panel auth-aside">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="section-copy">{description}</p>
      </div>

      <form className="auth-panel auth-form" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">{formEyebrow}</p>
          <h2>{formTitle}</h2>
        </div>
        <Input
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
        />
        <Input
          label="Password"
          type="password"
          required
          value={form.password}
          onChange={(event) =>
            setForm((current) => ({ ...current, password: event.target.value }))
          }
        />
        {error ? <div className="alert alert-error">{error}</div> : null}
        <Button type="submit" fullWidth disabled={isLoading}>
          {submitLabel}
        </Button>
        <p className="muted-text">
          {adminOnly ? (
            <>
              Not an admin? <Link to="/login">Use the standard login</Link>
            </>
          ) : (
            <>
              Need an account? <Link to="/register">Create one</Link>
            </>
          )}
        </p>
        {!adminOnly ? (
          <p className="muted-text">
            Admin team? <Link to="/admin/login">Use admin panel login</Link>
          </p>
        ) : null}
        {adminOnly ? (
          <p className="muted-text">
            New customers and sellers can still <Link to="/register">register here</Link>.
          </p>
        ) : null}
      </form>
    </section>
  );
};

export default Login;
