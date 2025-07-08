import React from 'react';
import { Icon } from '@iconify/react';
import TabBar from '../HomeScreen/components/TabBar';
import { useQuery } from '@tanstack/react-query';
import { getOrders } from '../../services/orderService';
import type { Order } from '@yaqiin/shared/types/order';

const statusTabs = [
  { label: 'All Order', value: 'all' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Processing', value: 'Processing' },
  { label: 'Delivered', value: 'Delivered' },
];

const statusColors: Record<string, string> = {
  Delivered: 'bg-[#e6f6ec] text-[#3bb77e]',
  Pending: 'bg-[#f6f6e6] text-[#e6b800]',
  Processing: 'bg-[#e6eaf6] text-[#3b6bb7]',
};

const OrderScreen = () => {
  const [activeTab, setActiveTab] = React.useState('all');
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['orders', activeTab],
    queryFn: () => getOrders(1, 20, activeTab === 'all' ? undefined : activeTab),
  });
  const orders: Order[] = data?.data || [];

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col relative">
      {/* Header */}
      <div className="max-w-md mx-auto w-full px-0 pt-6 pb-0 flex-1 flex flex-col">
        <div className="bg-white rounded-3xl shadow-lg px-4 pt-6 pb-8 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-[#232c43] leading-tight">Daily<br />Grocery Food</h1>
            <div className="bg-white rounded-full p-3 shadow flex items-center justify-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <Icon icon="mdi:magnify" className="text-2xl text-[#232c43]" />
            </div>
          </div>
          {/* Status Tabs */}
          <div className="flex gap-3 mb-6 overflow-x-auto pl-1 pr-4 scrollbar-hide">
            {statusTabs.map(tab => (
              <button
                key={tab.value}
                className={`px-5 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.value
                    ? 'bg-[#232c43] text-white shadow'
                    : 'bg-white text-[#232c43] border border-gray-200'
                }`}
                onClick={() => setActiveTab(tab.value)}
                style={{ width: 'fit-content' }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {/* Orders List */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Icon icon="mdi:loading" className="animate-spin text-3xl text-[#232c43]" />
            </div>
          ) : isError ? (
            <div className="text-center text-red-400 py-8">{error instanceof Error ? error.message : 'Failed to load orders.'}</div>
          ) : orders.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No orders found.</div>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map(order => {
                const firstItem = order.items[0];
                return (
                  <div key={order._id} className="flex items-center bg-[#f8f8f8] rounded-2xl p-4 shadow-sm">
                    <img
                      src={firstItem?.image || '/no-image.png'}
                      alt={firstItem?.name || 'Product'}
                      className="w-16 h-16 rounded-xl object-cover mr-4"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="font-semibold text-base text-[#232c43]">{firstItem?.name || 'Product'}</div>
                      <div className="text-xs text-gray-400 mb-1">{new Date(order.createdAt).toLocaleDateString()}</div>
                      <div className="text-[#ff7a00] font-bold text-base">
                        ${firstItem?.price?.toFixed(2) || '0.00'}
                        <span className="text-xs font-normal text-gray-400">/kg</span>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-full font-semibold text-xs ml-4 ${statusColors[order.status] || 'bg-gray-200 text-gray-600'}`}>
                      {order.status}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {/* Bottom Navigation */}
      <TabBar current="Order" />
    </div>
  );
};

export default OrderScreen; 