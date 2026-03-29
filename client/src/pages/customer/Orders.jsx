import { useEffect, useState } from 'react';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import orderService from '../../services/orderService.js';
import formatCurrency from '../../utils/formatCurrency.js';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) {
    return <Loader label="Loading your orders" />;
  }

  return (
    <section className="container page-stack">
      <div className="section-header">
        <div>
          <p className="eyebrow">Orders</p>
          <h1>Track every purchase from placement to delivery.</h1>
        </div>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="stack-list">
        {orders.length ? (
          orders.map((order) => (
            <article key={order._id} className="surface-card">
              <div className="order-head">
                <div>
                  <p className="eyebrow">{order.orderNumber}</p>
                  <h3>{order.fulfillment?.status}</h3>
                </div>
                <strong>{formatCurrency(order.pricing?.grandTotal)}</strong>
              </div>

              <div className="order-items-list">
                {order.items.map((item) => (
                  <div key={`${order._id}-${item.product?._id || item.title}`} className="order-line">
                    <span>{item.title}</span>
                    <span>
                      {item.quantity} x {formatCurrency(item.unitPrice)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="timeline-list">
                {order.statusHistory?.map((entry) => (
                  <div key={`${order._id}-${entry.updatedAt}`} className="timeline-item">
                    <strong>{entry.status}</strong>
                    <span>{entry.note || 'Status updated'}</span>
                  </div>
                ))}
              </div>

              {['PLACED', 'CONFIRMED', 'PACKED'].includes(order.fulfillment?.status) ? (
                <Button
                  variant="ghost"
                  onClick={async () => {
                    await orderService.cancelOrder(order._id);
                    loadOrders();
                  }}
                >
                  Cancel Order
                </Button>
              ) : null}
            </article>
          ))
        ) : (
          <div className="empty-state">No orders yet. Your first premium purchase starts here.</div>
        )}
      </div>
    </section>
  );
};

export default Orders;

