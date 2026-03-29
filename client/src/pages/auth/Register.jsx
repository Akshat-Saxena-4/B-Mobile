import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import { clearAuthError, registerUser } from '../../store/slices/authSlice.js';
import { useAuth } from '../../hooks/useAuth.js';
import { isStrongPassword, isValidEmail } from '../../utils/validators.js';
import { ROLES } from '../../utils/constants.js';

const roleOptions = [
  { value: ROLES.CUSTOMER, label: 'Customer' },
  { value: ROLES.SHOPKEEPER, label: 'Shopkeeper' },
];

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading, error } = useAuth();
  const [localError, setLocalError] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: ROLES.CUSTOMER,
    shopName: '',
    gstNumber: '',
    storeDescription: '',
  });

  useEffect(() => {
    if (!user) return;
    navigate(user.role === ROLES.SHOPKEEPER ? '/seller/dashboard' : '/', { replace: true });
  }, [navigate, user]);

  useEffect(() => () => dispatch(clearAuthError()), [dispatch]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isValidEmail(form.email)) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    if (!isStrongPassword(form.password)) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    setLocalError('');
    await dispatch(registerUser(form));
  };

  return (
    <section className="auth-shell container">
      <div className="auth-panel auth-aside">
        <p className="eyebrow">Build With Trust</p>
        <h1>Create a customer or seller account and step into a premium commerce experience.</h1>
        <p className="section-copy">
          Seller accounts are reviewed by admins before products go live, which keeps the
          marketplace curated and high quality.
        </p>
      </div>

      <form className="auth-panel auth-form" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">New Account</p>
          <h2>Register</h2>
        </div>

        <div className="grid-two">
          <Input
            label="First Name"
            required
            value={form.firstName}
            onChange={(event) =>
              setForm((current) => ({ ...current, firstName: event.target.value }))
            }
          />
          <Input
            label="Last Name"
            required
            value={form.lastName}
            onChange={(event) =>
              setForm((current) => ({ ...current, lastName: event.target.value }))
            }
          />
        </div>

        <Input
          label="Role"
          as="select"
          options={roleOptions}
          value={form.role}
          onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
        />
        <Input
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
        />
        <Input
          label="Phone"
          value={form.phone}
          onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
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

        {form.role === ROLES.SHOPKEEPER ? (
          <>
            <Input
              label="Shop Name"
              required
              value={form.shopName}
              onChange={(event) =>
                setForm((current) => ({ ...current, shopName: event.target.value }))
              }
            />
            <Input
              label="GST Number"
              value={form.gstNumber}
              onChange={(event) =>
                setForm((current) => ({ ...current, gstNumber: event.target.value }))
              }
            />
            <Input
              label="Store Description"
              as="textarea"
              rows="4"
              value={form.storeDescription}
              onChange={(event) =>
                setForm((current) => ({ ...current, storeDescription: event.target.value }))
              }
            />
          </>
        ) : null}

        {localError || error ? (
          <div className="alert alert-error">{localError || error}</div>
        ) : null}

        <Button type="submit" fullWidth disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Create Account'}
        </Button>
        <p className="muted-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </section>
  );
};

export default Register;

