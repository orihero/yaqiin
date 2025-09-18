"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findShopForLocation = findShopForLocation;
const turf = require('@turf/turf');
const Shop_1 = __importDefault(require("../models/Shop"));
/**
 * Finds the shop whose delivery zone contains the given lat/lng point.
 * @param lat Latitude of the point
 * @param lng Longitude of the point
 * @returns The matching shop document or null
 */
function findShopForLocation(lat, lng) {
    return __awaiter(this, void 0, void 0, function* () {
        const shops = yield Shop_1.default.find({ status: 'active' });
        const point = turf.point([lng, lat]);
        for (const shop of shops) {
            for (const zone of shop.deliveryZones || []) {
                const polygonCoords = zone.polygon.map((p) => [p.lng, p.lat]);
                // Ensure polygon is closed
                if (polygonCoords.length &&
                    (polygonCoords[0][0] !== polygonCoords[polygonCoords.length - 1][0] ||
                        polygonCoords[0][1] !== polygonCoords[polygonCoords.length - 1][1])) {
                    polygonCoords.push(polygonCoords[0]);
                }
                const polygon = turf.polygon([polygonCoords]);
                if (turf.booleanPointInPolygon(point, polygon)) {
                    return shop;
                }
            }
        }
        return null;
    });
}
