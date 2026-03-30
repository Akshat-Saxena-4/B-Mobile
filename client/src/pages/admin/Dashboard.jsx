import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Loader from '../../components/common/Loader.jsx';
import StatCard from '../../components/dashboard/StatCard.jsx';
import OrderStatusBadge from '../../components/order/OrderStatusBadge.jsx';
import dashboardService from '../../services/dashboardService.js';
import formatCurrency from '../../utils/formatCurrency.js';

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await dashboardService.getAdminDashboard();
        setDashboard(response);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <Loader label="Loading admin dashboard" />;
  }

  const userSplitData = [
    { name: 'Customers', value: dashboard?.userSplit?.customers || 0, color: '#0d6efd' },
    { name: 'Shopkeepers', value: dashboard?.userSplit?.shopkeepers || 0, color: '#ff9f0a' },
    { name: 'Admins', value: dashboard?.userSplit?.admins || 0, color: '#111827' },
  ];

  return (
    <DashboardLayout
      role="ADMIN"
      title="Marketplace control center"
      description="Monitor platform growth, seller quality, catalog health, and revenue flow."
    >
      <div className="stats-grid">
        <StatCard label="Customers" value={dashboard?.stats?.users || 0} />
        <StatCard label="Shopkeepers" value={dashboard?.stats?.shopkeepers || 0} />
        <StatCard label="Orders" value={dashboard?.stats?.orders || 0} />
        <StatCard label="Revenue" value={formatCurrency(dashboard?.stats?.revenue || 0)} />
        <StatCard
          label="Monthly Sales"
          value={formatCurrency(dashboard?.stats?.currentMonthSales || 0)}
          helper={dashboard?.currentMonthLabel || 'Current month'}
        />
      </div>

      <div className="dashboard-two-up">
        <article className="surface-card chart-card">
          <p className="eyebrow">Revenue</p>
          <h3>Last six months</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dashboard?.monthlyRevenue || []}>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0d6efd" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="surface-card chart-card">
          <p className="eyebrow">User Mix</p>
          <h3>Role distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={userSplitData} dataKey="value" innerRadius={62} outerRadius={92}>
                {userSplitData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </article>
      </div>

      <div className="dashboard-two-up">
        <article className="surface-card">
          <p className="eyebrow">Seller Queue</p>
          <div className="stack-list compact-list">
            {dashboard?.sellerQueue?.length ? (
              dashboard.sellerQueue.map((seller) => (
                <div key={seller._id} className="list-row">
                  <div>
                    <strong>{seller.firstName} {seller.lastName}</strong>
                    <p className="muted-text">{seller.sellerProfile?.shopName}</p>
                  </div>
                  <span>{seller.sellerProfile?.status}</span>
                </div>
              ))
            ) : (
              <div className="empty-state">No pending sellers right now.</div>
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
                    <p className="muted-text">
                      {order.customer
                        ? `${order.customer.firstName} ${order.customer.lastName}`
                        : 'Deleted user'}
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
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
