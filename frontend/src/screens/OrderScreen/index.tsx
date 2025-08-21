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
  { label: 'order.all', fallbackLabel: 'All', value: 'all' },
  { label: 'order.inProgress', fallbackLabel: 'In Progress', value: 'in_progress' },
  { label: 'order.finished', fallbackLabel: 'Finished', value: 'finished' },
];

// Enhanced status colors for individual statuses
const statusColors = {
  created: 'bg-blue-100 text-blue-600',
  operator_confirmed: 'bg-yellow-100 text-yellow-600',
  confirmed: 'bg-green-100 text-green-600',
  packing: 'bg-orange-100 text-orange-600',
  packed: 'bg-purple-100 text-purple-600',
  courier_picked: 'bg-indigo-100 text-indigo-600',
  delivered: 'bg-green-100 text-green-600',
  paid: 'bg-emerald-100 text-emerald-600',
  rejected: 'bg-red-100 text-red-600',
  rejected_by_shop: 'bg-red-100 text-red-600',
  rejected_by_courier: 'bg-red-100 text-red-600',
  cancelled_by_client: 'bg-gray-100 text-gray-600',
};

function getGroupForStatus(status: string): 'in_progress' | 'finished' {
  const inProgressStatuses = new Set([
    'created',
    'operator_confirmed',
    'confirmed',
    'packing',
    'packed',
    'courier_picked',
  ]);
  const finishedStatuses = new Set([
    'delivered',
    'paid',
    'rejected',
    'rejected_by_shop',
    'rejected_by_courier',
    'cancelled_by_client',
  ]);

  if (finishedStatuses.has(status)) return 'finished';
  if (inProgressStatuses.has(status)) return 'in_progress';
  // Default unknowns to in_progress to avoid hiding orders
  return 'in_progress';
}

