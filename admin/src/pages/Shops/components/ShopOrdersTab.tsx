import React from 'react';
import { Order } from '@yaqiin/shared/types/order';

interface ShopOrdersTabProps {
  ordersData: { success: boolean; data: Order[]; meta: any } | undefined;
  ordersLoading: boolean;
  ordersError: Error | null;
}

export default function ShopOrdersTab({ ordersData, ordersLoading, ordersError }: ShopOrdersTabProps) {
  return (
    <div>
      {/* Orders List */}
      <h2 className="text-lg font-semibold mb-2">Orders</h2>
      {ordersLoading ? (
        <div>Loading orders...</div>
      ) : ordersError ? (
        <div className="text-red-400">{String(ordersError.message)}</div>
      ) : !ordersData?.data?.length ? (
        <div className="text-gray-400">No orders found for this shop.</div>
      ) : (
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
                  <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded" title="Mark as delivered">Mark Delivered</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 
