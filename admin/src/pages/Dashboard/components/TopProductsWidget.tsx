import React from 'react';

const mockProducts = [
  { name: 'Wireless Headphones', sales: 320, icon: '🎧' },
  { name: 'Smart Watch', sales: 210, icon: '⌚' },
  { name: 'Bluetooth Speaker', sales: 180, icon: '🔊' },
  { name: 'Fitness Tracker', sales: 150, icon: '🏃' },
  { name: 'E-Reader', sales: 120, icon: '📚' },
];

const TopProductsWidget: React.FC = () => (
  <ul className="divide-y divide-gray-700">
    {mockProducts.map((product) => (
      <li key={product.name} className="flex items-center py-2">
        <span className="text-2xl mr-3">{product.icon}</span>
        <span className="flex-1">{product.name}</span>
        <span className="text-cyan-400 font-semibold">{product.sales}</span>
      </li>
    ))}
  </ul>
);

export default TopProductsWidget; 