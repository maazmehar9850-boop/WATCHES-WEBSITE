import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Users, ShoppingCart, Package, DollarSign } from 'lucide-react';
import api, { formatPrice } from '../../api/axios';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/users/dashboard')
      .then((r) => setStats(r.data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-slate-mute">Loading dashboard...</p>;
  }

  if (!stats) {
    return <p className="text-slate-mute">Failed to load dashboard data.</p>;
  }

  const chartData = (stats.monthlyRevenue || []).map((item) => ({
    name: `${MONTHS[(item._id?.month || 1) - 1]} ${item._id?.year || ''}`,
    revenue: item.revenue || 0,
    orders: item.orders || 0,
  }));

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart },
    { label: 'Total Products', value: stats.totalProducts, icon: Package },
    { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: DollarSign },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl md:text-4xl mb-1">Dashboard</h1>
        <p className="text-slate-mute text-sm">Overview of your store performance</p>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="glass p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs tracking-wider uppercase text-slate-mute">{label}</p>
                <p className="font-display text-2xl md:text-3xl mt-2 text-gold">{value}</p>
              </div>
              <div className="p-2 bg-gold/10 text-gold">
                <Icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass p-6">
          <h2 className="font-display text-xl mb-6">Monthly Revenue</h2>
          {chartData.length === 0 ? (
            <p className="text-slate-mute text-sm py-12 text-center">No revenue data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#c9a22722" />
                <XAxis dataKey="name" tick={{ fill: '#6b6560', fontSize: 12 }} />
                <YAxis tick={{ fill: '#6b6560', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(10,10,11,0.9)',
                    border: '1px solid #c9a22744',
                    borderRadius: 0,
                  }}
                  formatter={(value) => [formatPrice(value), 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#c9a227" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="glass p-6">
          <h2 className="font-display text-xl mb-4">Order Status</h2>
          <div className="space-y-3">
            {(stats.statusCounts || []).length === 0 ? (
              <p className="text-slate-mute text-sm">No orders yet</p>
            ) : (
              stats.statusCounts.map((s) => (
                <div key={s._id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-mute">{s._id}</span>
                  <span className="font-medium text-gold">{s.count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="glass p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-gold hover:underline">
            View all
          </Link>
        </div>
        {(stats.recentOrders || []).length === 0 ? (
          <p className="text-slate-mute text-sm">No recent orders</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs tracking-wider uppercase text-slate-mute border-b border-black/10 dark:border-white/10">
                  <th className="pb-3 pr-4">Order</th>
                  <th className="pb-3 pr-4">Customer</th>
                  <th className="pb-3 pr-4">Total</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b border-black/5 dark:border-white/5 last:border-0"
                  >
                    <td className="py-3 pr-4 font-mono text-xs">
                      #{order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="py-3 pr-4">
                      {order.user?.name || order.shippingAddress?.fullName || 'Guest'}
                    </td>
                    <td className="py-3 pr-4 text-gold">{formatPrice(order.totalPrice)}</td>
                    <td className="py-3 pr-4">
                      <span className="text-xs tracking-wider uppercase px-2 py-1 bg-gold/15 text-gold">
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-mute">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
