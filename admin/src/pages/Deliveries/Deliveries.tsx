import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Icon } from '@iconify/react';
import { getAllUsers } from '../../services/userService';
import { getAllShops } from '../../services/shopService';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Order } from '@yaqiin/shared/types/order';
import { createOrder, deleteOrder, getOrders, OrderListResponse, updateOrder } from '../../services/deliveryService';
import OrderFormModal from './components/DeliveryFormModal';

const Orders: React.FC = () => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data: ordersData, isLoading, isError } = useQuery<OrderListResponse>({
    queryKey: ['orders', page, limit],
    queryFn: () => getOrders(page, limit),
  });

  const orders = ordersData?.data || [];
  const totalPages = ordersData?.meta?.totalPages || 1;

  const queryClient = useQueryClient();
  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      setDrawerOpen(false);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: updateOrder,
    onSuccess: () => {
      setEditOrder(null);
      setDrawerOpen(false);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: getAllUsers,
  });
  const { data: shops, isLoading: loadingShops } = useQuery({
    queryKey: ['shops', 'all'],
    queryFn: getAllShops,
  });

  return (
    <div className="p-8 min-h-screen bg-[#1a2236] text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold"
          onClick={() => setDrawerOpen(true)}
        >
          <Icon icon="mdi:plus" className="inline-block mr-2" /> Add Order
        </button>
      </div>
      <div className="bg-[#232b42] rounded-xl overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-[#2e3650]">
              <th className="py-3 px-4">Order #</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Shop</th>
              <th className="py-3 px-4">Total</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Created</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-8">Loading...</td></tr>
            ) : isError ? (
              <tr><td colSpan={7} className="text-center py-8 text-red-400">Failed to load orders.</td></tr>
            ) : !orders?.length ? (
              <tr><td colSpan={7} className="text-center py-16 text-gray-400">
                <div className="flex flex-col items-center">
                  <Icon icon="mdi:package-variant" className="text-5xl mb-4" />
                  <div className="text-lg font-medium">No orders found.</div>
                  <div className="text-sm">Click <span className="font-semibold">Add Order</span> to create your first order.</div>
                </div>
              </td></tr>
            ) : (
              orders.map((order: Order, idx: number) => (
                <tr key={order._id} className="border-b border-[#2e3650] hover:bg-[#202840] transition">
                  <td className="py-3 px-4">{order.orderNumber}</td>
                  <td className="py-3 px-4">{
                    loadingUsers ? 'Loading...' :
                    users?.find((u: any) => u._id === order.customerId)?.firstName + ' ' + users?.find((u: any) => u._id === order.customerId)?.lastName || order.customerId
                  }</td>
                  <td className="py-3 px-4">{
                    loadingShops ? 'Loading...' :
                    shops?.find((s: any) => s._id === order.shopId)?.name || order.shopId
                  }</td>
                  <td className="py-3 px-4">{order.pricing.total}</td>
                  <td className="py-3 px-4 capitalize">
                    <span className={`px-2 py-1 rounded text-xs font-semibold 
                      ${order.status === 'pending' ? 'bg-yellow-900 text-yellow-300' :
                        order.status === 'processing' ? 'bg-blue-900 text-blue-300' :
                        order.status === 'delivered' ? 'bg-green-900 text-green-300' :
                        order.status === 'cancelled' ? 'bg-red-900 text-red-300' :
                        'bg-gray-700 text-gray-300'}`}>{order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-center flex gap-3 justify-center">
                    <button className="hover:text-blue-400" title="Edit" onClick={() => { setEditOrder(order); setDrawerOpen(true); }}>
                      <Icon icon="mdi:pencil" width={18} height={18} />
                    </button>
                    <button className="hover:text-red-400" title="Delete" onClick={() => setDeleteTarget(order)}>
                      <Icon icon="mdi:delete" width={18} height={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <span>Items per page:</span>
          <select
            className="bg-[#232b42] text-white px-2 py-1 rounded"
            value={limit}
            onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
          >
            {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <button
            className="px-2 py-1 mx-1 rounded disabled:opacity-50"
            onClick={() => setPage(1)}
            disabled={page === 1}
          >{'<<'}</button>
          <button
            className="px-2 py-1 mx-1 rounded disabled:opacity-50"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >{'<'}</button>
          <span className="mx-2">{page} / {totalPages}</span>
          <button
            className="px-2 py-1 mx-1 rounded disabled:opacity-50"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >{'>'}</button>
          <button
            className="px-2 py-1 mx-1 rounded disabled:opacity-50"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
          >{'>>'}</button>
        </div>
      </div>
      {isDrawerOpen && (
        <OrderFormModal
          order={editOrder || undefined}
          onClose={() => { setDrawerOpen(false); setEditOrder(null); }}
          onSubmit={(values) => {
            if (editOrder) {
              updateOrderMutation.mutate({ ...editOrder, ...values });
            } else {
              createOrderMutation.mutate(values);
            }
          }}
          loading={createOrderMutation.isPending || updateOrderMutation.isPending}
          error={createOrderMutation.isError ? (createOrderMutation.error as any)?.message : updateOrderMutation.isError ? (updateOrderMutation.error as any)?.message : null}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          open={!!deleteTarget}
          title="Delete Order"
          description="Are you sure you want to delete this order? This action cannot be undone."
          loading={deleteOrderMutation.isPending}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => deleteOrderMutation.mutate(deleteTarget._id)}
        />
      )}
    </div>
  );
};

export default Orders; 