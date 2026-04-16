import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Loader from '../../components/common/Loader.jsx';
import OrderStatusBadge from '../../components/order/OrderStatusBadge.jsx';
import SafeImg from '../../components/common/SafeImg.jsx';
import { useAuth } from '../../hooks/useAuth.js';
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

const ACTIVE_STATUSES = ['PLACED', 'CONFIRMED', 'PACKED'];
const SHIPPING_STATUSES = ['SHIPPED', 'OUT_FOR_DELIVERY'];

const getItemSellerId = (item) => item.seller?._id || item.seller;

const Orders = () => {
  const { user } = useAuth();
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

      const response = await orderService.getSellerOrders();
      setOrders(response);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to fetch seller orders');
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const decoratedOrders = useMemo(
    () =>
      orders.map((order) => {
        const sellerItems = order.items.filter(
          (item) => `${getItemSellerId(item)}` === `${user?._id}`
        );
        const sellerRevenue = sellerItems.reduce((sum, item) => sum + item.lineTotal, 0);
        const sellerUnits = sellerItems.reduce((sum, item) => sum + item.quantity, 0);

        return {
          ...order,
          sellerItems,
          sellerRevenue,
          sellerUnits,
        };
      }),
    [orders, user?._id]
  );

  const metrics = useMemo(() => {
    const activeCount = decoratedOrders.filter((order) =>
      ACTIVE_STATUSES.includes(order.fulfillment?.status)
    ).length;
    const shippingCount = decoratedOrders.filter((order) =>
      SHIPPING_STATUSES.includes(order.fulfillment?.status)
    ).length;
    const deliveredCount = decoratedOrders.filter(
      (order) => order.fulfillment?.status === 'DELIVERED'
    ).length;
    const revenue = decoratedOrders.reduce((sum, order) => sum + order.sellerRevenue, 0);

    return {
      total: decoratedOrders.length,
      activeCount,
      shippingCount,
      deliveredCount,
      revenue,
    };
  }, [decoratedOrders]);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    return decoratedOrders.filter((order) => {
      if (statusFilter !== 'ALL' && order.fulfillment?.status !== statusFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [
        order.orderNumber,
        order.customer?.firstName,
        order.customer?.lastName,
        order.customer?.email,
        order.fulfillment?.trackingId,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [decoratedOrders, deferredQuery, statusFilter]);

  const exportOrders = () => {
    downloadCsv({
      filename: 'seller-orders.csv',
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
        { label: 'Units', value: (order) => order.sellerUnits },
        { label: 'Seller Revenue', value: (order) => order.sellerRevenue },
        { label: 'Tracking ID', value: (order) => order.fulfillment?.trackingId || '' },
        { label: 'Carrier', value: (order) => order.fulfillment?.carrier || '' },
        { label: 'Created At', value: (order) => formatDateTime(order.createdAt) },
      ],
      rows: filteredOrders,
    });
  };

  const runStatusUpdate = async (orderId, payload, successMessage) => {
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
    return <Loader label="Loading seller orders" />;
  }

  return (
    <DashboardLayout
      role="SHOPKEEPER"
      title="Manage seller orders"
      description="Keep fulfillment moving with searchable queues, delivery context, and one-click status progression."
      actions={
        <Button variant="ghost" onClick={exportOrders} disabled={!filteredOrders.length}>
          Export CSV
        </Button>
      }
    >
      <section className="surface-card console-hero console-hero--seller">
        <div>
          <p className="eyebrow">Fulfillment desk</p>
          <h3>See what needs attention before it turns into a customer issue.</h3>
          <p className="section-copy">
            Active orders, in-transit shipments, and delivery details stay visible in one place.
          </p>
        </div>
        <div className="console-hero__stats">
          <div className="console-stat">
            <span>Active queue</span>
            <strong>{metrics.activeCount}</strong>
          </div>
          <div className="console-stat">
            <span>In transit</span>
            <strong>{metrics.shippingCount}</strong>
          </div>
          <div className="console-stat">
            <span>Delivered</span>
            <strong>{metrics.deliveredCount}</strong>
          </div>
          <div className="console-stat">
            <span>Seller revenue</span>
            <strong>{formatCurrency(metrics.revenue)}</strong>
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
                      Placed {formatDateTime(order.createdAt)} |{' '}
                      {order.customer?.email || order.shippingAddress?.phone}
                    </p>
                  </div>
                  <div className="order-summary-meta">
                    <OrderStatusBadge status={order.fulfillment?.status} />
                    <strong>{formatCurrency(order.sellerRevenue)}</strong>
                    <span className="muted-text">{order.sellerUnits} item(s) from your store</span>
                  </div>
                </div>

                <div className="order-workspace__grid">
                  <div className="stack-list">
                    <div className="data-points">
                      <span className="meta-chip">Carrier {order.fulfillment?.carrier || 'Pending'}</span>
                      <span className="meta-chip">Tracking {order.fulfillment?.trackingId || 'Awaiting update'}</span>
                      <span className="meta-chip">Delivery ETA {formatDate(order.fulfillment?.estimatedDelivery)}</span>
                    </div>

                    <div className="order-item-media-list">
                      {order.sellerItems.map((item) => (
                        <div key={`${order._id}-${item.sku}`} className="order-item-media">
                          <div className="order-item-media__thumb">
                            <SafeImg src={item.image} alt={item.title} decoding="async" />
                          </div>
                          <div className="order-item-media__body">
                            <strong>{item.title}</strong>
                            <span className="muted-text">
                              {item.quantity} x {formatCurrency(item.unitPrice)} | SKU {item.sku}
                            </span>
                          </div>
                          <strong>{formatCurrency(item.lineTotal)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="surface-card surface-card--subtle order-side-panel">
                    <p className="eyebrow">Delivery details</p>
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

                <div className="inline-actions order-workspace__quick-actions">
                  {nextStatus ? (
                    <Button
                      variant="secondary"
                      disabled={busyId === order._id}
                      onClick={() =>
                        runStatusUpdate(
                          order._id,
                          { status: nextStatus },
                          `Order moved to ${formatOrderStatusLabel(nextStatus)}`
                        )
                      }
                    >
                      Mark as {formatOrderStatusLabel(nextStatus)}
                    </Button>
                  ) : null}
                </div>

                <form
                  className="grid-two order-workspace__form"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    const formData = new FormData(event.currentTarget);

                    await runStatusUpdate(
                      order._id,
                      {
                        status: formData.get('status'),
                        trackingId: formData.get('trackingId'),
                        carrier: formData.get('carrier'),
                        note: formData.get('note'),
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
                  <Input label="Internal note" name="note" placeholder="Shared note for status history" />
                  <div className="grid-span-3 inline-actions">
                    <Button type="submit" disabled={busyId === order._id}>
                      Save Update
                    </Button>
                  </div>
                </form>
              </article>
            );
          })
        ) : (
          <div className="empty-state empty-state--card">
            No orders match the current search. Try clearing the filter to see the full queue.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Orders;
