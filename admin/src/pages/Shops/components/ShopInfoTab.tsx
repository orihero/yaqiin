import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Shop } from '@yaqiin/shared/types/shop';
import { User } from '@yaqiin/shared/types/user';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useRef, useState } from 'react';
import { getUsers } from '../../../services/userService';
import { updateShop } from '../../../services/shopService';
import ShopFormModal from './ShopFormModal';

interface ShopInfoTabProps {
  shopData: Shop;
  isLoading: boolean;
  error: Error | null;
}

export default function ShopInfoTab({ shopData, isLoading, error }: ShopInfoTabProps) {
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

  useEffect(() => {
    let leaflet: any;
    if (shopData?.address?.coordinates) {
      const { lat, lng } = shopData.address.coordinates;
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
            markerRef.current = L.marker([lat, lng]).addTo(mapRef.current).bindPopup(shopData.name).openPopup();
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
          const deliveryZone = shopData.deliveryZones?.[0];
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
            markerRef.current = L.marker([lat, lng]).addTo(mapRef.current).bindPopup(shopData.name).openPopup();
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
  }, [shopData, editingRegion, editingLocation, tempLocation]);

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
    if (!drawnPolygon || !shopData?._id) return;
    setSaveLoading(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await updateShop({
        _id: shopData._id,
        deliveryZones: [{
          name: 'Default Zone',
          polygon: drawnPolygon,
          deliveryFee: shopData.deliveryZones?.[0]?.deliveryFee || 0,
          minOrderAmount: shopData.deliveryZones?.[0]?.minOrderAmount || 0,
          estimatedDeliveryTime: shopData.deliveryZones?.[0]?.estimatedDeliveryTime || 0,
        }],
      });
      setSaveSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['shop', shopData._id] });
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to save region');
    } finally {
      setSaveLoading(false);
    }
  };

  // Save new shop location
  const handleSaveLocation = async () => {
    if (!tempLocation || !shopData?._id) return;
    setSaveLoading(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await updateShop({
        _id: shopData._id,
        address: {
          ...shopData.address,
          coordinates: tempLocation,
        },
      });
      setSaveSuccess(true);
      setEditingLocation(false);
      setTempLocation(null);
      queryClient.invalidateQueries({ queryKey: ['shop', shopData._id] });
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to save location');
    } finally {
      setSaveLoading(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-400">{String(error.message)}</div>;
  if (!shopData) return <div>No shop data found.</div>;

  return (
    <div className="space-y-4">
      <div><span className="font-semibold">Name:</span> {shopData.name}</div>
      <div><span className="font-semibold">Owner:</span> {
        userMap[shopData.ownerId]
          ? `${userMap[shopData.ownerId].firstName || ''} ${userMap[shopData.ownerId].lastName || ''}`.trim() || userMap[shopData.ownerId].username || shopData.ownerId
          : shopData.ownerId
      }</div>
      <div><span className="font-semibold">Phone:</span> {shopData.contactInfo?.phoneNumber}</div>
      <div><span className="font-semibold">City:</span> {shopData.address?.city}</div>
      <div><span className="font-semibold">Status:</span> <span className="capitalize">{shopData.status}</span></div>
      
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
      
      {/* Map Section */}
      <div className="mt-6">
        {shopData?.address?.coordinates && typeof shopData.address.coordinates.lat === 'number' && typeof shopData.address.coordinates.lng === 'number' ? (
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
        initialValues={shopData}
        onClose={() => setEditShopModalOpen(false)}
        onSubmit={async (values) => {
          setSaveLoading(true);
          setSaveError(null);
          setSaveSuccess(false);
          try {
            await updateShop({ ...values, _id: shopData._id });
            setEditShopModalOpen(false);
            setSaveSuccess(true);
            queryClient.invalidateQueries({ queryKey: ['shop', shopData._id] });
          } catch (err: any) {
            setSaveError(err?.message || 'Failed to update shop');
          } finally {
            setSaveLoading(false);
          }
        }}
      />
    </div>
  );
}
