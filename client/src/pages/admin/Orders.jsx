import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import orderService from '../../services/orderService.js';
import formatCurrency from '../../utils/formatCurrency.js';
import { ORDER_STATUS_OPTIONS } from '../../utils/constants.js';

const Orders = () => {
  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
    const response = await orderService.getAllOrders();
    setOrders(response);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <DashboardLayout
      role="ADMIN"
      title="Review every marketplace order"
      description="Adjust status, monitor operations, and keep delivery data consistent."
    >
      <div className="stack-list">
        {orders.map((order) => (
          <article key={order._id} className="surface-card">
            <div className="order-head">
              <div>
                <p className="eyebrow">{order.orderNumber}</p>
                <h3>{order.customer?.firstName} {order.customer?.lastName}</h3>
              </div>
              <strong>{formatCurrency(order.pricing?.grandTotal)}</strong>
            </div>

            <form
              className="grid-three"
              onSubmit={async (event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                await orderService.updateOrderStatus(order._id, {
                  status: formData.get('status'),
                  note: formData.get('note'),
                  trackingId: formData.get('trackingId'),
                  carrier: formData.get('carrier'),
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
              <Button type="submit">Save Status</Button>
            </form>
          </article>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Orders;

