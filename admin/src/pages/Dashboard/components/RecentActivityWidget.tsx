import React from 'react';

const mockActivities = [
  { description: 'Order #ORD-1005 completed', time: '2m ago' },
  { description: 'New customer: Evan Wright', time: '10m ago' },
  { description: 'Order #ORD-1004 cancelled', time: '30m ago' },
  { description: 'Product restocked: E-Reader', time: '1h ago' },
  { description: 'Order #ORD-1003 completed', time: '2h ago' },
];

const RecentActivityWidget: React.FC = () => (
  <ul className="divide-y divide-gray-700">
    {mockActivities.map((activity, idx) => (
      <li key={idx} className="py-2 flex justify-between items-center">
        <span>{activity.description}</span>
        <span className="text-xs text-gray-400 ml-4 whitespace-nowrap">{activity.time}</span>
      </li>
    ))}
  </ul>
);

export default RecentActivityWidget; 