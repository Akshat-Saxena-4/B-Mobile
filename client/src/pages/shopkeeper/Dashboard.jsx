import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import StatCard from '../../components/dashboard/StatCard.jsx';
import OrderStatusBadge from '../../components/order/OrderStatusBadge.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import dashboardService from '../../services/dashboardService.js';
import { formatDate } from '../../utils/formatDate.js';
import formatCurrency from '../../utils/formatCurrency.js';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await dashboardService.getShopkeeperDashboard();
        setDashboard(response);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const insights = useMemo(() => {
    const monthlySales = dashboard?.monthlySales || [];
    const averageMonth =
      monthlySales.length > 0
        ? monthlySales.reduce((sum, month) => sum + month.value, 0) / monthlySales.length
        : 0;
    const activeQueue = (dashboard?.recentOrders || []).filter((order) =>
      ['PLACED', 'CONFIRMED', 'PACKED'].includes(order.fulfillment?.status)
    ).length;

    return {
      averageMonth,
      activeQueue,
      activeProducts: dashboard?.stats?.activeProducts || 0,
      lowStock: dashboard?.stats?.lowStock || 0,
    };
  }, [dashboard]);

  if (loading) {
    return <Loader label="Loading seller dashboard" />;
  }

  return (
    <DashboardLayout
      role="SHOPKEEPER"
      title="Run your storefront with confidence."
      description="Track revenue, identify inventory issues, and keep fulfillment moving with a cleaner operating view."
      actions={
        <>
          <Link to="/seller/orders">
            <Button variant="ghost">Review Orders</Button>
          </Link>
          <Link to="/seller/products/new">
            <Button>Add Product</Button>
          </Link>
        </>
      }
    >
      <section className="surface-card console-hero console-hero--seller">
        <div>
          <p className="eyebrow">Store outlook</p>
          <h3>{user?.sellerProfile?.shopName || 'Your storefront'} is ready for the next sales cycle.</h3>
          <p className="section-copy">
            Watch listing health, revenue rhythm, and open fulfillment tasks without leaving the dashboard.
          </p>
          <div className="inline-actions">
            <span className="status-tag status-tag--info">
              Seller status {user?.sellerProfile?.status || 'PENDING'}
            </span>
            {user?.sellerProfile?.approvedAt ? (
              <span className="meta-chip">Approved {formatDate(user.sellerProfile.approvedAt)}</span>
            ) : null}
          </div>
        </div>
        <div className="console-hero__stats">
          <div className="console-stat">
            <span>Active products</span>
            <strong>{insights.activeProducts}</strong>
          </div>
          <div className="console-stat">
            <span>Avg monthly sales</span>
            <strong>{formatCurrency(insights.averageMonth)}</strong>
          </div>
          <div className="console-stat">
            <span>Orders needing action</span>
            <strong>{insights.activeQueue}</strong>
          </div>
          <div className="console-stat">
            <span>Inventory alerts</span>
            <strong>{insights.lowStock}</strong>
          </div>
        </div>
      </section>

      <div className="stats-grid">
        <StatCard label="Products" value={dashboard?.stats?.products || 0} />
        <StatCard label="Orders" value={dashboard?.stats?.orders || 0} />
        <StatCard label="Revenue" value={formatCurrency(dashboard?.stats?.revenue || 0)} />
        <StatCard label="Low Stock Alerts" value={dashboard?.stats?.lowStock || 0} />
      </div>

      <div className="dashboard-two-up">
        <article className="surface-card chart-card">
          <p className="eyebrow">Sales Trend</p>
          <h3>Monthly revenue</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={dashboard?.monthlySales || []}>
              <defs>
                <linearGradient id="sellerSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0d6efd" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#0d6efd" fill="url(#sellerSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </article>

        <article className="surface-card">
          <p className="eyebrow">Next Best Actions</p>
          <div className="info-list">
            <div className="info-item">
              <span>Catalog cleanup</span>
              <strong>{insights.lowStock} SKU(s) need a stock check</strong>
            </div>
            <div className="info-item">
              <span>Fulfillment pace</span>
              <strong>{insights.activeQueue} order(s) are still in pre-shipment stages</strong>
            </div>
            <div className="info-item">
              <span>Growth opportunity</span>
              <strong>{dashboard?.topProducts?.[0]?.title || 'Top products will appear here soon'}</strong>
            </div>
          </div>
          <div className="inline-actions">
            <Link to="/seller/products">
              <Button variant="secondary">Open Catalog</Button>
            </Link>
            <Link to="/seller/orders">
              <Button variant="ghost">Open Orders</Button>
            </Link>
          </div>
        </article>
      </div>

      <div className="dashboard-two-up">
        <article className="surface-card">
          <p className="eyebrow">Inventory Alerts</p>
          <div className="stack-list compact-list">
            {dashboard?.inventoryAlerts?.length ? (
              dashboard.inventoryAlerts.map((product) => (
                <div key={product._id} className="list-row">
                  <div>
                    <strong>{product.title}</strong>
                    <p className="muted-text">{product.inventory?.sku}</p>
                  </div>
                  <div className="order-list-meta">
                    <span className="status-tag status-tag--warning">{product.inventory?.stock} left</span>
                    <span className="muted-text">Threshold {product.inventory?.lowStockThreshold}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">No low-stock products right now.</div>
            )}
          </div>
        </article>

        <article className="surface-card">
          <p className="eyebrow">Top Products</p>
          <div className="stack-list compact-list">
            {dashboard?.topProducts?.length ? (
              dashboard.topProducts.map((product, index) => (
                <div key={`${product.title}-${product.quantitySold}`} className="list-row">
                  <div>
                    <strong>
                      #{index + 1} {product.title}
                    </strong>
                    <p className="muted-text">{product.quantitySold} sold</p>
                  </div>
                  <span>{formatCurrency(product.revenue)}</span>
                </div>
              ))
            ) : (
              <div className="empty-state">Top products will appear after sales start coming in.</div>
            )}
          </div>
        </article>
      </div>

      <article className="surface-card">
        <p className="eyebrow">Recent Orders</p>
        <div className="stack-list compact-list">
          {dashboard?.recentOrders?.length ? (
            dashboard.recentOrders.map((order) => (
              <div key={order._id} className="list-row">
                <div>
                  <strong>{order.orderNumber}</strong>
                    <p className="muted-text">
                      {order.customer
                        ? `${order.customer.firstName} ${order.customer.lastName}`
                        : 'Deleted user'}{' '}
                      | {formatDate(order.createdAt)}
                    </p>
                </div>
                <div className="order-list-meta">
                  <OrderStatusBadge status={order.fulfillment?.status} showDetail={false} />
                  <span>{formatCurrency(order.pricing?.grandTotal)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">Recent orders will appear here.</div>
          )}
        </div>
      </article>
    </DashboardLayout>
  );
};

export default Dashboard;
