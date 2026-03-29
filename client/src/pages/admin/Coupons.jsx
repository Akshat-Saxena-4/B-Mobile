import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import couponService from '../../services/couponService.js';
import { COUPON_TYPE_OPTIONS } from '../../utils/constants.js';

const initialForm = {
  code: '',
  description: '',
  discountType: 'PERCENTAGE',
  amount: 10,
  minOrderValue: 0,
  maxDiscount: 500,
  usageLimit: 100,
  startsAt: new Date().toISOString().slice(0, 10),
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  isActive: true,
};

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState(initialForm);

  const loadCoupons = async () => {
    const response = await couponService.getCoupons();
    setCoupons(response);
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  return (
    <DashboardLayout
      role="ADMIN"
      title="Manage promotions"
      description="Launch timed discounts, control thresholds, and keep offer usage within limits."
    >
      <form
        className="surface-card stack-list"
        onSubmit={async (event) => {
          event.preventDefault();
          const payload = {
            ...form,
            startsAt: new Date(form.startsAt),
            expiresAt: new Date(form.expiresAt),
          };

          if (editingId) {
            await couponService.updateCoupon(editingId, payload);
          } else {
            await couponService.createCoupon(payload);
          }

          setEditingId('');
          setForm(initialForm);
          loadCoupons();
        }}
      >
        <div className="grid-two">
          <Input
            label="Coupon Code"
            value={form.code}
            onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
          />
          <Input
            label="Description"
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
          />
        </div>

        <div className="grid-three">
          <Input
            label="Discount Type"
            as="select"
            options={COUPON_TYPE_OPTIONS}
            value={form.discountType}
            onChange={(event) =>
              setForm((current) => ({ ...current, discountType: event.target.value }))
            }
          />
          <Input
            label="Amount"
            type="number"
            value={form.amount}
            onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
          />
          <Input
            label="Min Order Value"
            type="number"
            value={form.minOrderValue}
            onChange={(event) =>
              setForm((current) => ({ ...current, minOrderValue: event.target.value }))
            }
          />
        </div>

        <div className="grid-three">
          <Input
            label="Max Discount"
            type="number"
            value={form.maxDiscount}
            onChange={(event) =>
              setForm((current) => ({ ...current, maxDiscount: event.target.value }))
            }
          />
          <Input
            label="Usage Limit"
            type="number"
            value={form.usageLimit}
            onChange={(event) =>
              setForm((current) => ({ ...current, usageLimit: event.target.value }))
            }
          />
          <Input
            label="Starts At"
            type="date"
            value={form.startsAt}
            onChange={(event) => setForm((current) => ({ ...current, startsAt: event.target.value }))}
          />
        </div>

        <Input
          label="Expires At"
          type="date"
          value={form.expiresAt}
          onChange={(event) => setForm((current) => ({ ...current, expiresAt: event.target.value }))}
        />

        <div className="inline-actions">
          <Button type="submit">{editingId ? 'Update Coupon' : 'Create Coupon'}</Button>
          {editingId ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setEditingId('');
                setForm(initialForm);
              }}
            >
              Cancel Edit
            </Button>
          ) : null}
        </div>
      </form>

      <div className="stack-list">
        {coupons.map((coupon) => (
          <article key={coupon._id} className="surface-card product-admin-row">
            <div>
              <p className="eyebrow">{coupon.discountType}</p>
              <h3>{coupon.code}</h3>
              <p className="muted-text">
                {coupon.description} • Used {coupon.usedCount}/{coupon.usageLimit || '∞'}
              </p>
            </div>
            <div className="inline-actions wrap-actions">
              <Button
                variant="ghost"
                onClick={() => {
                  setEditingId(coupon._id);
                  setForm({
                    code: coupon.code,
                    description: coupon.description,
                    discountType: coupon.discountType,
                    amount: coupon.amount,
                    minOrderValue: coupon.minOrderValue,
                    maxDiscount: coupon.maxDiscount,
                    usageLimit: coupon.usageLimit,
                    startsAt: new Date(coupon.startsAt).toISOString().slice(0, 10),
                    expiresAt: new Date(coupon.expiresAt).toISOString().slice(0, 10),
                    isActive: coupon.isActive,
                  });
                }}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                onClick={async () => {
                  await couponService.deleteCoupon(coupon._id);
                  loadCoupons();
                }}
              >
                Delete
              </Button>
            </div>
          </article>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Coupons;
