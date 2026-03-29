import { useEffect, useState } from 'react';
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
import dashboardService from '../../services/dashboardService.js';
import formatCurrency from '../../utils/formatCurrency.js';

const Dashboard = () => {
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

  if (loading) {
    return <Loader label="Loading seller dashboard" />;
  }

  return (
    <DashboardLayout
      role="SHOPKEEPER"
      title="Run your storefront with confidence."
      description="Track revenue, identify low-stock inventory, and keep your order pipeline moving."
      actions={
        <Link to="/seller/products/new">
          <Button>Add Product</Button>
        </Link>
      }
    >
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
          <p className="eyebrow">Inventory Alerts</p>
          <div className="stack-list compact-list">
            {dashboard?.inventoryAlerts?.length ? (
              dashboard.inventoryAlerts.map((product) => (
                <div key={product._id} className="list-row">
                  <div>
                    <strong>{product.title}</strong>
                    <p className="muted-text">{product.inventory?.sku}</p>
                  </div>
                  <span>{product.inventory?.stock} left</span>
                </div>
              ))
            ) : (
              <div className="empty-state">No low-stock products right now.</div>
            )}
          </div>
        </article>
      </div>

      <div className="dashboard-two-up">
        <article className="surface-card">
          <p className="eyebrow">Top Products</p>
          <div className="stack-list compact-list">
            {dashboard?.topProducts?.length ? (
              dashboard.topProducts.map((product) => (
                <div key={`${product.title}-${product.quantitySold}`} className="list-row">
                  <div>
                    <strong>{product.title}</strong>
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

        <article className="surface-card">
          <p className="eyebrow">Recent Orders</p>
          <div className="stack-list compact-list">
            {dashboard?.recentOrders?.length ? (
              dashboard.recentOrders.map((order) => (
                <div key={order._id} className="list-row">
                  <div>
                    <strong>{order.orderNumber}</strong>
                    <p className="muted-text">{order.fulfillment?.status}</p>
                  </div>
                  <span>{formatCurrency(order.pricing?.grandTotal)}</span>
                </div>
              ))
            ) : (
              <div className="empty-state">Recent orders will appear here.</div>
            )}
          </div>
        </article>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

