import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Loader from '../../components/common/Loader.jsx';
import OrderStatusBadge from '../../components/order/OrderStatusBadge.jsx';
import SafeImg from '../../components/common/SafeImg.jsx';
import orderService from '../../services/orderService.js';
import { downloadCsv } from '../../utils/exportCsv.js';
import { formatDate, formatDateTime } from '../../utils/formatDate.js';
import formatCurrency from '../../utils/formatCurrency.js';
import { ORDER_STATUS_OPTIONS } from '../../utils/constants.js';
import { formatOrderStatusLabel } from '../../utils/orderStatus.js';

const STATUS_FILTER_OPTIONS = [{ value: 'ALL', label: 'All statuses' }, ...ORDER_STATUS_OPTIONS];

const NEXT_STATUS_MAP = {
  PLACED: 'CONFIRMED',
  CONFIRMED: 'PACKED',
  PACKED: 'SHIPPED',
  SHIPPED: 'OUT_FOR_DELIVERY',
  OUT_FOR_DELIVERY: 'DELIVERED',
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [busyId, setBusyId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const deferredQuery = useDeferredValue(query);

  const loadOrders = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const response = await orderService.getAllOrders({
        status: statusFilter === 'ALL' ? '' : statusFilter,
      });
      setOrders(response);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to fetch marketplace orders');
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return orders;
    }

    return orders.filter((order) =>
      [
        order.orderNumber,
        order.customer?.firstName,
        order.customer?.lastName,
        order.customer?.email,
        order.fulfillment?.trackingId,
        order.shippingAddress?.fullName,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery))
    );
  }, [deferredQuery, orders]);

  const metrics = useMemo(() => {
    const active = filteredOrders.filter((order) =>
      ['PLACED', 'CONFIRMED', 'PACKED'].includes(order.fulfillment?.status)
    ).length;
    const transit = filteredOrders.filter((order) =>
      ['SHIPPED', 'OUT_FOR_DELIVERY'].includes(order.fulfillment?.status)
    ).length;
    const delivered = filteredOrders.filter(
      (order) => order.fulfillment?.status === 'DELIVERED'
    ).length;
    const gmv = filteredOrders.reduce((sum, order) => sum + (order.pricing?.grandTotal || 0), 0);

    return {
      total: filteredOrders.length,
      active,
      transit,
      delivered,
      gmv,
    };
  }, [filteredOrders]);

  const exportOrders = () => {
    downloadCsv({
      filename: 'admin-orders.csv',
      columns: [
        { label: 'Order Number', key: 'orderNumber' },
        {
          label: 'Customer',
          value: (order) =>
            order.customer
              ? `${order.customer.firstName} ${order.customer.lastName}`.trim()
              : 'Deleted user',
        },
        { label: 'Status', value: (order) => formatOrderStatusLabel(order.fulfillment?.status) },
        { label: 'Total', value: (order) => order.pricing?.grandTotal || 0 },
        { label: 'Tracking ID', value: (order) => order.fulfillment?.trackingId || '' },
        { label: 'Carrier', value: (order) => order.fulfillment?.carrier || '' },
        { label: 'Created At', value: (order) => formatDateTime(order.createdAt) },
      ],
      rows: filteredOrders,
    });
  };

  const runOrderUpdate = async (orderId, payload, successMessage) => {
    try {
      setBusyId(orderId);
      await orderService.updateOrderStatus(orderId, payload);
      await loadOrders(false);
      setMessage(successMessage);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update order');
    } finally {
      setBusyId('');
    }
  };

  if (loading) {
    return <Loader label="Loading orders" />;
  }

  return (
    <DashboardLayout
      role="ADMIN"
      title="Review every marketplace order"
      description="Search order queues, inspect seller breakdowns, and move fulfillment forward with clearer operational context."
      actions={
        <Button variant="ghost" onClick={exportOrders} disabled={!filteredOrders.length}>
          Export CSV
        </Button>
      }
    >
      <section className="surface-card console-hero console-hero--admin">
        <div>
          <p className="eyebrow">Marketplace fulfillment</p>
          <h3>Keep delivery data clean and intervene earlier when something looks off.</h3>
          <p className="section-copy">
            Order totals, seller allocations, and shipping details are all visible before you save a status change.
          </p>
        </div>
        <div className="console-hero__stats">
          <div className="console-stat">
            <span>Total queue</span>
            <strong>{metrics.total}</strong>
          </div>
          <div className="console-stat">
            <span>Active</span>
            <strong>{metrics.active}</strong>
          </div>
          <div className="console-stat">
            <span>In transit</span>
            <strong>{metrics.transit}</strong>
          </div>
          <div className="console-stat">
            <span>GMV</span>
            <strong>{formatCurrency(metrics.gmv)}</strong>
          </div>
        </div>
      </section>

      {message ? <div className="alert alert-success">{message}</div> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}

      <section className="surface-card control-shell">
        <div className="control-grid control-grid--orders">
          <Input
            label="Search orders"
            placeholder="Order number, customer, email, tracking ID"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Input
            label="Status"
            as="select"
            options={STATUS_FILTER_OPTIONS}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          />
        </div>
      </section>

      <div className="stack-list">
        {filteredOrders.length ? (
          filteredOrders.map((order) => {
            const nextStatus = NEXT_STATUS_MAP[order.fulfillment?.status];

            return (
              <article key={order._id} className="surface-card order-workspace">
                <div className="order-head order-head--enhanced">
                  <div>
                    <p className="eyebrow">{order.orderNumber}</p>
                    <h3>
                      {order.customer
                        ? `${order.customer.firstName} ${order.customer.lastName}`
                        : 'Deleted user'}
                    </h3>
                    <p className="muted-text">
                      {order.customer?.email || order.shippingAddress?.phone} |{' '}
                      {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                  <div className="order-summary-meta">
                    <OrderStatusBadge status={order.fulfillment?.status} />
                    <strong>{formatCurrency(order.pricing?.grandTotal)}</strong>
                    <span className="muted-text">{order.items.length} line item(s)</span>
                  </div>
                </div>

                <div className="order-workspace__grid">
                  <div className="stack-list">
                    <div className="data-points">
                      <span className="meta-chip">Carrier {order.fulfillment?.carrier || 'Pending'}</span>
                      <span className="meta-chip">Tracking {order.fulfillment?.trackingId || 'Awaiting update'}</span>
                      <span className="meta-chip">ETA {formatDate(order.fulfillment?.estimatedDelivery)}</span>
                    </div>

                    <div className="order-item-media-list">
                      {order.items.map((item) => (
                        <div key={`${order._id}-${item.sku}`} className="order-item-media">
                          <div className="order-item-media__thumb">
                            <SafeImg src={item.image} alt={item.title} decoding="async" />
                          </div>
                          <div className="order-item-media__body">
                            <strong>{item.title}</strong>
                            <span className="muted-text">
                              {item.quantity} x {formatCurrency(item.unitPrice)} | Seller{' '}
                              {item.seller?.sellerProfile?.shopName ||
                                `${item.seller?.firstName || ''} ${item.seller?.lastName || ''}`.trim() ||
                                'Unknown'}
                            </span>
                          </div>
                          <strong>{formatCurrency(item.lineTotal)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="surface-card surface-card--subtle order-side-panel">
                    <p className="eyebrow">Shipping</p>
                    <div className="info-list">
                      <div className="info-item">
                        <span>Recipient</span>
                        <strong>{order.shippingAddress?.fullName}</strong>
                      </div>
                      <div className="info-item">
                        <span>Phone</span>
                        <strong>{order.shippingAddress?.phone}</strong>
                      </div>
                      <div className="info-item">
                        <span>Address</span>
                        <strong>
                          {[
                            order.shippingAddress?.line1,
                            order.shippingAddress?.line2,
                            order.shippingAddress?.city,
                            order.shippingAddress?.state,
                            order.shippingAddress?.postalCode,
                          ]
                            .filter(Boolean)
                            .join(', ')}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {nextStatus ? (
                  <div className="inline-actions order-workspace__quick-actions">
                    <Button
                      variant="secondary"
                      disabled={busyId === order._id}
                      onClick={() =>
                        runOrderUpdate(
                          order._id,
                          { status: nextStatus },
                          `Order moved to ${formatOrderStatusLabel(nextStatus)}`
                        )
                      }
                    >
                      Mark as {formatOrderStatusLabel(nextStatus)}
                    </Button>
                  </div>
                ) : null}

                <form
                  className="grid-two order-workspace__form"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    const formData = new FormData(event.currentTarget);
                    await runOrderUpdate(
                      order._id,
                      {
                        status: formData.get('status'),
                        note: formData.get('note'),
                        trackingId: formData.get('trackingId'),
                        carrier: formData.get('carrier'),
                      },
                      'Order updated successfully'
                    );
                  }}
                >
                  <Input
                    label="Status"
                    name="status"
                    as="select"
                    defaultValue={order.fulfillment?.status}
                    options={ORDER_STATUS_OPTIONS}
                  />
                  <Input
                    label="Carrier"
                    name="carrier"
                    defaultValue={order.fulfillment?.carrier}
                  />
                  <Input
                    label="Tracking ID"
                    name="trackingId"
                    defaultValue={order.fulfillment?.trackingId}
                  />
                  <Input label="Note" name="note" placeholder="Visible in status history" />
                  <div className="grid-span-3 inline-actions">
                    <Button type="submit" disabled={busyId === order._id}>
                      Save Status
                    </Button>
                  </div>
                </form>
              </article>
            );
          })
        ) : (
          <div className="empty-state empty-state--card">
            No orders match the current filters.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Orders;
