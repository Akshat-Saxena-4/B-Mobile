import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import SafeImg from '../../components/common/SafeImg.jsx';
import Loader from '../../components/common/Loader.jsx';
import { addToCart } from '../../store/slices/cartSlice.js';
import orderService from '../../services/orderService.js';
import { formatDate, formatDateTime } from '../../utils/formatDate.js';
import formatCurrency from '../../utils/formatCurrency.js';
import { ORDER_STATUS_OPTIONS, PAYMENT_METHOD_LABELS } from '../../utils/constants.js';
import { formatOrderStatusLabel } from '../../utils/orderStatus.js';

const STATUS_FILTER_OPTIONS = [{ value: 'ALL', label: 'All orders' }, ...ORDER_STATUS_OPTIONS];

const Orders = () => {
  const dispatch = useDispatch();
  const [orders, setOrders] = useState([]);
  const [tracking, setTracking] = useState({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    status: 'ALL',
  });
  const deferredSearch = useDeferredValue(filters.search);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getMyOrders();
      setOrders(response);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to fetch your orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = deferredSearch.trim().toLowerCase();

    return orders.filter((order) => {
      if (filters.status !== 'ALL' && order.fulfillment?.status !== filters.status) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [order.orderNumber, order.fulfillment?.trackingId, order.shippingAddress?.fullName]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [deferredSearch, filters.status, orders]);

  const metrics = useMemo(() => {
    const active = filteredOrders.filter((order) =>
      ['PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(
        order.fulfillment?.status
      )
    ).length;
    const delivered = filteredOrders.filter(
      (order) => order.fulfillment?.status === 'DELIVERED'
    ).length;
    const cancelled = filteredOrders.filter(
      (order) => order.fulfillment?.status === 'CANCELLED'
    ).length;
    const spent = filteredOrders.reduce((sum, order) => sum + (order.pricing?.grandTotal || 0), 0);

    return {
      total: filteredOrders.length,
      active,
      delivered,
      cancelled,
      spent,
    };
  }, [filteredOrders]);

  const toggleTracking = async (orderId) => {
    if (tracking[orderId]) {
      setTracking((current) => {
        const next = { ...current };
        delete next[orderId];
        return next;
      });
      return;
    }

    try {
      setBusyId(orderId);
      const response = await orderService.trackOrder(orderId);
      setTracking((current) => ({ ...current, [orderId]: response }));
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to fetch tracking details');
    } finally {
      setBusyId('');
    }
  };

  const handleReorder = async (order) => {
    try {
      setBusyId(order._id);

      for (const item of order.items) {
        await dispatch(
          addToCart({
            productId: item.product?._id || item.product,
            quantity: item.quantity,
          })
        ).unwrap();
      }

      setMessage('Items added to cart successfully');
      setError('');
    } catch (requestError) {
      setError(requestError?.message || 'Unable to re-add one or more items');
    } finally {
      setBusyId('');
    }
  };

  if (loading) {
    return <Loader label="Loading your orders" />;
  }

  return (
    <section className="container page-stack orders-page">
      <section className="surface-card console-hero console-hero--customer">
        <div>
          <p className="eyebrow">Orders</p>
          <h1>Track deliveries, re-order favorites, and keep every shipment visible.</h1>
          <p className="section-copy">
            Search by order number or tracking ID, then drill into the status history when you need specifics.
          </p>
        </div>
        <div className="console-hero__stats">
          <div className="console-stat">
            <span>Orders</span>
            <strong>{metrics.total}</strong>
          </div>
          <div className="console-stat">
            <span>Active</span>
            <strong>{metrics.active}</strong>
          </div>
          <div className="console-stat">
            <span>Delivered</span>
            <strong>{metrics.delivered}</strong>
          </div>
          <div className="console-stat">
            <span>Total spent</span>
            <strong>{formatCurrency(metrics.spent)}</strong>
          </div>
        </div>
      </section>

      {message ? <div className="alert alert-success">{message}</div> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}

      <section className="surface-card control-shell">
        <div className="control-grid control-grid--orders">
          <Input
            label="Search orders"
            placeholder="Order number or tracking ID"
            value={filters.search}
            onChange={(event) =>
              setFilters((current) => ({ ...current, search: event.target.value }))
            }
          />
          <Input
            label="Status"
            as="select"
            options={STATUS_FILTER_OPTIONS}
            value={filters.status}
            onChange={(event) =>
              setFilters((current) => ({ ...current, status: event.target.value }))
            }
          />
        </div>
      </section>

      <div className="stack-list orders-page__list">
        {filteredOrders.length ? (
          filteredOrders.map((order) => {
            const trackingDetails = tracking[order._id];

            return (
              <article key={order._id} className="surface-card order-card-enhanced order-card-enhanced--expanded">
                <div className="order-head order-head--enhanced">
                  <div>
                    <p className="eyebrow">{order.orderNumber}</p>
                    <h3>{formatOrderStatusLabel(order.fulfillment?.status)}</h3>
                    <p className="muted-text">
                      Placed {formatDateTime(order.createdAt)} | Delivering to {order.shippingAddress?.city}
                    </p>
                  </div>
                  <strong className="order-card-enhanced__total">
                    {formatCurrency(order.pricing?.grandTotal)}
                  </strong>
                </div>

                <div className="data-points">
                  <span className="meta-chip">
                    {PAYMENT_METHOD_LABELS[order.payment?.method] || order.payment?.method}
                  </span>
                  <span className="meta-chip">Tracking {order.fulfillment?.trackingId || 'Pending'}</span>
                  <span className="meta-chip">ETA {formatDate(order.fulfillment?.estimatedDelivery)}</span>
                </div>

                <ul className="order-items-list order-items-list--media">
                  {order.items.map((item) => (
                    <li key={`${order._id}-${item.sku || item.title}`} className="order-line order-line--media">
                      <div className="order-line__thumb">
                        <SafeImg src={item.image} alt={item.title} decoding="async" />
                        <span className="order-line__price-pill">{formatCurrency(item.unitPrice)}</span>
                      </div>
                      <div className="order-line__body">
                        <span className="order-line__title">{item.title}</span>
                        <span className="order-line__math muted-text">
                          {item.quantity} x {formatCurrency(item.unitPrice)} ={' '}
                          <strong>{formatCurrency(item.lineTotal)}</strong>
                        </span>
                        <span className="muted-text">
                          Seller{' '}
                          {item.seller?.sellerProfile?.shopName ||
                            `${item.seller?.firstName || ''} ${item.seller?.lastName || ''}`.trim() ||
                            'Marketplace seller'}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="timeline-list">
                  {order.statusHistory?.map((entry) => (
                    <div key={`${order._id}-${entry.updatedAt}`} className="timeline-item">
                      <strong>{formatOrderStatusLabel(entry.status)}</strong>
                      <span>{entry.note || 'Status updated'} | {formatDateTime(entry.updatedAt)}</span>
                    </div>
                  ))}
                </div>

                {trackingDetails ? (
                  <div className="surface-card surface-card--subtle">
                    <p className="eyebrow">Tracking details</p>
                    <div className="info-list">
                      <div className="info-item">
                        <span>Carrier</span>
                        <strong>{trackingDetails.fulfillment?.carrier || 'Pending'}</strong>
                      </div>
                      <div className="info-item">
                        <span>Tracking ID</span>
                        <strong>{trackingDetails.fulfillment?.trackingId || 'Not assigned yet'}</strong>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="inline-actions">
                  <Button
                    variant="ghost"
                    disabled={busyId === order._id}
                    onClick={() => toggleTracking(order._id)}
                  >
                    {trackingDetails ? 'Hide Tracking' : 'Track Order'}
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={busyId === order._id}
                    onClick={() => handleReorder(order)}
                  >
                    Buy Again
                  </Button>
                  {['PLACED', 'CONFIRMED', 'PACKED'].includes(order.fulfillment?.status) ? (
                    <Button
                      variant="ghost"
                      disabled={busyId === order._id}
                      onClick={async () => {
                        try {
                          setBusyId(order._id);
                          await orderService.cancelOrder(order._id);
                          await loadOrders();
                          setMessage('Order cancelled successfully');
                          setError('');
                        } catch (requestError) {
                          setError(requestError.response?.data?.message || 'Unable to cancel order');
                        } finally {
                          setBusyId('');
                        }
                      }}
                    >
                      Cancel Order
                    </Button>
                  ) : null}
                </div>
              </article>
            );
          })
        ) : (
          <div className="empty-state empty-state--card">
            No orders yet.{' '}
            <Link to="/products" className="text-link">
              Browse phones
            </Link>{' '}
            and your next purchase will appear here.
          </div>
        )}
      </div>
    </section>
  );
};

export default Orders;
