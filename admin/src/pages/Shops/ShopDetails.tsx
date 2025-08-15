import { useQuery } from '@tanstack/react-query';
import { Shop } from '@yaqiin/shared/types/shop';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getShop } from '../../services/shopService';
import { ShopInfoTab, ShopOrdersTab, ShopCouriersTab, ShopProductsTab } from './components';

const TABS = [
  { key: 'info', label: 'Shop Info' },
  { key: 'orders', label: 'Shop Orders' },
  { key: 'couriers', label: 'Shop Couriers' },
  { key: 'products', label: 'Shop Products' },
];

export default function ShopDetails() {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('info');

  // Fetch shop details
  const { data: shopData, isLoading, error } = useQuery<{ success: boolean; data: Shop }, Error>({
    queryKey: ['shop', shopId],
    queryFn: () => getShop(shopId!),
    enabled: !!shopId,
  });

  const renderTabContent = () => {
    if (!shopId) return null;

    switch (tab) {
      case 'info':
        return (
          <ShopInfoTab
            shopData={shopData?.data!}
            isLoading={isLoading}
            error={error}
          />
        );
      case 'orders':
        return <ShopOrdersTab shopId={shopId} />;
      case 'couriers':
        return <ShopCouriersTab shopId={shopId} />;
      case 'products':
        return <ShopProductsTab shopId={shopId} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-8 min-h-screen bg-[#1a2236] text-white">
      <button className="mb-4 text-blue-400 hover:underline" onClick={() => navigate(-1)}>
        ← Back to Shops
      </button>
      <h1 className="text-2xl font-bold mb-6">Shop Details</h1>
      
      <div className="flex gap-4 mb-6">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`px-4 py-2 rounded-t-lg font-semibold ${tab === t.key ? 'bg-[#232b42] text-blue-300' : 'bg-[#232b42] text-gray-400'}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      
      <div className="bg-[#232b42] rounded-xl p-6 min-h-[300px]">
        {renderTabContent()}
      </div>
    </div>
  );
} 