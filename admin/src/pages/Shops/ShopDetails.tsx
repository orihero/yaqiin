import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Order } from '@yaqiin/shared/types/order';
import { Shop } from '@yaqiin/shared/types/shop';
import { User } from '@yaqiin/shared/types/user';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getOrdersByShop } from 'src/services/deliveryService';
import { assignCourierToShop, getShop, getShopAvailableCouriers, getShopCouriers, unassignCourierFromShop, updateShop } from '../../services/shopService';
import { getUsers } from '../../services/userService';
import ShopFormModal from './components/ShopFormModal';

const TABS = [
  { key: 'info', label: 'Shop Info' },
  { key: 'orders', label: 'Shop Orders' },
  { key: 'couriers', label: 'Shop Couriers' },
];

export default function ShopDetails() {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('info');
  const [editingRegion, setEditingRegion] = useState(false);
  const [drawnPolygon, setDrawnPolygon] = useState<{ lat: number; lng: number }[] | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [tempPolygon, setTempPolygon] = useState<{ lat: number; lng: number }[]>([]);
  const [editShopModalOpen, setEditShopModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(false);
  const [tempLocation, setTempLocation] = useState<{ lat: number; lng: number } | null>(null);

  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const polygonLayerRef = useRef<any>(null);
  const tempLayerRef = useRef<any>(null);

  const queryClient = useQueryClient();
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch shop details
  const { data: shopData, isLoading, error } = useQuery<{ success: boolean; data: Shop }, Error>({
    queryKey: ['shop', shopId],
    queryFn: () => getShop(shopId!),
    enabled: !!shopId,
  });

  // Fetch users for owner display
  const { data: usersData } = useQuery<{ success: boolean; data: User[] }, Error>({
    queryKey: ['users', 1, 1000, ''],
    queryFn: () => getUsers(1, 1000, ''),
  });
  const userMap = React.useMemo(() => {
    const map: Record<string, User> = {};
    usersData?.data?.forEach((u) => { map[u._id] = u; });
    return map;
  }, [usersData]);

  // Fetch deliveries (orders) for this shop
  const { data: deliveriesData, isLoading: deliveriesLoading, error: deliveriesError } = useQuery<{ success: boolean; data: Order[]; meta: any }, Error>({
    queryKey: ['shop-deliveries', shopId],
    queryFn: () => getOrdersByShop(shopId!),
    enabled: !!shopId && tab === 'orders',
  });

  // Fetch assigned couriers for this shop
  const { data: assignedCouriersData, isLoading: assignedCouriersLoading, error: assignedCouriersError, refetch: refetchAssignedCouriers } = useQuery({
    queryKey: ['shop-assigned-couriers', shopId],
    queryFn: () => getShopCouriers(shopId!),
    enabled: tab === 'couriers' && !!shopId,
  });
  // Fetch available couriers for this shop
  const { data: availableCouriersData, isLoading: availableCouriersLoading, error: availableCouriersError, refetch: refetchAvailableCouriers } = useQuery({
    queryKey: ['shop-available-couriers', shopId],
    queryFn: () => getShopAvailableCouriers(shopId!),
    enabled: tab === 'couriers' && !!shopId,
  });
  const assignCourierMutation = useMutation({
    mutationFn: ({ shopId, courierId }: { shopId: string, courierId: string }) => assignCourierToShop(shopId, courierId),
    onSuccess: () => {
      refetchAssignedCouriers();
      refetchAvailableCouriers();
    },
  });
  const unassignCourierMutation = useMutation({
    mutationFn: ({ shopId, courierId }: { shopId: string, courierId: string }) => unassignCourierFromShop(shopId, courierId),
    onSuccess: () => {
      refetchAssignedCouriers();
      refetchAvailableCouriers();
    },
  });

  useEffect(() => {
    let leaflet: any;
    if (tab === 'info' && shopData?.data?.address?.coordinates) {
      const { lat, lng } = shopData.data.address.coordinates;
      if (typeof lat === 'number' && typeof lng === 'number') {
        import('leaflet').then(L => {
          leaflet = L;
          if (!mapRef.current) {
            mapRef.current = L.map('shop-map', {
              dragging: true, // Always allow dragging
              scrollWheelZoom: true, // Always allow scroll zoom
              doubleClickZoom: !editingRegion,
              boxZoom: !editingRegion,
              keyboard: !editingRegion,
            }).setView([lat, lng], 16);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; OpenStreetMap contributors',
            }).addTo(mapRef.current);
            markerRef.current = L.marker([lat, lng]).addTo(mapRef.current).bindPopup(shopData.data.name).openPopup();
          } else {
            mapRef.current.setView([lat, lng], 16);
            mapRef.current.dragging.enable();
            mapRef.current.scrollWheelZoom.enable();
            mapRef.current.doubleClickZoom[!editingRegion ? 'enable' : 'disable']();
            mapRef.current.boxZoom[!editingRegion ? 'enable' : 'disable']();
            mapRef.current.keyboard[!editingRegion ? 'enable' : 'disable']();
          }

          // Remove old polygon layer
          if (polygonLayerRef.current) {
            mapRef.current.removeLayer(polygonLayerRef.current);
            polygonLayerRef.current = null;
          }
          // Show existing polygon if present and not editing
          const deliveryZone = shopData.data.deliveryZones?.[0];
          if (!editingRegion && deliveryZone && deliveryZone.polygon && deliveryZone.polygon.length > 2) {
            polygonLayerRef.current = L.polygon(deliveryZone.polygon.map(p => [p.lat, p.lng]), { color: 'blue' }).addTo(mapRef.current);
            mapRef.current.fitBounds(polygonLayerRef.current.getBounds());
          }

          // Remove old temp layer
          if (tempLayerRef.current) {
            mapRef.current.removeLayer(tempLayerRef.current);
            tempLayerRef.current = null;
          }

          // Remove old marker if editing location
          if (editingLocation && markerRef.current) {
            mapRef.current.removeLayer(markerRef.current);
            markerRef.current = null;
          }

          // Add marker for temp location if editing
          if (editingLocation && tempLocation) {
            markerRef.current = L.marker([tempLocation.lat, tempLocation.lng]).addTo(mapRef.current).bindPopup('New Location').openPopup();
          } else if (!editingLocation) {
            // Show original marker
            if (markerRef.current) mapRef.current.removeLayer(markerRef.current);
            markerRef.current = L.marker([lat, lng]).addTo(mapRef.current).bindPopup(shopData.data.name).openPopup();
          }

          // Add click handler for drawing/editing
          if (editingRegion) {
            mapRef.current.on('click', handleMapClick);
          } else {
            mapRef.current.off('click', handleMapClick);
          }
          if (editingLocation) {
            mapRef.current.on('click', handleMapLocationClick);
          } else {
            mapRef.current.off('click', handleMapLocationClick);
          }
        });
      }
    }
    return () => {
      // Do not remove the map instance on cleanup, only on component unmount
    };
  }, [tab, shopData, editingRegion, editingLocation, tempLocation]);

  // Custom handler for map click to add polygon points
  const handleMapClick = (e: any) => {
    setTempPolygon(prev => [...prev, { lat: e.latlng.lat, lng: e.latlng.lng }]);
  };

  // Handler for editing shop location
  const handleMapLocationClick = (e: any) => {
    setTempLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
  };

  // Update temp polygon layer when tempPolygon changes
  useEffect(() => {
    if (mapRef.current) {
      if (tempLayerRef.current) {
        mapRef.current.removeLayer(tempLayerRef.current);
        tempLayerRef.current = null;
      }
      if (editingRegion && tempPolygon.length > 0) {
        import('leaflet').then(L => {
          tempLayerRef.current = L.polygon(tempPolygon.map(p => [p.lat, p.lng]), { color: 'red', dashArray: '5, 5' }).addTo(mapRef.current);
        });
      }
    }
  }, [tempPolygon, editingRegion]);

  // Reset map on component unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const handleSavePolygon = async () => {
    if (!drawnPolygon || !shopData?.data?._id) return;
    setSaveLoading(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await updateShop({
        _id: shopData.data._id,
        deliveryZones: [{
          name: 'Default Zone',
          polygon: drawnPolygon,
          deliveryFee: shopData.data.deliveryZones?.[0]?.deliveryFee || 0,
          minOrderAmount: shopData.data.deliveryZones?.[0]?.minOrderAmount || 0,
          estimatedDeliveryTime: shopData.data.deliveryZones?.[0]?.estimatedDeliveryTime || 0,
        }],
      });
      setSaveSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['shop', shopData.data._id] });
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to save region');
    } finally {
      setSaveLoading(false);
    }
  };

  // Save new shop location
  const handleSaveLocation = async () => {
    if (!tempLocation || !shopData?.data?._id) return;
    setSaveLoading(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await updateShop({
        _id: shopData.data._id,
        address: {
          ...shopData.data.address,
          coordinates: tempLocation,
        },
      });
      setSaveSuccess(true);
      setEditingLocation(false);
      setTempLocation(null);
      queryClient.invalidateQueries({ queryKey: ['shop', shopData.data._id] });
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to save location');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-[#1a2236] text-white">
      <button className="mb-4 text-blue-400 hover:underline" onClick={() => navigate(-1)}>
        ← Back to Shops
      </button>
      <h1 className="text-2xl font-bold mb-6">Shop Details</h1>
      <div className="flex gap-4 mb-6">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`px-4 py-2 rounded-t-lg font-semibold ${tab === t.key ? 'bg-[#232b42] text-blue-300' : 'bg-[#232b42] text-gray-400'}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="bg-[#232b42] rounded-xl p-6 min-h-[300px]">
        {tab === 'info' && (
          isLoading ? <div>Loading...</div> : error ? <div className="text-red-400">{String(error.message)}</div> : shopData ? (
            <div className="space-y-4">
              <div><span className="font-semibold">Name:</span> {shopData.data.name}</div>
              <div><span className="font-semibold">Owner:</span> {
                userMap[shopData.data.ownerId]
                  ? `${userMap[shopData.data.ownerId].firstName || ''} ${userMap[shopData.data.ownerId].lastName || ''}`.trim() || userMap[shopData.data.ownerId].username || shopData.data.ownerId
                  : shopData.data.ownerId
              }</div>
              <div><span className="font-semibold">Phone:</span> {shopData.data.contactInfo?.phoneNumber}</div>
              <div><span className="font-semibold">City:</span> {shopData.data.address?.city}</div>
              <div><span className="font-semibold">Status:</span> <span className="capitalize">{shopData.data.status}</span></div>
              <div className="flex gap-4 mt-4">
                <button
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded font-semibold"
                  onClick={() => {
                    setEditingRegion(!editingRegion);
                    setTempPolygon([]);
                    setDrawing(false);
                    setSaveSuccess(false);
                    setSaveError(null);
                  }}
                >
                  {editingRegion ? 'Cancel Edit' : 'Edit Delivery Region'}
                </button>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold"
                  onClick={() => setEditShopModalOpen(true)}
                >
                  ✏️ Edit Shop
                </button>
                <button
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded font-semibold"
                  onClick={() => {
                    setEditingLocation(!editingLocation);
                    setTempLocation(null);
                    setSaveSuccess(false);
                    setSaveError(null);
                  }}
                >
                  {editingLocation ? 'Cancel Location Edit 📍' : 'Edit Location 📍'}
                </button>
                {editingLocation && tempLocation && (
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold"
                    onClick={handleSaveLocation}
                    disabled={saveLoading}
                  >
                    {saveLoading ? 'Saving...' : 'Save Location'}
                  </button>
                )}
                {editingRegion && tempPolygon.length > 2 && (
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold"
                    onClick={() => {
                      setDrawnPolygon(tempPolygon);
                      setEditingRegion(false);
                      setDrawing(false);
                    }}
                  >
                    Finish Polygon
                  </button>
                )}
                {!editingRegion && drawnPolygon && (
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
                    onClick={handleSavePolygon}
                    disabled={saveLoading}
                  >
                    {saveLoading ? 'Saving...' : 'Save Region'}
                  </button>
                )}
              </div>
              {saveError && <div className="text-red-400 mt-2">{saveError}</div>}
              {saveSuccess && <div className="text-green-400 mt-2">Saved successfully!</div>}
              {/* Map Section moved here */}
              <div className="mt-6">
                {shopData?.data?.address?.coordinates && typeof shopData.data.address.coordinates.lat === 'number' && typeof shopData.data.address.coordinates.lng === 'number' ? (
                  <>
                    <style>{`.leaflet-container, .leaflet-control { z-index: 10 !important; }`}</style>
                    <div id="shop-map" style={{ height: 350, width: '100%', borderRadius: 12, overflow: 'hidden', zIndex: 10, position: 'relative' }} />
                    {editingLocation && (
                      <div className="text-sm text-blue-300 mt-2">Tip: Drag and zoom the map to find the right spot, then click to set the new shop location. 🗺️</div>
                    )}
                  </>
                ) : (
                  <div className="text-gray-400">No location data for this shop.</div>
                )}
              </div>
              <ShopFormModal
                open={editShopModalOpen}
                mode="edit"
                initialValues={shopData.data}
                onClose={() => setEditShopModalOpen(false)}
                onSubmit={async (values) => {
                  setSaveLoading(true);
                  setSaveError(null);
                  setSaveSuccess(false);
                  try {
                    await updateShop({ ...values, _id: shopData.data._id });
                    setEditShopModalOpen(false);
                    setSaveSuccess(true);
                    queryClient.invalidateQueries({ queryKey: ['shop', shopData.data._id] });
                  } catch (err: any) {
                    setSaveError(err?.message || 'Failed to update shop');
                  } finally {
                    setSaveLoading(false);
                  }
                }}
              />
            </div>
          ) : <div>No shop data found.</div>
        )}
        {tab === 'orders' && (
          <div>
            {/* Orders List (was Deliveries) */}
            <h2 className="text-lg font-semibold mb-2">Orders</h2>
            {deliveriesLoading ? (
              <div>Loading orders...</div>
            ) : deliveriesError ? (
              <div className="text-red-400">{String(deliveriesError.message)}</div>
            ) : !deliveriesData?.data?.length ? (
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
                  {deliveriesData.data.map((order: Order) => (
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
        )}
        {tab === 'couriers' && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Assigned Couriers</h2>
            {assignedCouriersLoading ? (
              <div>Loading assigned couriers...</div>
            ) : assignedCouriersError ? (
              <div className="text-red-400">{String(assignedCouriersError.message)}</div>
            ) : !assignedCouriersData?.data?.length ? (
              <div className="text-gray-400">No couriers assigned to this shop.</div>
            ) : (
              <table className="min-w-full text-left bg-[#232b42] rounded-lg mb-6">
                <thead>
                  <tr>
                    <th className="py-2 px-4">#</th>
                    <th className="py-2 px-4">Vehicle</th>
                    <th className="py-2 px-4">License</th>
                    <th className="py-2 px-4">Availability</th>
                    <th className="py-2 px-4">Status</th>
                    <th className="py-2 px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedCouriersData.data.map((courier: any, idx: number) => (
                    <tr key={courier._id} className="border-b border-[#2e3650]">
                      <td className="py-2 px-4">{idx + 1}</td>
                      <td className="py-2 px-4">{courier.vehicleType}</td>
                      <td className="py-2 px-4">{courier.licenseNumber}</td>
                      <td className="py-2 px-4 capitalize">{courier.availability}</td>
                      <td className="py-2 px-4">{courier.isActive ? 'Active' : 'Inactive'}</td>
                      <td className="py-2 px-4">
                        <button
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                          onClick={() => unassignCourierMutation.mutate({ shopId: shopId!, courierId: courier._id })}
                          disabled={unassignCourierMutation.isPending}
                          title="Unassign Courier"
                        >
                          Unassign
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <h2 className="text-lg font-semibold mb-2">Available Couriers</h2>
            {availableCouriersLoading ? (
              <div>Loading available couriers...</div>
            ) : availableCouriersError ? (
              <div className="text-red-400">{String(availableCouriersError.message)}</div>
            ) : !availableCouriersData?.data?.length ? (
              <div className="text-gray-400">No available couriers to assign.</div>
            ) : (
              <table className="min-w-full text-left bg-[#232b42] rounded-lg">
                <thead>
                  <tr>
                    <th className="py-2 px-4">#</th>
                    <th className="py-2 px-4">Vehicle</th>
                    <th className="py-2 px-4">License</th>
                    <th className="py-2 px-4">Availability</th>
                    <th className="py-2 px-4">Status</th>
                    <th className="py-2 px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {availableCouriersData.data.map((courier: any, idx: number) => (
                    <tr key={courier._id} className="border-b border-[#2e3650]">
                      <td className="py-2 px-4">{idx + 1}</td>
                      <td className="py-2 px-4">{courier.vehicleType}</td>
                      <td className="py-2 px-4">{courier.licenseNumber}</td>
                      <td className="py-2 px-4 capitalize">{courier.availability}</td>
                      <td className="py-2 px-4">{courier.isActive ? 'Active' : 'Inactive'}</td>
                      <td className="py-2 px-4">
                        <button
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                          onClick={() => assignCourierMutation.mutate({ shopId: shopId!, courierId: courier._id })}
                          disabled={assignCourierMutation.isPending}
                          title="Assign Courier"
                        >
                          Assign
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 