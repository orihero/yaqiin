const turf = require('@turf/turf');
import Shop, { IShop } from '../models/Shop';

/**
 * Finds the shop whose delivery zone contains the given lat/lng point.
 * @param lat Latitude of the point
 * @param lng Longitude of the point
 * @returns The matching shop document or null
 */
export async function findShopForLocation(lat: number, lng: number): Promise<IShop | null> {
  const shops = await Shop.find({ status: 'active' });
  const point = turf.point([lng, lat]);

  for (const shop of shops) {
    for (const zone of shop.deliveryZones || []) {
      const polygonCoords = zone.polygon.map((p: { lat: number; lng: number }) => [p.lng, p.lat]);
      // Ensure polygon is closed
      if (
        polygonCoords.length &&
        (polygonCoords[0][0] !== polygonCoords[polygonCoords.length - 1][0] ||
          polygonCoords[0][1] !== polygonCoords[polygonCoords.length - 1][1])
      ) {
        polygonCoords.push(polygonCoords[0]);
      }
      const polygon = turf.polygon([polygonCoords]);
      if (turf.booleanPointInPolygon(point, polygon)) {
        return shop;
      }
    }
  }
  return null;
} 