// Order Card Component with Accordion
const OrderCard: React.FC<{ order: Order; onNavigate: (orderId: string) => void }> = ({ order, onNavigate }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const firstItem = order.items[0];

  // Function to render product images
  const renderProductImages = () => {
    if (order.items.length === 1) {
      return (
        <img
          src={firstItem?.image || 'https://via.placeholder.com/64x64?text=No+Image'}
          alt={firstItem?.name || t('productCard.product')}
          className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
        />
      );
    }

    // Stack multiple images
    const maxImagesToShow = 3;
    const imagesToShow = order.items.slice(0, maxImagesToShow);
    
    return (
      <div className="relative w-16 h-16 flex-shrink-0">
        {imagesToShow.map((item, index) => (
          <img
            key={item.productId || index}
            src={item.image || 'https://via.placeholder.com/64x64?text=No+Image'}
            alt={item.name}
            className={`absolute w-12 h-12 rounded-lg object-cover border-2 border-white shadow-sm ${
              index === 0 ? 'z-30' : index === 1 ? 'z-20' : 'z-10'
            }`}
            style={{
              left: `${index * 8}px`,
              top: `${index * 4}px`,
            }}
          />
        ))}
        {order.items.length > maxImagesToShow && (
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#232c43] text-white text-xs rounded-full flex items-center justify-center border-2 border-white shadow-sm z-40">
            +{order.items.length - maxImagesToShow}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-[#f6f6f6] rounded-2xl shadow-sm overflow-hidden">
      {/* Main Order Info */}
      <div 
        className="px-4 py-4 cursor-pointer"
        onClick={() => onNavigate(order._id)}
      >
        <div className="flex items-center gap-4">
          {renderProductImages()}
          <div className="flex-1 min-w-0">
                         <div className="font-semibold text-base text-[#232c43] truncate">
               {firstItem?.name || t('productCard.product')}
               {order.items.length > 1 && t('order.moreItems', { count: order.items.length - 1 })}
             </div>
            <div className="text-xs text-gray-400 mb-1">
              {t('order.orderDate')}: {new Date(order.createdAt).toLocaleDateString()}
            </div>
            <div className="text-[#ff7a00] font-bold text-base">
              {formatPrice(order.pricing.total)}
            </div>
            <div className="text-xs text-gray-400">
              {t('order.totalItems')}: {totalItems} {t('order.items')}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}
            >
              {t(`order.${order.status}`) || order.status}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-1 rounded-full bg-white shadow-sm"
            >
              <Icon 
                icon={isExpanded ? "mdi:chevron-up" : "mdi:chevron-down"} 
                className="text-lg text-[#232c43]" 
              />
            </button>
          </div>
        </div>
      </div>

      {/* Accordion Items */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-white">
          <div className="px-4 py-3">
            <div className="text-sm font-semibold text-[#232c43] mb-3">
              {t('order.items')} ({order.items.length})
            </div>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={item.productId || index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <img
                    src={item.image || 'https://via.placeholder.com/48x48?text=No+Image'}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-[#232c43] truncate">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {t('order.quantity')}: {item.quantity} {item.unit}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#ff7a00] font-semibold text-sm">
                      {formatPrice(item.price)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {t('order.subtotal')}: {formatPrice(item.subtotal)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Order Summary */}
            <div className="mt-4 p-3 bg-gray-50 rounded-xl">
              <div className="text-sm font-semibold text-[#232c43] mb-2">
                {t('order.orderSummary')}
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('order.itemsTotal')}</span>
                  <span>{formatPrice(order.pricing.itemsTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('order.deliveryFee')}</span>
                  <span>{formatPrice(order.pricing.deliveryFee)}</span>
                </div>
                <div className="border-t border-gray-200 pt-1 flex justify-between font-semibold">
                  <span>{t('order.total')}</span>
                  <span className="text-[#ff7a00]">{formatPrice(order.pricing.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const OrderScreen: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery<OrderListResponse>({
    queryKey: ['orders'],
    queryFn: () => getOrders(1, 20),
  });
  const orders: Order[] = data?.data || [];

  const filteredOrders: Order[] = React.useMemo(() => {
    if (!orders) return [] as Order[];
    let filtered = orders;
    
    // Filter by status tab
    if (activeTab !== 'all') {
      const group = activeTab as 'in_progress' | 'finished';
      filtered = orders.filter((o) => getGroupForStatus(o.status) === group);
    }
    
    // Sort by date (most recent first)
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, activeTab]);

  const handleOrderClick = (orderId: string) => {
    navigate(`/order/${orderId}`);
  };

  return (
    <div className="h-screen flex flex-col relative overflow-hidden scrollbar-hide">
      {/* Header */}
      <div className="max-w-md mx-auto w-full px-0 pb-0 flex-1 flex flex-col overflow-hidden scrollbar-hide">
        <div
          className="bg-white rounded-b-[52px] px-4 pb-8 mb-[88px] flex-1 flex flex-col z-45 overflow-auto scrollbar-hide"
          style={{ minHeight: 'calc(100vh - 70px)', maxHeight: 'calc(100vh - 70px)' }}
        >
          {/* Header */}
          <div className="flex items-center mb-6 pt-6 px-0">
            <button
              className="bg-white rounded-full p-2 mr-3 flex-shrink-0 shadow"
              onClick={() => navigate('/profile')}
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            >
              <Icon icon="mdi:arrow-left" className="text-xl text-[#232c43]" />
            </button>
            <h1 className="text-2xl font-bold text-[#232c43] leading-tight">
              {t('order.orders') || 'Orders'}
            </h1>
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
                {t(tab.label) || tab.fallbackLabel}
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
            ) : filteredOrders.length === 0 ? (
              <div className="text-center text-gray-400 py-8">{t('order.noOrders')}</div>
            ) : (
              filteredOrders.map((order) => (
                <OrderCard 
                  key={order._id} 
                  order={order} 
                  onNavigate={handleOrderClick}
                />
              ))
            )}
          </div>
        </div>
      </div>
      <TabBar current="Order" />
    </div>
  );
};

export default OrderScreen; 