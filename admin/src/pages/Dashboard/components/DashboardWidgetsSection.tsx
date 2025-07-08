import React from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar, YAxis, Cell, PieChart, Pie } from 'recharts';

interface DashboardStats {
  totalProducts?: number;
  averageDeliveryTime?: number;
  longestDeliveryTime?: number;
  shortestDeliveryTime?: number;
  usersTimeSeries?: { _id: string; count: number }[];
  paymentsTimeSeries?: { _id: string; payments: { method: string; total: number }[] }[];
  // ...add more fields as needed
}

const recentPurchasers = [
  { name: 'Alice', avatar: 'https://randomuser.me/api/portraits/women/1.jpg' },
  { name: 'Bob', avatar: 'https://randomuser.me/api/portraits/men/2.jpg' },
  { name: 'Carol', avatar: 'https://randomuser.me/api/portraits/women/3.jpg' },
  { name: 'Dave', avatar: 'https://randomuser.me/api/portraits/men/4.jpg' },
];

const productsData = [
  { name: 'A', value: 70, color: '#38bdf8' },
  { name: 'B', value: 20, color: '#a78bfa' },
  { name: 'C', value: 10, color: '#f472b6' },
];

const DashboardWidgetsSection: React.FC<{ stats?: DashboardStats }> = ({ stats }) => {
  // Map usersTimeSeries to recharts format
  const customersData = (stats?.usersTimeSeries || []).map((item: { _id: string; count: number }) => ({
    day: item._id.slice(5), // MM-DD for display
    thisWeek: item.count,
  }));

  // Map paymentsTimeSeries to recharts format
  const paymentsData = (stats?.paymentsTimeSeries || []).map((item: { _id: string; payments: { method: string; total: number }[] }) => {
    const paypal = item.payments.find((p) => p.method === 'paypal')?.total || 0;
    const credit = item.payments.find((p) => p.method === 'credit_card' || p.method === 'credit')?.total || 0;
    return {
      day: item._id.slice(5), // MM-DD for display
      paypal,
      credit,
    };
  });

  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Latest Deal Widget */}
      <div className="bg-[#232c43] rounded-2xl p-6 shadow flex flex-col min-h-[240px] relative">
        <div className="flex items-center justify-between mb-1">
          <div className="text-lg font-semibold">Average Delivery</div>
          <span className="bg-[#223b5b] text-blue-300 text-xs font-semibold px-3 py-1 rounded-full">
            {stats?.averageDeliveryTime != null ? `${stats.averageDeliveryTime.toFixed(1)} min` : 'N/A'}
          </span>
        </div>
        <div className="text-xs text-gray-400 mb-4">Longest: {stats?.longestDeliveryTime != null ? `${stats.longestDeliveryTime.toFixed(1)} min` : 'N/A'} | Shortest: {stats?.shortestDeliveryTime != null ? `${stats.shortestDeliveryTime.toFixed(1)} min` : 'N/A'}</div>
        <div className="text-xs text-gray-400 mb-4">Coupons used: 18/22</div>
        <div className="text-xs font-semibold text-gray-200 mb-1">Recent Purchasers</div>
        <div className="flex items-center mt-1">
          {recentPurchasers.map((user, idx) => (
            <img
              key={user.name}
              src={user.avatar}
              alt={user.name}
              className={`w-8 h-8 rounded-full border-2 border-[#232c43] -ml-2 first:ml-0 z-${10 - idx}`}
              style={{ zIndex: 10 - idx }}
            />
          ))}
          <span className="w-8 h-8 rounded-full bg-[#223b5b] text-blue-200 flex items-center justify-center text-xs font-semibold border-2 border-[#232c43] -ml-2 z-0">+8</span>
        </div>
      </div>
      {/* Customers Widget */}
      <div className="bg-[#232c43] rounded-2xl p-6 shadow flex flex-col min-h-[240px]">
        <div className="flex items-center justify-between mb-1">
          <div className="text-lg font-semibold">Customers</div>
          <span className="text-green-200 bg-[#1e3a2f] text-xs font-semibold px-3 py-1 rounded-full">+26.5%</span>
        </div>
        <div className="text-xs text-gray-400 mb-2">Last 7 days</div>
        <div className="flex items-end justify-between mb-2">
          <span className="text-2xl font-bold text-gray-100">6,380</span>
        </div>
        <div className="flex-1 w-full h-20 mb-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={customersData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorThisWeek" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.7}/>
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" hide />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', color: '#f1f5f9' }} />
              <Area type="monotone" dataKey="thisWeek" stroke="#38bdf8" fillOpacity={1} fill="url(#colorThisWeek)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-400 inline-block"></span>
            <span className="text-xs text-gray-200">Apr 07 - Apr 14</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gray-500 inline-block"></span>
            <span className="text-xs text-gray-400">Last Week</span>
          </div>
          <div className="ml-auto text-xs text-gray-400">6,380</div>
          <div className="text-xs text-gray-600">4,298</div>
        </div>
      </div>
      {/* Payments Widget */}
      <div className="bg-[#232c43] rounded-2xl p-6 shadow flex flex-col min-h-[240px]">
        <div className="flex items-center justify-between mb-1">
          <div className="text-lg font-semibold">Payments</div>
          <span className="text-red-200 bg-[#3b263a] text-xs font-semibold px-3 py-1 rounded-full">-3.8%</span>
        </div>
        <div className="text-xs text-gray-400 mb-2">Last 7 days</div>
        <div className="flex items-end justify-between mb-2">
          <span className="text-2xl font-bold text-gray-100">12,389</span>
        </div>
        <div className="flex-1 w-full h-20 mb-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={paymentsData} barSize={10} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="day" stroke="#94a3b8" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', color: '#f1f5f9' }} />
              <Bar dataKey="paypal" radius={[4, 4, 0, 0]} fill="#38bdf8">
                {paymentsData.map((entry, idx) => (
                  <Cell key={`cell-paypal-${idx}`} fill="#38bdf8" />
                ))}
              </Bar>
              <Bar dataKey="credit" radius={[4, 4, 0, 0]} fill="#64748b">
                {paymentsData.map((entry, idx) => (
                  <Cell key={`cell-credit-${idx}`} fill="#64748b" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-400 inline-block"></span>
            <span className="text-xs text-gray-200">Paypal</span>
            <span className="text-xs text-gray-400 ml-1">52%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gray-500 inline-block"></span>
            <span className="text-xs text-gray-400">Credit Card</span>
            <span className="text-xs text-gray-400 ml-1">48%</span>
          </div>
        </div>
      </div>
      {/* Products Widget */}
      <div className="bg-[#232c43] rounded-2xl p-6 shadow flex flex-col min-h-[240px] items-center justify-center">
        <div className="flex items-center justify-between w-full mb-1">
          <div className="text-lg font-semibold">Products</div>
          <span className="text-green-200 bg-[#1e3a2f] text-xs font-semibold px-3 py-1 rounded-full">
            {stats?.totalProducts != null ? stats.totalProducts : 'N/A'}
          </span>
        </div>
        <div className="text-xs text-gray-400 w-full mb-2">Total Products</div>
        <div className="text-2xl font-bold text-gray-100 mb-2 w-full">{stats?.totalProducts != null ? stats.totalProducts : 'N/A'}</div>
        <div className="flex-1 flex items-center justify-center w-full h-24 mb-2">
          <ResponsiveContainer width={100} height={100}>
            <PieChart>
              <Pie
                data={productsData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={32}
                outerRadius={40}
                startAngle={90}
                endAngle={-270}
                paddingAngle={2}
              >
                {productsData.map((entry, idx) => (
                  <Cell key={`cell-product-${idx}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="text-xs text-gray-400 w-full text-center">Profit more than last month</div>
      </div>
    </div>
  );
};

export default DashboardWidgetsSection; 