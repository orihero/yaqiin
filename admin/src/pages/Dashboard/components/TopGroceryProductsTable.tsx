import React from 'react';
import { useTranslation } from 'react-i18next';

interface TopProduct {
  name: string;
  orderCount: number;
  revenue: number;
  image?: string;
  // Add more fields as needed
}

const TopGroceryProductsTable: React.FC<{ topProducts?: TopProduct[] }> = ({ topProducts }) => {
  const { t } = useTranslation();
  
  const products = topProducts && topProducts.length > 0 ? topProducts : [
    {
      name: t('common.sampleProducts.organicBananas'),
      orderCount: 2350,
      revenue: 4235,
    },
    {
      name: t('common.sampleProducts.wholeWheatBread'),
      orderCount: 1630,
      revenue: 3699,
    },
    // ...static fallback
  ];

  return (
    <div className="bg-[#232c43] rounded-2xl p-6 shadow mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xl font-semibold">🏆 {t('dashboard.topProducts')}</div>
        <button className="text-gray-400 hover:text-gray-200 text-2xl px-2" title={t('common.actions')}>⋮</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="text-gray-400 text-sm">
              <th className="py-2 px-2 font-medium">📦 {t('products.productName')}</th>
              <th className="py-2 px-2 font-medium">📊 {t('dashboard.stats.sales', 'Sales')}</th>
              <th className="py-2 px-2 font-medium">💰 {t('dashboard.stats.earnings', 'Earnings')}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, idx) => (
              <tr key={product.name} className="border-t border-gray-700 hover:bg-[#20283a] transition">
                <td className="py-3 px-2 font-semibold text-gray-100 leading-tight flex items-center gap-2">
                  {product.image && (
                    <img src={product.image} alt={product.name} className="w-8 h-8 rounded object-cover border border-gray-700" />
                  )}
                  {!product.image && <span className="text-lg">📦</span>}
                  {product.name}
                </td>
                <td className="py-3 px-2 font-medium text-gray-200">{product.orderCount.toLocaleString()}</td>
                <td className="py-3 px-2 font-medium text-gray-200">${product.revenue.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopGroceryProductsTable; 