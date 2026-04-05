import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import SafeImg from '../../components/common/SafeImg.jsx';
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
    <section className="container page-stack orders-page">
      <div className="section-header section-header--tight">
        <div>
          <p className="eyebrow">Orders</p>
          <h1>Every line shows the photo, unit price, and what you paid.</h1>
        </div>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="stack-list orders-page__list">
        {orders.length ? (
          orders.map((order) => (
            <article key={order._id} className="surface-card order-card-enhanced">
              <div className="order-head order-head--enhanced">
                <div>
                  <p className="eyebrow">{order.orderNumber}</p>
                  <h3>{order.fulfillment?.status}</h3>
                </div>
                <strong className="order-card-enhanced__total">
                  {formatCurrency(order.pricing?.grandTotal)}
                </strong>
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
                        {item.quantity} × {formatCurrency(item.unitPrice)} ={' '}
                        <strong>{formatCurrency(item.lineTotal)}</strong>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>

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
          <div className="empty-state empty-state--card">
            No orders yet.{' '}
            <Link to="/products" className="text-link">
              Browse phones
            </Link>{' '}
            — prices show on each product image.
          </div>
        )}
      </div>
    </section>
  );
};

export default Orders;
