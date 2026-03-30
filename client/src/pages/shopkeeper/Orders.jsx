import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import OrderStatusBadge from '../../components/order/OrderStatusBadge.jsx';
import orderService from '../../services/orderService.js';
import formatCurrency from '../../utils/formatCurrency.js';
import { ORDER_STATUS_OPTIONS } from '../../utils/constants.js';

const Orders = () => {
  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
    const response = await orderService.getSellerOrders();
    setOrders(response);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <DashboardLayout
      role="SHOPKEEPER"
      title="Manage seller orders"
      description="Update shipment progress, tracking details, and delivery state."
    >
      <div className="stack-list">
        {orders.map((order) => (
          <article key={order._id} className="surface-card">
            <div className="order-head">
              <div>
                <p className="eyebrow">{order.orderNumber}</p>
                <h3>
                  {order.customer
                    ? `${order.customer.firstName} ${order.customer.lastName}`
                    : 'Deleted user'}
                </h3>
              </div>
              <div className="order-summary-meta">
                <OrderStatusBadge status={order.fulfillment?.status} />
                <strong>{formatCurrency(order.pricing?.grandTotal)}</strong>
              </div>
            </div>

            <div className="order-items-list">
              {order.items.map((item) => (
                <div key={`${order._id}-${item.title}`} className="order-line">
                  <span>{item.title}</span>
                  <span>{item.quantity} unit(s)</span>
                </div>
              ))}
            </div>

            <form
              className="grid-three"
              onSubmit={async (event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                await orderService.updateOrderStatus(order._id, {
                  status: formData.get('status'),
                  trackingId: formData.get('trackingId'),
                  carrier: formData.get('carrier'),
                  note: formData.get('note'),
                });
                loadOrders();
              }}
            >
              <Input
                label="Status"
                name="status"
                as="select"
                defaultValue={order.fulfillment?.status}
                options={ORDER_STATUS_OPTIONS}
              />
              <Input label="Tracking ID" name="trackingId" defaultValue={order.fulfillment?.trackingId} />
              <Input label="Carrier" name="carrier" defaultValue={order.fulfillment?.carrier} />
              <Input label="Note" name="note" className="grid-span-3" defaultValue="" />
              <Button type="submit">Update Order</Button>
            </form>
          </article>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Orders;
