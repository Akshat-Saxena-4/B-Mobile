import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import SafeImg from '../../components/common/SafeImg.jsx';
import { updateProfile } from '../../store/slices/authSlice.js';
import { useAuth } from '../../hooks/useAuth.js';
import { ROLES } from '../../utils/constants.js';
import { formatDate } from '../../utils/formatDate.js';
import formatCurrency from '../../utils/formatCurrency.js';

const buildFormFromUser = (user) => {
  const address = user?.addresses?.[0] || {};

  return {
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
    line1: address.line1 || '',
    line2: address.line2 || '',
    city: address.city || '',
    state: address.state || '',
    postalCode: address.postalCode || '',
    country: address.country || 'India',
    shopName: user?.sellerProfile?.shopName || '',
    gstNumber: user?.sellerProfile?.gstNumber || '',
    storeDescription: user?.sellerProfile?.storeDescription || '',
  };
};

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useAuth();
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [form, setForm] = useState(buildFormFromUser(null));

  useEffect(() => {
    if (!user) return;
    setForm(buildFormFromUser(user));
  }, [user]);

  const profileCompletion = useMemo(() => {
    const checks = [
      Boolean(form.firstName),
      Boolean(form.lastName),
      Boolean(form.phone),
      Boolean(form.line1),
      Boolean(form.city),
      Boolean(form.state),
      Boolean(form.postalCode),
    ];

    if (user?.role === ROLES.SHOPKEEPER) {
      checks.push(Boolean(form.shopName), Boolean(form.storeDescription));
    }

    const completed = checks.filter(Boolean).length;
    return Math.round((completed / checks.length) * 100);
  }, [form, user?.role]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaved(false);
    setSaveError('');

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      avatar: form.avatar,
      addresses: form.line1
        ? [
            {
              label: 'Primary',
              fullName: `${form.firstName} ${form.lastName}`.trim(),
              phone: form.phone,
              line1: form.line1,
              line2: form.line2,
              city: form.city,
              state: form.state,
              postalCode: form.postalCode,
              country: form.country,
              isDefault: true,
            },
          ]
        : [],
    };

    if (user?.role === ROLES.SHOPKEEPER) {
      payload.sellerProfile = {
        shopName: form.shopName,
        gstNumber: form.gstNumber,
        storeDescription: form.storeDescription,
      };
    }

    const result = await dispatch(updateProfile(payload));

    if (!result.error) {
      setSaved(true);
    } else {
      setSaveError(result.payload || 'Unable to update profile');
    }
  };

  return (
    <section className="container page-stack profile-page">
      <section className="surface-card console-hero console-hero--customer">
        <div>
          <p className="eyebrow">Profile</p>
          <h1>Identity, shipping, and account health in one place.</h1>
          <p className="section-copy">
            Keep your checkout details accurate, refresh your avatar, and maintain seller information if you run a storefront.
          </p>
        </div>
        <div className="console-hero__stats">
          <div className="console-stat">
            <span>Role</span>
            <strong>{user?.role || 'Guest'}</strong>
          </div>
          <div className="console-stat">
            <span>Profile completion</span>
            <strong>{profileCompletion}%</strong>
          </div>
          <div className="console-stat">
            <span>Orders</span>
            <strong>{user?.stats?.totalOrders || 0}</strong>
          </div>
          <div className="console-stat">
            <span>Total spent</span>
            <strong>{formatCurrency(user?.stats?.totalSpent || 0)}</strong>
          </div>
        </div>
      </section>

      <div className="dashboard-two-up">
        <article className="surface-card profile-summary-card">
          <p className="eyebrow">Account snapshot</p>
          <div className="profile-summary-card__media">
            <div className="profile-avatar-frame">
              <SafeImg src={form.avatar} alt={user?.fullName || 'Profile'} decoding="async" />
            </div>
            <div>
              <h3>{`${form.firstName} ${form.lastName}`.trim() || 'Your name'}</h3>
              <p className="muted-text">{user?.email || 'Email address not available'}</p>
            </div>
          </div>
          <div className="info-list">
            <div className="info-item">
              <span>Joined</span>
              <strong>{formatDate(user?.createdAt)}</strong>
            </div>
            <div className="info-item">
              <span>Default address</span>
              <strong>
                {[form.line1, form.city, form.state].filter(Boolean).join(', ') || 'Not set yet'}
              </strong>
            </div>
            {user?.role === ROLES.SHOPKEEPER ? (
              <div className="info-item">
                <span>Seller review</span>
                <strong>{user?.sellerProfile?.status || 'PENDING'}</strong>
              </div>
            ) : null}
          </div>
        </article>

        <article className="surface-card">
          <p className="eyebrow">Helpful notes</p>
          <div className="info-list">
            <div className="info-item">
              <span>Checkout readiness</span>
              <strong>{form.line1 && form.city ? 'Default shipping is ready to use' : 'Add an address for faster checkout'}</strong>
            </div>
            <div className="info-item">
              <span>Storefront details</span>
              <strong>
                {user?.role === ROLES.SHOPKEEPER
                  ? user?.sellerProfile?.status === 'APPROVED'
                    ? 'Your seller account is approved and can list products'
                    : 'Keep seller details updated while approval is pending'
                  : 'Customer account ready for wishlist, cart, and orders'}
              </strong>
            </div>
            <div className="info-item">
              <span>Avatar tip</span>
              <strong>Any public image URL works here for a quick profile refresh.</strong>
            </div>
          </div>
        </article>
      </div>

      <form className="profile-form stack-list" onSubmit={handleSubmit}>
        <div className="surface-card stack-list profile-form__card">
          <p className="profile-form__card-title">Personal</p>
          <div className="grid-two">
            <Input
              label="First Name"
              value={form.firstName}
              onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
            />
            <Input
              label="Last Name"
              value={form.lastName}
              onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))}
            />
          </div>
          <div className="grid-two">
            <Input
              label="Phone"
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
            />
            <Input
              label="Avatar URL"
              value={form.avatar}
              onChange={(event) => setForm((current) => ({ ...current, avatar: event.target.value }))}
            />
          </div>
        </div>

        <div className="surface-card stack-list profile-form__card">
          <p className="profile-form__card-title">Default shipping address</p>
          <Input
            label="Address Line 1"
            value={form.line1}
            onChange={(event) => setForm((current) => ({ ...current, line1: event.target.value }))}
          />
          <Input
            label="Address Line 2"
            value={form.line2}
            onChange={(event) => setForm((current) => ({ ...current, line2: event.target.value }))}
          />
          <div className="grid-two">
            <Input
              label="City"
              value={form.city}
              onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
            />
            <Input
              label="State"
              value={form.state}
              onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))}
            />
          </div>
          <div className="grid-two">
            <Input
              label="Postal Code"
              value={form.postalCode}
              onChange={(event) =>
                setForm((current) => ({ ...current, postalCode: event.target.value }))
              }
            />
            <Input
              label="Country"
              value={form.country}
              onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))}
            />
          </div>
        </div>

        {user?.role === ROLES.SHOPKEEPER ? (
          <div className="surface-card stack-list profile-form__card">
            <p className="profile-form__card-title">Seller profile</p>
            <Input
              label="Shop Name"
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
          </div>
        ) : null}

        <div className="profile-form__actions surface-card">
          {saved ? <div className="alert alert-success">Profile updated successfully.</div> : null}
          {saveError ? <div className="alert alert-error">{saveError}</div> : null}
          <div className="inline-actions">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save changes'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setForm(buildFormFromUser(user))}
            >
              Reset
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
};

export default Profile;
