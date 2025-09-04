import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Shop } from '@yaqiin/shared/types/shop';
import { User } from '@yaqiin/shared/types/user';
import { updateShop } from '../../../services/shopService';
import ShopFormModal from './ShopFormModal';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

interface ShopInfoTabProps {
  shopData: { success: boolean; data: Shop };
  userMap: Record<string, User>;
  isLoading: boolean;
  error: Error | null;
}

export default function ShopInfoTab({ shopData, userMap, isLoading, error }: ShopInfoTabProps) {
  const [editingRegion, setEditingRegion] = useState(false);
  const [drawnPolygon, setDrawnPolygon] = useState<{ lat: number; lng: number }[] | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [tempPolygon, setTempPolygon] = useState<{ lat: number; lng: number }[]>([]);
  const [editShopModalOpen, setEditShopModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(false);
  const [tempLocation, setTempLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const polygonLayerRef = useRef<any>(null);
  const tempLayerRef = useRef<any>(null);

  const queryClient = useQueryClient();

  // Initialize map when component mounts
  useEffect(() => {
    if (shopData?.data?.address?.coordinates && typeof shopData.data.address.coordinates.lat === 'number' && typeof shopData.data.address.coordinates.lng === 'number') {
      const initMap = async () => {
        const L = await import('leaflet');
        await import('leaflet-draw');
        
        // Create a custom marker icon
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: '<div style="background-color: #e74c3c; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
        
        // Small delay to ensure DOM is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!mapRef.current) {
          mapRef.current = L.map('shop-map').setView([shopData.data.address.coordinates.lat, shopData.data.address.coordinates.lng], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(mapRef.current);

          // Add marker for shop location
          markerRef.current = L.marker([shopData.data.address.coordinates.lat, shopData.data.address.coordinates.lng], { icon: customIcon }).addTo(mapRef.current);
          
          // Display existing delivery regions if any
          if (shopData.data.deliveryZones && shopData.data.deliveryZones.length > 0) {
            shopData.data.deliveryZones.forEach((zone: any) => {
              if (zone.polygon && zone.polygon.length > 2) {
                const polygonCoords = zone.polygon.map((p: any) => [p.lat, p.lng]);
                const polygon = L.polygon(polygonCoords, {
                  color: '#2563eb',
                  weight: 3,
                  fillColor: '#2563eb',
                  fillOpacity: 0.4
                }).addTo(mapRef.current);
              }
            });
          }
        }

        // Handle drawing for delivery region
        if (editingRegion) {
          const drawnItems = new L.FeatureGroup();
          mapRef.current.addLayer(drawnItems);

          const drawControl = new (L as any).Control.Draw({
            draw: {
              polygon: {
                allowIntersection: false,
                drawError: {
                  color: '#e1e100',
                  message: '<strong>Oh snap!</strong> you can\'t draw that!'
                },
                shapeOptions: {
                  color: '#2563eb',
                  weight: 3,
                  fillColor: '#2563eb',
                  fillOpacity: 0.3
                }
              },
              polyline: false,
              circle: false,
              rectangle: false,
              circlemarker: false,
              marker: false
            },
            edit: {
              featureGroup: drawnItems,
              remove: true
            }
          });
          mapRef.current.addControl(drawControl);

          mapRef.current.on('draw:created', (e: any) => {
            const layer = e.layer;
            drawnItems.addLayer(layer);
            const coordinates = layer.getLatLngs()[0];
            setTempPolygon(coordinates.map((coord: any) => ({ lat: coord.lat, lng: coord.lng })));
          });

          mapRef.current.on('draw:edited', (e: any) => {
            const layers = e.layers;
            layers.eachLayer((layer: any) => {
              const coordinates = layer.getLatLngs()[0];
              setTempPolygon(coordinates.map((coord: any) => ({ lat: coord.lat, lng: coord.lng })));
            });
          });

          mapRef.current.on('draw:deleted', () => {
            setTempPolygon([]);
          });
        }

        // Handle location editing
        if (editingLocation) {
          mapRef.current.on('click', (e: any) => {
            if (markerRef.current) {
              mapRef.current.removeLayer(markerRef.current);
            }
            markerRef.current = L.marker([e.latlng.lat, e.latlng.lng], { icon: customIcon }).addTo(mapRef.current);
            setTempLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
          });
        }
      };

      initMap();

      // Cleanup function
      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    }
  }, [shopData, editingRegion, editingLocation]);

  const handleSavePolygon = async () => {
    if (!drawnPolygon) return;
    
    setSaveLoading(true);
    setSaveError(null);
    setSaveSuccess(false);
    
    try {
      await updateShop({
        _id: shopData.data._id,
        deliveryZones: [{
          name: 'Delivery Zone',
          polygon: drawnPolygon
        }],
      });
      setSaveSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['shop', shopData.data._id] });
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to save delivery region');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveLocation = async () => {
    if (!tempLocation) return;
    
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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-400">{String(error.message)}</div>;
  if (!shopData) return <div>No shop data found.</div>;

  return (
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
      
      {/* Map Section */}
      <div className="mt-6">
        {shopData?.data?.address?.coordinates && typeof shopData.data.address.coordinates.lat === 'number' && typeof shopData.data.address.coordinates.lng === 'number' ? (
          <>
            <style>{`
              .leaflet-container, .leaflet-control { z-index: 10 !important; }
              #shop-map { 
                height: 350px !important; 
                width: 100% !important; 
                border-radius: 12px; 
                overflow: hidden; 
                z-index: 10; 
                position: relative;
                background: #f0f0f0;
              }
              .custom-marker {
                background: transparent !important;
                border: none !important;
              }
              .leaflet-draw-toolbar {
                background: white !important;
                border: 1px solid #ccc !important;
                border-radius: 4px !important;
              }
              .leaflet-draw-toolbar a {
                background-color: white !important;
                border-bottom: 1px solid #ccc !important;
                color: #000 !important;
              }
              .leaflet-draw-toolbar a:hover {
                background-color: #f4f4f4 !important;
              }
            `}</style>
            <div id="shop-map" />
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
  );
} 
