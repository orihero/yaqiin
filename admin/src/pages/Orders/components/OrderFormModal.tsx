import { Order } from '@yaqiin/shared/types/order';
import debounce from 'lodash.debounce';
import React, { useEffect, useMemo, useState } from 'react';
import AsyncSelect from 'react-select/async';
import { getProducts } from '../../../services/productService';
import { getShopCouriers, getShops } from '../../../services/shopService';
import { getUsers } from '../../../services/userService';

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
  // Store selected user as an object
  const [selectedUser, setSelectedUser] = useState<{ value: string; label: string } | null>(order ? {
    value: order.customerId,
    label: `${order.customerId}` // You may want to fetch/display the label if editing
  } : null);
  const [selectedShop, setSelectedShop] = useState<{ value: string; label: string } | null>(order ? {
    value: order.shopId,
    label: `${order.shopId}` // You may want to fetch/display the label if editing
  } : null);
  const [items, setItems] = useState<UIOrderItem[]>(
    order?.items
      ? order.items.map((item) => ({
          ...item,
          uiProduct: item.productId ? { value: item.productId, label: item.name || item.productId } : null,
        }))
      : []
  );
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
  const [selectedCourier, setSelectedCourier] = useState<{ value: string; label: string } | null>(order?.courierId ? {
    value: order.courierId,
    label: order.courierId,
  } : null);
  const [defaultClientOptions, setDefaultClientOptions] = useState<{ value: string; label: string }[]>([]);
  const [defaultCourierOptions, setDefaultCourierOptions] = useState<{ value: string; label: string }[]>([]);
  const [defaultProductOptions, setDefaultProductOptions] = useState<{ value: string; label: string; price?: number; unit?: string }[]>([]);

  // Debounced async loaders for react-select
  // Update client async loader to filter by shopId and role, and limit to 5
  const debouncedUserLoader = useMemo(
    () =>
      debounce((inputValue: string, callback: (options: { value: string; label: string }[]) => void) => {
        if (!selectedShop?.value) {
          callback([]);
          return;
        }
        getUsers(1, 5, inputValue).then(res => {
          callback(
            (res.data || [])
              .filter((user: any) => user.role === 'client' && String(user.shopId) === String(selectedShop.value))
              .map((user: any) => ({
                value: user._id,
                label: `${user.firstName} ${user.lastName} (${user.username})`,
              }))
          );
        });
      }, 300),
    [selectedShop]
  );

  // Update courier async loader to fetch from getShopCouriers and limit to 5
  const loadCourierOptions = useMemo(
    () =>
      debounce((inputValue: string, callback: (options: { value: string; label: string }[]) => void) => {
        if (!selectedShop?.value) {
          callback([]);
          return;
        }
        getShopCouriers(selectedShop.value).then(res => {
          const filtered = (res.data || [])
            .filter((courier: any) => {
              if (!inputValue) return true;
              return (
                (courier.firstName && courier.firstName.toLowerCase().includes(inputValue.toLowerCase())) ||
                (courier.lastName && courier.lastName.toLowerCase().includes(inputValue.toLowerCase())) ||
                (courier.username && courier.username.toLowerCase().includes(inputValue.toLowerCase()))
              );
            })
            .slice(0, 5); // Limit to 5 couriers
          callback(
            filtered.map((courier: any) => ({
              value: courier._id,
              label: getCourierLabel(courier),
            }))
          );
        });
      }, 300),
    [selectedShop]
  );

  // Update product async loader to filter by shopId and limit to 5
  const loadProductOptions = useMemo(
    () =>
      debounce((inputValue: string, callback: (options: { value: string; label: string; price?: number; unit?: string }[]) => void) => {
        if (!selectedShop?.value) {
          callback([]);
          return;
        }
        getProducts(1, 5, inputValue).then(res => {
          callback(
            (res.data || [])
              .filter((p: any) => String(p.shopId) === String(selectedShop.value))
              .map((p: any) => ({
                value: p._id,
                label: p.name.uz,
                price: p.price,
                unit: p.unit,
              }))
          );
        });
      }, 300),
    [selectedShop]
  );

  useEffect(() => {
    if (!selectedShop?.value) {
      setDefaultClientOptions([]);
      setDefaultCourierOptions([]);
      setDefaultProductOptions([]);
      return;
    }
    // Fetch clients
    getUsers(1, 5, '').then(res => {
      setDefaultClientOptions(
        (res.data || [])
          .filter((user: any) => user.role === 'client' && String(user.shopId) === String(selectedShop.value))
          .map((user: any) => ({
            value: user._id,
            label: `${user.firstName} ${user.lastName} (${user.username})`,
          }))
      );
    });
    // Fetch couriers
    getShopCouriers(selectedShop.value).then(res => {
      setDefaultCourierOptions(
        (res.data || [])
          .slice(0, 5)
          .map((courier: any) => ({
            value: courier._id,
            label: getCourierLabel(courier),
          }))
      );
    });
    // Fetch products
    getProducts(1, 5, '').then(res => {
      setDefaultProductOptions(
        (res.data || [])
          .filter((p: any) => String(p.shopId) === String(selectedShop.value))
          .map((p: any) => ({
            value: p._id,
            label: p.name.uz,
            price: p.price,
            unit: p.unit,
          }))
      );
    });
  }, [selectedShop]);

  React.useEffect(() => {
    if (order) {
      setSelectedUser(order.customerId ? { value: order.customerId, label: `${order.customerId}` } : null);
      setSelectedShop(order.shopId ? { value: order.shopId, label: `${order.shopId}` } : null);
      setSelectedCourier(order.courierId ? { value: order.courierId, label: order.courierId } : null);
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
  type UIOrderItem = {
    uiProduct?: { value: string; label: string; price?: number; unit?: string } | null;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    unit: string;
    subtotal: number;
    // ...other OrderItem fields if needed
  };
  const handleAddItem = () => {
    setItems([
      ...items,
      {
        uiProduct: null,
        productId: '',
        name: '',
        price: 0,
        quantity: 1,
        unit: '',
        subtotal: 0,
      },
    ]);
  };
  const handleItemChange = (idx: number, field: string, value: any) => {
    const updated = items.map((item, i) => {
      if (i !== idx) return item;
      let price = item.price;
      if (field === 'price') price = value;
      if (field === 'uiProduct' && value && value.price) price = value.price;
      return {
        ...item,
        [field]: value,
        subtotal:
          field === 'quantity' || field === 'price' || field === 'uiProduct'
            ? (field === 'quantity'
                ? value * price
                : item.quantity * price)
            : item.subtotal,
        price,
      };
    });
    setItems(updated);
    setTotal(updated.reduce((sum, item) => sum + (item.subtotal || 0), 0));
  };
  const handleProductSelect = (idx: number, productOption: { value: string; label: string; price?: number; unit?: string }) => {
    setItems(items => items.map((item, i) =>
      i === idx
        ? {
            ...item,
            uiProduct: productOption,
            productId: productOption.value,
            name: productOption.label,
            price: productOption.price ?? 0,
            unit: productOption.unit ?? '',
            subtotal: (item.quantity || 1) * (productOption.price ?? 0),
          }
        : item
    ));
    setTotal(items.reduce((sum, item, i) => sum + (i === idx ? ((item.quantity || 1) * (productOption.price ?? 0)) : (item.subtotal || 0)), 0));
  };
  const handleRemoveItem = (idx: number) => {
    const updated = items.filter((_, i) => i !== idx);
    setItems(updated);
    setTotal(updated.reduce((sum, item) => sum + (item.subtotal || 0), 0));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser?.value || !selectedShop?.value || !items.length || !address.street || !address.city || !address.district) {
      setFormError('Please fill in all required fields.');
      return;
    }
    setFormError(null);
    const orderData: any = {
      customerId: selectedUser?.value,
      shopId: selectedShop?.value,
      items: items.map((item: any) => ({
        productId: item.uiProduct?.value,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        unit: item.unit,
        subtotal: item.subtotal,
      })),
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
    if (selectedCourier?.value) orderData.courierId = selectedCourier.value;
    if (!order) orderData.status = 'created';
    else orderData.status = status;
    if (onSubmit) {
      onSubmit(orderData);
    }
    onClose();
  };

  // Helper for courier label
  function getCourierLabel(courier: any) {
    return `${courier.firstName || ''} ${courier.lastName || ''} ${courier.username ? `(${courier.username})` : ''}`.trim();
  }

  // Dark theme styles for react-select
  const selectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: '#1a2236',
      color: 'white',
      borderColor: state.isFocused ? '#2563eb' : '#232b42',
      boxShadow: state.isFocused ? '0 0 0 1px #2563eb' : 'none',
      minHeight: '40px',
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: '#232b42',
      color: 'white',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#2563eb'
        : state.isFocused
        ? '#232b42'
        : '#1a2236',
      color: 'white',
      cursor: 'pointer',
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: 'white',
    }),
    input: (provided: any) => ({
      ...provided,
      color: 'white',
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#a3a3a3',
    }),
    dropdownIndicator: (provided: any) => ({
      ...provided,
      color: '#a3a3a3',
    }),
    indicatorSeparator: (provided: any) => ({
      ...provided,
      backgroundColor: '#232b42',
    }),
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-all"
        style={{ backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 h-full w-1/2 bg-[#232b42] shadow-2xl p-8 overflow-y-auto transition-transform duration-300 transform translate-x-0">
        <h2 className="text-xl font-bold mb-4 text-white">{isEdit ? 'Edit Order' : 'Add Order'}</h2>
        {error && <div className="text-red-400 mb-2">{error}</div>}
        {formError && <div className="text-red-400 mb-2">{formError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-white">Shop *</label>
              <AsyncSelect
                classNamePrefix="react-select"
                className="w-full"
                styles={selectStyles}
                isClearable
                isSearchable
                placeholder="Select shop"
                cacheOptions
                defaultOptions
                loadOptions={(inputValue, callback) => {
                  if (!inputValue) {
                    getShops(1, 5, '').then(res => {
                      callback(
                        (res.data || []).map((shop: any) => ({
                          value: shop._id,
                          label: shop.name,
                        }))
                      );
                    });
                    return;
                  }
                  getShops(1, 20, inputValue).then(res => {
                    callback(
                      (res.data || []).map((shop: any) => ({
                        value: shop._id,
                        label: shop.name,
                      }))
                    );
                  });
                }}
                value={selectedShop}
                onChange={option => setSelectedShop(option)}
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-white">Client</label>
              <AsyncSelect
                classNamePrefix="react-select"
                className="w-full"
                styles={selectStyles}
                isClearable
                isSearchable
                placeholder="Select client"
                cacheOptions
                defaultOptions={defaultClientOptions}
                loadOptions={debouncedUserLoader}
                value={selectedUser}
                onChange={option => setSelectedUser(option)}
                isDisabled={!selectedShop}
              />
            </div>
            <div>
              <label className="block mb-1 text-white">Courier</label>
              <AsyncSelect
                classNamePrefix="react-select"
                className="w-full"
                styles={selectStyles}
                isClearable
                isSearchable
                placeholder="Select courier"
                cacheOptions
                defaultOptions={defaultCourierOptions}
                loadOptions={loadCourierOptions}
                value={selectedCourier}
                onChange={option => setSelectedCourier(option)}
                isDisabled={!selectedShop}
              />
            </div>
            <div>
              <label className="block mb-1 text-white">Products</label>
              <AsyncSelect
                classNamePrefix="react-select"
                className="w-full"
                styles={selectStyles}
                isClearable
                isSearchable
                placeholder="Select product"
                cacheOptions
                defaultOptions={defaultProductOptions}
                loadOptions={(inputValue, callback) => {
                  if (!selectedShop?.value) {
                    callback([]);
                    return;
                  }
                  getProducts(1, 5, inputValue).then(res => {
                    callback(
                      (res.data || [])
                        .filter((p: any) => String(p.shopId) === String(selectedShop.value))
                        .map((p: any) => ({
                          value: p._id,
                          label: p.name.uz,
                          price: p.price,
                          unit: p.unit,
                        }))
                    );
                  });
                }}
                value={items.map(item => item.uiProduct ?? (item.productId ? { value: item.productId, label: item.name || item.productId } : null))}
                onChange={(options) => {
                  if (!options) return;
                  const arr = Array.isArray(options) ? options : [options];
                  const newItems = arr.map((opt, idx) => ({
                    uiProduct: opt,
                    productId: opt.value,
                    name: opt.label,
                    price: opt.price ?? 0,
                    unit: opt.unit ?? '',
                    quantity: 1,
                    subtotal: (opt.price ?? 0),
                  }));
                  setItems(newItems);
                  setTotal(newItems.reduce((sum, item) => sum + (item.subtotal || 0), 0));
                }}
                isDisabled={!selectedShop}
              />
            </div>
          </div>
          <div className="mt-6">
            <label className="block mb-2 text-white font-semibold">Order Items *</label>
            {items.map((item: any, idx: number) => (
              <div key={idx} className="flex gap-2 mb-2 items-end">
                <div className="min-w-[180px]">
                  <AsyncSelect
                    classNamePrefix="react-select"
                    className="w-full"
                    styles={selectStyles}
                    isClearable
                    isSearchable
                    placeholder="Product"
                    cacheOptions
                    defaultOptions
                    loadOptions={(inputValue, callback) => {
                      if (!selectedShop?.value) {
                        callback([]);
                        return;
                      }
                      getProducts(1, 5, inputValue).then(res => {
                        callback(
                          (res.data || [])
                            .filter((p: any) => String(p.shopId) === String(selectedShop.value))
                            .map((p: any) => ({
                              value: p._id,
                              label: p.name.uz,
                              price: p.price,
                              unit: p.unit,
                            }))
                        );
                      });
                    }}
                    value={item.uiProduct ?? (item.productId ? { value: item.productId, label: item.name || item.productId } : null)}
                    onChange={option => handleProductSelect(idx, option as any)}
                    required
                  />
                </div>
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