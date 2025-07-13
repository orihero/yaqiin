import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import type { Order } from '@yaqiin/shared/types/order';
import { getOrders } from '../../services/orderService';
import { formatPrice } from "@yaqiin/shared/utils/formatPrice";

// If you have a getOrderById, use it. Otherwise, fetch all and filter by id for now.

const OrderDetailsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Replace with getOrderById if available
  const { data, isLoading, isError, error } = useQuery<Order | undefined>({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await getOrders(1, 1, undefined); // get all, ideally use getOrderById
      return res.data.find((order: Order) => order._id === id);
    },
  });
  const order = data;

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Icon icon="mdi:loading" className="animate-spin text-3xl text-[#232c43]" /></div>;
  }
  if (isError || !order) {
    return <div className="flex justify-center items-center h-screen text-red-400">{t('order.detailsNotFound')}</div>;
  }

  return (
    <div className="min-h-screen bg-[#f6f6f6] flex flex-col items-center pt-6 pb-0">
      <div className="w-full max-w-md px-4">
        <div className="flex items-center mb-4">
          <button className="mr-2 p-2 rounded-full bg-white shadow" onClick={() => navigate(-1)}>
            <Icon icon="mdi:arrow-left" className="text-2xl text-[#232c43]" />
          </button>
          <h1 className="text-xl font-bold text-[#232c43] flex-1 text-center">{t('order.detailsTitle', { number: order.orderNumber })}</h1>
          <div className="w-10" />
        </div>
        <div className="bg-white rounded-3xl shadow-lg px-6 pt-6 pb-6 flex flex-col items-center relative z-10 mx-0 mb-6">
          <div className="flex items-center justify-between w-full mb-2">
            <span className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span>
            <span className={`px-4 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600`}>
              {t(`order.${order.status.toLowerCase()}`)}
            </span>
          </div>
          {/* Items List */}
          <div className="w-full mb-4">
            {order.items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3 py-2 border-b last:border-b-0">
                <img src={item.image || 'https://via.placeholder.com/64x64?text=No+Image'} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
                <div className="flex-1">
                  <div className="font-semibold text-base text-[#232c43]">{item.name}</div>
                  <div className="text-xs text-gray-400">{t('order.quantity')}: {item.quantity}</div>
                </div>
                <div className="text-right">
                  <div className="text-[#ff7a00] font-bold text-base">
                    {formatPrice(item.price)}<span className="text-xs font-normal text-gray-400">/{item.unit}</span>
                  </div>
                  <div className="text-xs text-gray-400">{t('order.subtotal')}: {formatPrice(item.subtotal)}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Pricing Summary */}
          <div className="w-full mb-4">
            <div className="flex justify-between text-sm mb-1"><span>{t('order.itemsTotal')}</span><span>{formatPrice(order.pricing.itemsTotal)}</span></div>
            <div className="flex justify-between text-sm mb-1"><span>{t('order.deliveryFee')}</span><span>{formatPrice(order.pricing.deliveryFee)}</span></div>
            <div className="flex justify-between text-base font-bold"><span>{t('order.total')}</span><span>{formatPrice(order.pricing.total)}</span></div>
          </div>
          {/* Delivery Address */}
          <div className="w-full mb-4">
            <div className="font-semibold text-sm mb-1">{t('order.deliveryAddress')}</div>
            <div className="text-xs text-gray-500">{order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.district}</div>
          </div>
          {/* Status History */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="w-full mt-2">
              <div className="font-semibold text-sm mb-1">{t('order.statusHistory')}</div>
              <ul className="text-xs text-gray-500">
                {order.statusHistory.map((s, idx) => (
                  <li key={idx}>{t(`order.${s.status.toLowerCase()}`)} - {new Date(s.timestamp).toLocaleString()}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsScreen; 