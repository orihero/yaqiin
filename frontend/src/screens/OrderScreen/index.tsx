import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import TabBar from '../../components/TabBar';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { getOrders } from '../../services/orderService';
import { useNavigate } from 'react-router-dom';
import type { Order } from '@yaqiin/shared/types/order';
import type { OrderListResponse } from '../../services/orderService';
import { formatPrice } from "@yaqiin/shared/utils/formatPrice";

const statusTabs = [
  { label: 'order.all', value: 'all' },
  { label: 'order.pending', value: 'pending' },
  { label: 'order.processing', value: 'processing' },
  { label: 'order.delivered', value: 'delivered' },
];

const statusColors = {
  delivered: 'bg-gray-100 text-gray-600',
  pending: 'bg-gray-100 text-gray-600',
  processing: 'bg-gray-100 text-gray-600',
};

function getStatusColor(status: string) {
  return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-600';
}

const OrderScreen: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<OrderListResponse>({
    queryKey: ['orders', activeTab],
    queryFn: () =>
      activeTab === 'all'
        ? getOrders(1, 20)
        : getOrders(1, 20, activeTab),
  });
  const orders: Order[] = data?.data || [];

  return (
    <div className="h-screen flex flex-col relative overflow-hidden scrollbar-hide">
      {/* Header */}
      <div className="max-w-md mx-auto w-full px-0 pb-0 flex-1 flex flex-col overflow-hidden scrollbar-hide">
        <div
          className="bg-white rounded-b-[52px] px-4 pb-8 mb-[88px] flex-1 flex flex-col z-45 overflow-auto scrollbar-hide"
          style={{ minHeight: 'calc(100vh - 70px)', maxHeight: 'calc(100vh - 70px)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pt-6 px-0">
            <h1 className="text-3xl font-bold text-[#232c43] leading-tight">
              {t('order.title1')}
              <br />
              {t('order.title2')}
            </h1>
            <div
              className="bg-white rounded-full p-3 shadow flex items-center justify-center"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            >
              <Icon icon="mdi:magnify" className="text-2xl text-[#232c43]" />
            </div>
          </div>
          {/* Status Tabs */}
          <div className="flex gap-3 overflow-x-auto pl-1 pr-4 mb-4 scrollbar-hide items-center min-h-14 sticky top-0 bg-[#fff] z-45">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                className={`px-5 py-2 rounded-full text-sm whitespace-nowrap transition-all font-semibold ${
                  (activeTab === tab.value || (activeTab === 'all' && tab.value === 'all'))
                    ? 'bg-[#232c43] text-white shadow'
                    : 'bg-white text-[#232c43] border border-gray-200'
                }`}
                onClick={() => setActiveTab(tab.value)}
                style={{ width: 'fit-content' }}
              >
                {t(tab.label)}
              </button>
            ))}
          </div>
          {/* Orders List */}
          <div className="flex flex-col gap-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Icon icon="mdi:loading" className="animate-spin text-3xl text-[#232c43]" />
              </div>
            ) : isError ? (
              <div className="text-center text-red-400 py-8">{t('order.failedToLoad')}</div>
            ) : orders.length === 0 ? (
              <div className="text-center text-gray-400 py-8">{t('order.noOrders')}</div>
            ) : (
              orders.map((order) => {
                const firstItem = order.items[0];
                return (
                  <div
                    key={order._id}
                    className="flex items-center bg-[#f6f6f6] rounded-2xl px-4 py-4 gap-4 shadow-sm cursor-pointer"
                    onClick={() => navigate(`/order/${order._id}`)}
                  >
                    <img
                      src={firstItem?.image || 'https://via.placeholder.com/64x64?text=No+Image'}
                      alt={firstItem?.name || t('productCard.product')}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="font-semibold text-base text-[#232c43]">
                        {firstItem?.name || t('productCard.product')}
                      </div>
                      <div className="text-xs text-gray-400 mb-1">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-[#ff7a00] font-bold text-base">
                        {formatPrice(firstItem?.price)}
                        <span className="text-xs font-normal text-gray-400">/{firstItem?.unit}</span>
                      </div>
                    </div>
                    <span
                      className={`px-4 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}
                    >
                      {t(`order.${order.status.toLowerCase()}`)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      <TabBar current="Order" />
    </div>
  );
};

export default OrderScreen; 