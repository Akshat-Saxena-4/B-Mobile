import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import { clearAuthError, loginUser } from '../../store/slices/authSlice.js';
import { useAuth } from '../../hooks/useAuth.js';
import { ROLES } from '../../utils/constants.js';

const Login = () => {
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
    await dispatch(loginUser(form));
  };

  return (
    <section className="auth-shell container">
      <div className="auth-panel auth-aside">
        <p className="eyebrow">Access Everything</p>
        <h1>Sign in to manage shopping, selling, and operations from one place.</h1>
        <p className="section-copy">
          Customers can track orders and save favorites. Shopkeepers manage inventory and sales.
          Admins oversee approvals, performance, and catalog quality.
        </p>
      </div>

      <form className="auth-panel auth-form" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">Welcome Back</p>
          <h2>Login</h2>
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
          {isLoading ? 'Signing in...' : 'Login'}
        </Button>
        <p className="muted-text">
          Need an account? <Link to="/register">Create one</Link>
        </p>
      </form>
    </section>
  );
};

export default Login;

