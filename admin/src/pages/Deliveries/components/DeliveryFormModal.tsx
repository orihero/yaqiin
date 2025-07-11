import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllUsers } from '../../../services/userService';
import { getAllShops } from '../../../services/shopService';
import { getAllProducts } from '../../../services/productService';
import { getAllCouriers } from '../../../services/courierService';
import { Order } from '@yaqiin/shared/types/order';

interface OrderFormModalProps {
  open?: boolean;
  order?: Order;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit?: (values: any) => void;
}

export default function OrderFormModal({ open = true, order, loading = false, error, onClose, onSubmit }: OrderFormModalProps) {
  const isEdit = !!order;
  const [customerId, setCustomerId] = useState(order?.customerId || '');
  const [shopId, setShopId] = useState(order?.shopId || '');
  const [items, setItems] = useState(order?.items || []);
  const [total, setTotal] = useState(order?.pricing.total || 0);
  const [status, setStatus] = useState(order?.status || 'pending');
  const [notes, setNotes] = useState(order?.notes || '');
  const [address, setAddress] = useState(order?.deliveryAddress || { street: '', city: '', district: '', coordinates: { lat: 0, lng: 0 }, notes: '' });
  const [paymentMethod, setPaymentMethod] = useState(order?.paymentMethod || 'cash_on_delivery');
  const [paymentStatus, setPaymentStatus] = useState(order?.paymentStatus || 'pending');
  const [formError, setFormError] = useState<string | null>(null);
  const [courierId, setCourierId] = useState(order?.courierId || '');
  const [deliveryFee, setDeliveryFee] = useState(order?.pricing.deliveryFee || 0);
  const [serviceFee, setServiceFee] = useState(order?.pricing.serviceFee || 0);
  const [tax, setTax] = useState(order?.pricing.tax || 0);
  const [discount, setDiscount] = useState(order?.pricing.discount || 0);
  const [scheduledDate, setScheduledDate] = useState(order?.scheduledDelivery?.date ? new Date(order.scheduledDelivery.date).toISOString().slice(0, 10) : '');
  const [scheduledTimeSlot, setScheduledTimeSlot] = useState(order?.scheduledDelivery?.timeSlot || '');
  const [adminNotes, setAdminNotes] = useState(order?.adminNotes || '');
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState(order?.estimatedDeliveryTime ? new Date(order.estimatedDeliveryTime).toISOString().slice(0, 16) : '');
  const [actualDeliveryTime, setActualDeliveryTime] = useState(order?.actualDeliveryTime ? new Date(order.actualDeliveryTime).toISOString().slice(0, 16) : '');

  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: getAllUsers,
  });
  const { data: shops, isLoading: loadingShops } = useQuery({
    queryKey: ['shops', 'all'],
    queryFn: getAllShops,
  });
  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['products', 'all'],
    queryFn: getAllProducts,
  });
  const { data: couriers, isLoading: loadingCouriers } = useQuery({
    queryKey: ['couriers', 'all'],
    queryFn: getAllCouriers,
  });

  React.useEffect(() => {
    if (order) {
      setCustomerId(order.customerId || '');
      setShopId(order.shopId || '');
      setItems(order.items || []);
      setTotal(order.pricing.total || 0);
      setStatus(order.status || 'pending');
      setNotes(order.notes || '');
      setAddress(order.deliveryAddress || { street: '', city: '', district: '', coordinates: { lat: 0, lng: 0 }, notes: '' });
      setPaymentMethod(order.paymentMethod || 'cash_on_delivery');
      setPaymentStatus(order.paymentStatus || 'pending');
      setCourierId(order.courierId || '');
      setDeliveryFee(order.pricing.deliveryFee || 0);
      setServiceFee(order.pricing.serviceFee || 0);
      setTax(order.pricing.tax || 0);
      setDiscount(order.pricing.discount || 0);
      setScheduledDate(order.scheduledDelivery?.date ? new Date(order.scheduledDelivery.date).toISOString().slice(0, 10) : '');
      setScheduledTimeSlot(order.scheduledDelivery?.timeSlot || '');
      setAdminNotes(order.adminNotes || '');
      setEstimatedDeliveryTime(order.estimatedDeliveryTime ? new Date(order.estimatedDeliveryTime).toISOString().slice(0, 16) : '');
      setActualDeliveryTime(order.actualDeliveryTime ? new Date(order.actualDeliveryTime).toISOString().slice(0, 16) : '');
    }
  }, [order]);

  if (!open) return null;

  // Order items logic
  const handleAddItem = () => {
    setItems([...items, { productId: '', name: '', price: 0, quantity: 1, unit: '', subtotal: 0 }]);
  };
  const handleItemChange = (idx: number, field: string, value: any) => {
    const updated = items.map((item, i) =>
      i === idx ? { ...item, [field]: value, subtotal: field === 'quantity' || field === 'price' ? (field === 'quantity' ? value * item.price : item.quantity * value) : item.subtotal } : item
    );
    setItems(updated);
    setTotal(updated.reduce((sum, item) => sum + (item.subtotal || 0), 0));
  };
  const handleProductSelect = (idx: number, productId: string) => {
    const product = products?.find((p: any) => p._id === productId);
    if (!product) return;
    const updated = items.map((item, i) =>
      i === idx ? { ...item, productId, name: product.name.uz, price: product.price, unit: product.unit, subtotal: product.price * item.quantity } : item
    );
    setItems(updated);
    setTotal(updated.reduce((sum, item) => sum + (item.subtotal || 0), 0));
  };
  const handleRemoveItem = (idx: number) => {
    const updated = items.filter((_, i) => i !== idx);
    setItems(updated);
    setTotal(updated.reduce((sum, item) => sum + (item.subtotal || 0), 0));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !shopId || !items.length || !address.street || !address.city || !address.district) {
      setFormError('Please fill in all required fields.');
      return;
    }
    setFormError(null);
    const orderData: any = {
      customerId,
      shopId,
      items,
      pricing: {
        total,
        itemsTotal: total,
        deliveryFee,
        serviceFee,
        tax,
        discount,
      },
      deliveryAddress: address,
      paymentMethod,
      paymentStatus,
      notes,
      adminNotes,
      scheduledDelivery: scheduledDate && scheduledTimeSlot ? { date: new Date(scheduledDate), timeSlot: scheduledTimeSlot } : undefined,
      estimatedDeliveryTime: estimatedDeliveryTime ? new Date(estimatedDeliveryTime) : undefined,
      actualDeliveryTime: actualDeliveryTime ? new Date(actualDeliveryTime) : undefined,
    };
    if (courierId) orderData.courierId = courierId;
    if (!order) orderData.status = 'created';
    else orderData.status = status;
    if (onSubmit) {
      onSubmit(orderData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-all"
        style={{ backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 h-full w-full max-w-xl bg-[#232b42] shadow-2xl p-8 overflow-y-auto transition-transform duration-300 transform translate-x-0">
        <h2 className="text-xl font-bold mb-4 text-white">{isEdit ? 'Edit Order' : 'Add Order'}</h2>
        {error && <div className="text-red-400 mb-2">{error}</div>}
        {formError && <div className="text-red-400 mb-2">{formError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-white">Customer *</label>
              {loadingUsers ? (
                <p className="text-gray-400">Loading users...</p>
              ) : (
                <select className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" value={customerId} onChange={e => setCustomerId(e.target.value)} required>
                  <option value="">Select customer</option>
                  {users?.map((user: any) => (
                    <option key={user._id} value={user._id}>{user.firstName} {user.lastName} ({user.username})</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block mb-1 text-white">Shop *</label>
              {loadingShops ? (
                <p className="text-gray-400">Loading shops...</p>
              ) : (
                <select className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" value={shopId} onChange={e => setShopId(e.target.value)} required>
                  <option value="">Select shop</option>
                  {shops?.map((shop: any) => (
                    <option key={shop._id} value={shop._id}>{shop.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <div className="mt-6">
            <label className="block mb-2 text-white font-semibold">Order Items *</label>
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2 items-end">
                <select className="px-2 py-1 rounded bg-[#1a2236] text-white" value={item.productId} onChange={e => handleProductSelect(idx, e.target.value)} required>
                  <option value="">Product</option>
                  {products?.map((p: any) => (
                    <option key={p._id} value={p._id}>{p.name.uz}</option>
                  ))}
                </select>
                <input type="number" className="w-20 px-2 py-1 rounded bg-[#1a2236] text-white" value={item.quantity} min={1} onChange={e => handleItemChange(idx, 'quantity', Number(e.target.value))} required />
                <span className="w-20">{item.price}</span>
                <span className="w-20">{item.subtotal}</span>
                <button type="button" className="text-red-400 px-2" onClick={() => handleRemoveItem(idx)}>✕</button>
              </div>
            ))}
            <button type="button" className="mt-2 px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white" onClick={handleAddItem}>Add Item</button>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-white">Street *</label>
              <input className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} required />
            </div>
            <div>
              <label className="block mb-1 text-white">City *</label>
              <input className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} required />
            </div>
            <div>
              <label className="block mb-1 text-white">District *</label>
              <input className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" value={address.district} onChange={e => setAddress({ ...address, district: e.target.value })} required />
            </div>
            <div>
              <label className="block mb-1 text-white">Address Notes</label>
              <input className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" value={address.notes} onChange={e => setAddress({ ...address, notes: e.target.value })} />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-white">Courier</label>
              {loadingCouriers ? (
                <p className="text-gray-400">Loading couriers...</p>
              ) : (
                <select className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" value={courierId} onChange={e => setCourierId(e.target.value)}>
                  <option value="">Select courier</option>
                  {couriers?.map((courier: any) => (
                    <option key={courier._id} value={courier._id}>
                      {courier.userId?.firstName || ''} {courier.userId?.lastName || ''} {courier.userId?.username ? `(${courier.userId.username})` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block mb-1 text-white">Delivery Fee</label>
              <input type="number" className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" value={deliveryFee} min={0} onChange={e => setDeliveryFee(Number(e.target.value))} />
            </div>
            <div>
              <label className="block mb-1 text-white">Service Fee</label>
              <input type="number" className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" value={serviceFee} min={0} onChange={e => setServiceFee(Number(e.target.value))} />
            </div>
            <div>
              <label className="block mb-1 text-white">Tax</label>
              <input type="number" className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" value={tax} min={0} onChange={e => setTax(Number(e.target.value))} />
            </div>
            <div>
              <label className="block mb-1 text-white">Discount</label>
              <input type="number" className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" value={discount} min={0} onChange={e => setDiscount(Number(e.target.value))} />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-white">Scheduled Delivery Date</label>
              <input type="date" className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} />
            </div>
            <div>
              <label className="block mb-1 text-white">Scheduled Time Slot</label>
              <input className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" value={scheduledTimeSlot} onChange={e => setScheduledTimeSlot(e.target.value)} />
            </div>
            <div>
              <label className="block mb-1 text-white">Estimated Delivery Time</label>
              <input type="datetime-local" className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" value={estimatedDeliveryTime} onChange={e => setEstimatedDeliveryTime(e.target.value)} />
            </div>
            <div>
              <label className="block mb-1 text-white">Actual Delivery Time</label>
              <input type="datetime-local" className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" value={actualDeliveryTime} onChange={e => setActualDeliveryTime(e.target.value)} />
            </div>
          </div>
          <div className="mt-6">
            <label className="block mb-1 text-white">Admin Notes</label>
            <textarea className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" rows={2} value={adminNotes} onChange={e => setAdminNotes(e.target.value)} />
          </div>
          <div className="mt-6">
            <label className="block mb-1 text-white">Payment Method *</label>
            <select className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as 'cash_on_delivery' | 'bank_transfer')} required>
              <option value="cash_on_delivery">Cash on Delivery</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>
          <div className="mt-6">
            <label className="block mb-1 text-white">Payment Status *</label>
            <select className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" value={paymentStatus} onChange={e => setPaymentStatus(e.target.value as 'pending' | 'paid' | 'failed')} required>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="mt-6">
            <label className="block mb-1 text-white">Order Notes</label>
            <textarea className="w-full px-3 py-2 rounded bg-[#1a2236] text-white" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700" onClick={onClose}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600" disabled={loading}>{loading ? (isEdit ? 'Saving...' : 'Creating...') : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
} 