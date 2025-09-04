import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Order } from '@yaqiin/shared/types/order';
import React, { useState, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { getOrdersByShop, updateOrder } from '../../../services/orderService';
import { formatPrice } from '@yaqiin/shared/utils/formatPrice';

interface ShopOrdersTabProps {
  shopId: string;
}

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (orderId: string, updates: Partial<Order>) => void;
}

function OrderDetailsModal({ order, isOpen, onClose, onUpdate }: OrderDetailsModalProps) {
  const [status, setStatus] = useState(order?.status || '');
  const [notes, setNotes] = useState(order?.adminNotes || '');
  const [isUpdating, setIsUpdating] = useState(false);

  React.useEffect(() => {
    if (order) {
      setStatus(order.status);
      setNotes(order.adminNotes || '');
    }
  }, [order]);

  const handleUpdate = async () => {
    if (!order) return;
    
    setIsUpdating(true);
    try {
      await onUpdate(order._id, {
        status: status as Order['status'],
        adminNotes: notes,
      });
      onClose();
    } catch (error) {
      console.error('Failed to update order:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen || !order) return null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      created: 'bg-gray-500',
      operator_confirmed: 'bg-blue-500',
      packing: 'bg-yellow-500',
      packed: 'bg-orange-500',
      courier_picked: 'bg-purple-500',
      delivered: 'bg-green-500',
      paid: 'bg-emerald-500',
      rejected_by_shop: 'bg-red-500',
      rejected_by_courier: 'bg-red-500',
      cancelled_by_client: 'bg-gray-400',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      created: 'mdi:file-document-outline',
      operator_confirmed: 'mdi:check-circle-outline',
      packing: 'mdi:package-variant',
      packed: 'mdi:package-variant-closed',
      courier_picked: 'mdi:truck-delivery-outline',
      delivered: 'mdi:check-circle',
      paid: 'mdi:cash-multiple',
      rejected_by_shop: 'mdi:close-circle',
      rejected_by_courier: 'mdi:close-circle',
      cancelled_by_client: 'mdi:cancel',
    };
    return icons[status] || 'mdi:help-circle';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#232b42] rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Order Details #{order.orderNumber}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Information */}
          <div className="space-y-4">
            <div className="bg-[#1a2236] p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">Order Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Order Number:</span>
                  <span className="text-white font-mono">#{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Customer ID:</span>
                  <span className="text-white">{order.customerId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Payment Method:</span>
                  <span className="text-white capitalize">{order.paymentMethod.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Payment Status:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    order.paymentStatus === 'paid' ? 'bg-green-600' : 
                    order.paymentStatus === 'failed' ? 'bg-red-600' : 'bg-yellow-600'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Created:</span>
                  <span className="text-white">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-[#1a2236] p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">Delivery Address</h3>
              <div className="text-sm text-gray-300">
                <p>{order.deliveryAddress.street}</p>
                <p>{order.deliveryAddress.district}, {order.deliveryAddress.city}</p>
                {order.deliveryAddress.notes && (
                  <p className="mt-2 text-gray-400">Notes: {order.deliveryAddress.notes}</p>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-4">
            <div className="bg-[#1a2236] p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">Order Items</h3>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-[#232b42] rounded">
                    <div className="flex-1">
                      <p className="text-white font-medium">{item.name}</p>
                      <p className="text-gray-400 text-sm">
                        {item.quantity} {item.unit} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">{formatPrice(item.subtotal)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pricing Summary */}
              <div className="mt-4 pt-4 border-t border-gray-600">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Items Total:</span>
                    <span className="text-white">{formatPrice(order.pricing.itemsTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Delivery Fee:</span>
                    <span className="text-white">{formatPrice(order.pricing.deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Service Fee:</span>
                    <span className="text-white">{formatPrice(order.pricing.serviceFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tax:</span>
                    <span className="text-white">{formatPrice(order.pricing.tax)}</span>
                  </div>
                  {order.pricing.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Discount:</span>
                      <span className="text-red-400">-{formatPrice(order.pricing.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t border-gray-600 pt-2">
                    <span className="text-white">Total:</span>
                    <span className="text-cyan-400">{formatPrice(order.pricing.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Management */}
        <div className="mt-6 bg-[#1a2236] p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-3">Status Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Order Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#232b42] border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="created">Created</option>
                <option value="operator_confirmed">Operator Confirmed</option>
                <option value="packing">Packing</option>
                <option value="packed">Packed</option>
                <option value="courier_picked">Courier Picked</option>
                <option value="delivered">Delivered</option>
                <option value="paid">Paid</option>
                <option value="rejected_by_shop">Rejected by Shop</option>
                <option value="rejected_by_courier">Rejected by Courier</option>
                <option value="cancelled_by_client">Cancelled by Client</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Admin Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full bg-[#232b42] border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                placeholder="Add admin notes..."
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50"
          >
            {isUpdating ? 'Updating...' : 'Update Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ShopOrdersTab({ shopId }: ShopOrdersTabProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // Fetch orders for this shop
  const { data: ordersData, isLoading, error } = useQuery<{ success: boolean; data: Order[]; meta: any }, Error>({
    queryKey: ['shop-orders', shopId, page],
    queryFn: () => getOrdersByShop(shopId, page, 20),
    enabled: !!shopId,
  });

  // Update order mutation
  const updateOrderMutation = useMutation({
    mutationFn: ({ orderId, updates }: { orderId: string; updates: Partial<Order> }) =>
      updateOrder({ _id: orderId, ...updates }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-orders', shopId] });
    },
  });

  const handleUpdateOrder = async (orderId: string, updates: Partial<Order>) => {
    await updateOrderMutation.mutateAsync({ orderId, updates });
  };

  const handleOpenOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Filter and sort orders based on search and status
  const filteredOrders = useMemo(() => {
    if (!ordersData?.data) return [];
    
    const filtered = ordersData.data.filter(order => {
      const matchesSearch = searchTerm === '' || 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort by creation time (newest first)
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [ordersData?.data, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      created: 'bg-gray-500',
      operator_confirmed: 'bg-blue-500',
      packing: 'bg-yellow-500',
      packed: 'bg-orange-500',
      courier_picked: 'bg-purple-500',
      delivered: 'bg-green-500',
      paid: 'bg-emerald-500',
      rejected_by_shop: 'bg-red-500',
      rejected_by_courier: 'bg-red-500',
      cancelled_by_client: 'bg-gray-400',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      created: 'mdi:file-document-outline',
      operator_confirmed: 'mdi:check-circle-outline',
      packing: 'mdi:package-variant',
      packed: 'mdi:package-variant-closed',
      courier_picked: 'mdi:truck-delivery-outline',
      delivered: 'mdi:check-circle',
      paid: 'mdi:cash-multiple',
      rejected_by_shop: 'mdi:close-circle',
      rejected_by_courier: 'mdi:close-circle',
      cancelled_by_client: 'mdi:cancel',
    };
    return icons[status] || 'mdi:help-circle';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 mb-2">
          <Icon icon="mdi:alert-circle" className="text-4xl mx-auto mb-2" />
          <p>Error loading orders: {String(error.message)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Icon icon="mdi:cart-outline" className="text-2xl" />
            Shop Orders
          </h2>
          <p className="text-gray-400 mt-1">
            Manage and track all orders for this shop
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Icon icon="mdi:information-outline" className="text-lg" />
          <span>{filteredOrders.length} orders found</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#1a2236] p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search Orders</label>
            <div className="relative">
              <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by order number or customer ID..."
                className="w-full pl-10 pr-4 py-2 bg-[#232b42] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#232b42] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Statuses</option>
              <option value="created">Created</option>
              <option value="operator_confirmed">Operator Confirmed</option>
              <option value="packing">Packing</option>
              <option value="packed">Packed</option>
              <option value="courier_picked">Courier Picked</option>
              <option value="delivered">Delivered</option>
              <option value="paid">Paid</option>
              <option value="rejected_by_shop">Rejected by Shop</option>
              <option value="rejected_by_courier">Rejected by Courier</option>
              <option value="cancelled_by_client">Cancelled by Client</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <Icon icon="mdi:refresh" className="text-lg" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <Icon icon="mdi:package-variant-closed" className="text-6xl text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No Orders Found</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search criteria or filters.'
              : 'This shop has no orders yet.'
            }
          </p>
        </div>
      ) : (
        <div className="bg-[#1a2236] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#232b42]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-[#232b42] transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-white">
                          #{order.orderNumber}
                        </div>
                        <div className="text-sm text-gray-400">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white">{order.customerId}</div>
                      <div className="text-sm text-gray-400">
                        {order.deliveryAddress.city}, {order.deliveryAddress.district}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        <Icon icon={getStatusIcon(order.status)} className="mr-1" />
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-cyan-400">
                        {formatPrice(order.pricing.total)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {order.paymentStatus}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleOpenOrderDetails(order)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-cyan-400 bg-cyan-400 bg-opacity-10 hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 transition-colors"
                      >
                        <Icon icon="mdi:eye" className="mr-1" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {ordersData?.meta && ordersData.meta.totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-2 bg-[#232b42] text-white rounded-lg hover:bg-[#1a2236] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-gray-400">
              Page {page} of {ordersData.meta.totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(ordersData.meta.totalPages, page + 1))}
              disabled={page === ordersData.meta.totalPages}
              className="px-3 py-2 bg-[#232b42] text-white rounded-lg hover:bg-[#1a2236] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUpdate={handleUpdateOrder}
      />
    </div>
  );
}
