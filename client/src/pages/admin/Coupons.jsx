import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Loader from '../../components/common/Loader.jsx';
import couponService from '../../services/couponService.js';
import { COUPON_TYPE_OPTIONS } from '../../utils/constants.js';
import { downloadCsv } from '../../utils/exportCsv.js';
import { formatDate, formatDateRange } from '../../utils/formatDate.js';

const createInitialForm = () => ({
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
});

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All campaigns' },
  { value: 'ACTIVE', label: 'Active now' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'PAUSED', label: 'Paused' },
];

const getCouponState = (coupon) => {
  const now = Date.now();
  const start = new Date(coupon.startsAt).getTime();
  const end = new Date(coupon.expiresAt).getTime();

  if (!coupon.isActive) return 'PAUSED';
  if (start > now) return 'SCHEDULED';
  if (end < now) return 'EXPIRED';
  return 'ACTIVE';
};

const getCouponTone = (state) => {
  switch (state) {
    case 'ACTIVE':
      return 'status-tag--success';
    case 'SCHEDULED':
      return 'status-tag--info';
    case 'EXPIRED':
      return 'status-tag--muted';
    case 'PAUSED':
      return 'status-tag--warning';
    default:
      return 'status-tag--default';
  }
};

const buildCouponPayload = (coupon) => ({
  code: coupon.code,
  description: coupon.description,
  discountType: coupon.discountType,
  amount: coupon.amount,
  minOrderValue: coupon.minOrderValue,
  maxDiscount: coupon.maxDiscount,
  usageLimit: coupon.usageLimit,
  usedCount: coupon.usedCount,
  startsAt: new Date(coupon.startsAt),
  expiresAt: new Date(coupon.expiresAt),
  isActive: coupon.isActive,
});

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState(createInitialForm());
  const [filters, setFilters] = useState({
    search: '',
    status: 'ALL',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const deferredSearch = useDeferredValue(filters.search);

  const loadCoupons = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      const response = await couponService.getCoupons();
      setCoupons(response);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to fetch coupons');
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const filteredCoupons = useMemo(() => {
    const normalizedQuery = deferredSearch.trim().toLowerCase();

    return coupons.filter((coupon) => {
      const state = getCouponState(coupon);

      if (filters.status !== 'ALL' && state !== filters.status) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [coupon.code, coupon.description]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [coupons, deferredSearch, filters.status]);

  const metrics = useMemo(
    () => ({
      total: filteredCoupons.length,
      active: filteredCoupons.filter((coupon) => getCouponState(coupon) === 'ACTIVE').length,
      scheduled: filteredCoupons.filter((coupon) => getCouponState(coupon) === 'SCHEDULED').length,
      expired: filteredCoupons.filter((coupon) => getCouponState(coupon) === 'EXPIRED').length,
      usage: filteredCoupons.reduce((sum, coupon) => sum + (coupon.usedCount || 0), 0),
    }),
    [filteredCoupons]
  );

  const exportCoupons = () => {
    downloadCsv({
      filename: 'admin-coupons.csv',
      columns: [
        { label: 'Code', key: 'code' },
        { label: 'Description', key: 'description' },
        { label: 'Type', key: 'discountType' },
        { label: 'Amount', value: (coupon) => coupon.amount },
        { label: 'State', value: (coupon) => getCouponState(coupon) },
        { label: 'Used', value: (coupon) => coupon.usedCount || 0 },
        { label: 'Limit', value: (coupon) => coupon.usageLimit || 0 },
        { label: 'Window', value: (coupon) => formatDateRange(coupon.startsAt, coupon.expiresAt) },
      ],
      rows: filteredCoupons,
    });
  };

  if (loading) {
    return <Loader label="Loading coupons" />;
  }

  return (
    <DashboardLayout
      role="ADMIN"
      title="Manage promotions"
      description="Launch better campaigns, pause underperforming offers, and inspect coupon windows with clearer visual status."
      actions={
        <Button variant="ghost" onClick={exportCoupons} disabled={!filteredCoupons.length}>
          Export CSV
        </Button>
      }
    >
      <section className="surface-card console-hero console-hero--admin">
        <div>
          <p className="eyebrow">Promotion engine</p>
          <h3>Design campaigns with clearer timelines and better usage visibility.</h3>
          <p className="section-copy">
            Coupon creation, status filtering, and live campaign state now sit in one cleaner admin flow.
          </p>
        </div>
        <div className="console-hero__stats">
          <div className="console-stat">
            <span>Loaded campaigns</span>
            <strong>{metrics.total}</strong>
          </div>
          <div className="console-stat">
            <span>Active</span>
            <strong>{metrics.active}</strong>
          </div>
          <div className="console-stat">
            <span>Scheduled</span>
            <strong>{metrics.scheduled}</strong>
          </div>
          <div className="console-stat">
            <span>Total redemptions</span>
            <strong>{metrics.usage}</strong>
          </div>
        </div>
      </section>

      {message ? <div className="alert alert-success">{message}</div> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="dashboard-two-up">
        <form
          className="surface-card stack-list"
          onSubmit={async (event) => {
            event.preventDefault();
            const payload = {
              ...form,
              code: form.code.trim().toUpperCase(),
              startsAt: new Date(form.startsAt),
              expiresAt: new Date(form.expiresAt),
            };

            try {
              if (editingId) {
                await couponService.updateCoupon(editingId, payload);
                setMessage('Coupon updated successfully');
              } else {
                await couponService.createCoupon(payload);
                setMessage('Coupon created successfully');
              }

              setEditingId('');
              setForm(createInitialForm());
              await loadCoupons(false);
              setError('');
            } catch (requestError) {
              setError(requestError.response?.data?.message || 'Unable to save coupon');
            }
          }}
        >
          <div className="grid-two">
            <Input
              label="Coupon Code"
              value={form.code}
              onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))}
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
            <label className="field">
              <span className="field-label">Campaign state</span>
              <span className="checkbox-row field-input field-input--checkbox">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, isActive: event.target.checked }))
                  }
                />
                <span>Coupon is active</span>
              </span>
            </label>
          </div>

          <div className="grid-two">
            <Input
              label="Starts At"
              type="date"
              value={form.startsAt}
              onChange={(event) => setForm((current) => ({ ...current, startsAt: event.target.value }))}
            />
            <Input
              label="Expires At"
              type="date"
              value={form.expiresAt}
              onChange={(event) => setForm((current) => ({ ...current, expiresAt: event.target.value }))}
            />
          </div>

          <div className="inline-actions">
            <Button type="submit">{editingId ? 'Update Coupon' : 'Create Coupon'}</Button>
            {editingId ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setEditingId('');
                  setForm(createInitialForm());
                }}
              >
                Cancel Edit
              </Button>
            ) : null}
          </div>
        </form>

        <article className="surface-card">
          <p className="eyebrow">Campaign preview</p>
          <div className="stack-list">
            <div>
              <h3>{form.code || 'NEWOFFER'}</h3>
              <p className="muted-text">{form.description || 'Describe what this promotion is for and when shoppers should use it.'}</p>
            </div>
            <div className="info-list">
              <div className="info-item">
                <span>Offer shape</span>
                <strong>
                  {form.discountType === 'PERCENTAGE'
                    ? `${form.amount}% off up to ${form.maxDiscount}`
                    : `${form.amount} off`}
                </strong>
              </div>
              <div className="info-item">
                <span>Eligibility</span>
                <strong>Minimum cart value {form.minOrderValue}</strong>
              </div>
              <div className="info-item">
                <span>Timeline</span>
                <strong>{formatDateRange(form.startsAt, form.expiresAt)}</strong>
              </div>
              <div className="info-item">
                <span>State</span>
                <strong>{form.isActive ? 'Can be redeemed when within date range' : 'Paused until reactivated'}</strong>
              </div>
            </div>
          </div>
        </article>
      </div>

      <section className="surface-card control-shell">
        <div className="control-grid control-grid--orders">
          <Input
            label="Search coupons"
            placeholder="Code or description"
            value={filters.search}
            onChange={(event) =>
              setFilters((current) => ({ ...current, search: event.target.value }))
            }
          />
          <Input
            label="Campaign state"
            as="select"
            options={STATUS_OPTIONS}
            value={filters.status}
            onChange={(event) =>
              setFilters((current) => ({ ...current, status: event.target.value }))
            }
          />
        </div>
      </section>

      <div className="stack-list">
        {filteredCoupons.length ? (
          filteredCoupons.map((coupon) => {
            const state = getCouponState(coupon);

            return (
              <article key={coupon._id} className="surface-card entity-card entity-card--coupon">
                <div className="entity-card__body">
                  <div className="entity-card__header">
                    <div>
                      <div className="inline-actions">
                        <span className={`status-tag ${getCouponTone(state)}`}>{state}</span>
                        <span className="meta-chip">{coupon.discountType}</span>
                      </div>
                      <h3>{coupon.code}</h3>
                    </div>
                    <div className="entity-card__summary">
                      <strong>{coupon.amount}{coupon.discountType === 'PERCENTAGE' ? '%' : ' off'}</strong>
                      <span className="muted-text">Used {coupon.usedCount}/{coupon.usageLimit || 'unlimited'}</span>
                    </div>
                  </div>

                  <div className="info-list">
                    <div className="info-item">
                      <span>Description</span>
                      <strong>{coupon.description || 'No description added'}</strong>
                    </div>
                    <div className="info-item">
                      <span>Window</span>
                      <strong>{formatDateRange(coupon.startsAt, coupon.expiresAt)}</strong>
                    </div>
                  </div>
                </div>

                <div className="entity-card__aside">
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
                      try {
                        await couponService.updateCoupon(coupon._id, {
                          ...buildCouponPayload(coupon),
                          isActive: !coupon.isActive,
                        });
                        await loadCoupons(false);
                        setMessage(coupon.isActive ? 'Coupon paused successfully' : 'Coupon activated successfully');
                        setError('');
                      } catch (requestError) {
                        setError(requestError.response?.data?.message || 'Unable to update coupon');
                      }
                    }}
                  >
                    {coupon.isActive ? 'Pause' : 'Activate'}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={async () => {
                      try {
                        await couponService.deleteCoupon(coupon._id);
                        await loadCoupons(false);
                        setMessage('Coupon deleted successfully');
                        setError('');
                      } catch (requestError) {
                        setError(requestError.response?.data?.message || 'Unable to delete coupon');
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </article>
            );
          })
        ) : (
          <div className="empty-state empty-state--card">
            No coupons match the current filters.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Coupons;
