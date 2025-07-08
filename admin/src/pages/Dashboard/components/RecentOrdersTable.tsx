import React from 'react';

const mockOrders = [
  { id: 'ORD-1001', customer: 'Alice Smith', date: '2024-06-01', amount: '$120.00', status: 'Completed' },
  { id: 'ORD-1002', customer: 'Bob Johnson', date: '2024-06-02', amount: '$75.50', status: 'Pending' },
  { id: 'ORD-1003', customer: 'Charlie Lee', date: '2024-06-03', amount: '$210.00', status: 'Completed' },
  { id: 'ORD-1004', customer: 'Diana King', date: '2024-06-04', amount: '$60.00', status: 'Cancelled' },
  { id: 'ORD-1005', customer: 'Evan Wright', date: '2024-06-05', amount: '$340.00', status: 'Completed' },
];

const statusColors: Record<string, string> = {
  Completed: 'text-green-400',
  Pending: 'text-yellow-400',
  Cancelled: 'text-red-400',
};

const RecentOrdersTable: React.FC = () => (
  <div className="overflow-x-auto">
    <table className="min-w-full text-left text-sm">
      <thead>
        <tr className="text-gray-400 border-b border-gray-700">
          <th className="py-2 px-4">Order ID</th>
          <th className="py-2 px-4">Customer</th>
          <th className="py-2 px-4">Date</th>
          <th className="py-2 px-4">Amount</th>
          <th className="py-2 px-4">Status</th>
        </tr>
      </thead>
      <tbody>
        {mockOrders.map((order) => (
          <tr key={order.id} className="border-b border-gray-800 hover:bg-gray-700/30">
            <td className="py-2 px-4 font-mono">{order.id}</td>
            <td className="py-2 px-4">{order.customer}</td>
            <td className="py-2 px-4">{order.date}</td>
            <td className="py-2 px-4">{order.amount}</td>
            <td className={`py-2 px-4 font-semibold ${statusColors[order.status]}`}>{order.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default RecentOrdersTable; 