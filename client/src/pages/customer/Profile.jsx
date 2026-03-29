import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import { updateProfile } from '../../store/slices/authSlice.js';
import { useAuth } from '../../hooks/useAuth.js';
import { ROLES } from '../../utils/constants.js';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useAuth();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    avatar: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    shopName: '',
    gstNumber: '',
    storeDescription: '',
  });

  useEffect(() => {
    if (!user) return;

    const address = user.addresses?.[0] || {};
    setForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      avatar: user.avatar || '',
      line1: address.line1 || '',
      line2: address.line2 || '',
      city: address.city || '',
      state: address.state || '',
      postalCode: address.postalCode || '',
      country: address.country || 'India',
      shopName: user.sellerProfile?.shopName || '',
      gstNumber: user.sellerProfile?.gstNumber || '',
      storeDescription: user.sellerProfile?.storeDescription || '',
    });
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaved(false);

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

    await dispatch(updateProfile(payload));
    setSaved(true);
  };

  return (
    <section className="container page-stack">
      <div className="section-header">
        <div>
          <p className="eyebrow">Profile</p>
          <h1>Manage identity, address, and business details.</h1>
        </div>
      </div>

      <form className="surface-card stack-list" onSubmit={handleSubmit}>
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

        {user?.role === ROLES.SHOPKEEPER ? (
          <>
            <div className="divider" />
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
          </>
        ) : null}

        {saved ? <div className="alert alert-success">Profile updated successfully.</div> : null}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </section>
  );
};

export default Profile;

