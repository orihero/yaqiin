import { useQuery } from '@tanstack/react-query';
import { Order } from '@yaqiin/shared/types/order';
import React from 'react';
import { getOrdersByShop } from '../../../services/orderService';

interface ShopOrdersTabProps {
  shopId: string;
}

export default function ShopOrdersTab({ shopId }: ShopOrdersTabProps) {
  // Fetch orders for this shop
  const { data: ordersData, isLoading, error } = useQuery<{ success: boolean; data: Order[]; meta: any }, Error>({
    queryKey: ['shop-orders', shopId],
    queryFn: () => getOrdersByShop(shopId),
    enabled: !!shopId,
  });

  if (isLoading) {
    return <div>Loading orders...</div>;
  }

  if (error) {
    return <div className="text-red-400">{String(error.message)}</div>;
  }

  if (!ordersData?.data?.length) {
    return <div className="text-gray-400">No orders found for this shop.</div>;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Orders 📦</h2>
      <table className="min-w-full text-left bg-[#232b42] rounded-lg">
        <thead>
          <tr>
            <th className="py-2 px-4">Order #</th>
            <th className="py-2 px-4">Status</th>
            <th className="py-2 px-4">Customer</th>
            <th className="py-2 px-4">Address</th>
            <th className="py-2 px-4">Action</th>
          </tr>
        </thead>
        <tbody>
          {ordersData.data.map((order: Order) => (
            <tr key={order._id} className="border-b border-[#2e3650]">
              <td className="py-2 px-4">{order.orderNumber}</td>
              <td className="py-2 px-4 capitalize">{order.status}</td>
              <td className="py-2 px-4">{order.customerId}</td>
              <td className="py-2 px-4">{order.deliveryAddress?.city}, {order.deliveryAddress?.street}</td>
              <td className="py-2 px-4">
                <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded" title="Mark as delivered">
                  Mark Delivered ✅
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
