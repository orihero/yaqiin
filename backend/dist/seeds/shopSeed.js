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
exports.default = shopSeed;
const Shop_1 = __importDefault(require("../models/Shop"));
const User_1 = __importDefault(require("../models/User"));
const shopNames = [
    'Oqtepa Savdo', 'Baraka Market', 'Do‘stlik Supermarket', 'Yangi Hayot', 'Farovon Savdo'
];
const defaultAddress = (i) => ({
    street: `Ko‘cha ${i + 1}`,
    city: 'Toshkent',
    district: 'Yunusobod',
    coordinates: { lat: 41.3 + i * 0.01, lng: 69.2 + i * 0.01 },
});
const defaultContactInfo = (i) => ({
    phoneNumber: `+9989012345${i}0`,
    email: `shop${i + 1}@yaqiin.uz`,
    telegramUsername: `shop${i + 1}_tg`,
});
const defaultOperatingHours = {
    monday: { open: '09:00', close: '21:00', isOpen: true },
    tuesday: { open: '09:00', close: '21:00', isOpen: true },
    wednesday: { open: '09:00', close: '21:00', isOpen: true },
    thursday: { open: '09:00', close: '21:00', isOpen: true },
    friday: { open: '09:00', close: '21:00', isOpen: true },
    saturday: { open: '09:00', close: '21:00', isOpen: true },
    sunday: { open: '09:00', close: '21:00', isOpen: true },
};
function shopSeed() {
    return __awaiter(this, void 0, void 0, function* () {
        // Remove all shops
        yield Shop_1.default.deleteMany({});
        // Get shop owners
        const shopOwners = yield User_1.default.find({ role: 'shop_owner' }).limit(5);
        if (shopOwners.length < 5) {
            throw new Error('Not enough shop owners to seed shops.');
        }
        const shops = [];
        for (let i = 0; i < 5; i++) {
            const name = shopNames[i];
            const owner = shopOwners[i];
            let shop = yield Shop_1.default.findOne({ name });
            if (!shop) {
                shop = yield Shop_1.default.create({
                    name,
                    ownerId: owner._id,
                    address: defaultAddress(i),
                    contactInfo: defaultContactInfo(i),
                    operatingHours: defaultOperatingHours,
                    status: 'active',
                    // Sample photo and logo URLs for testing
                    photo: `https://picsum.photos/400/300?random=${i + 1}`,
                    logo: `https://picsum.photos/200/200?random=${i + 10}`,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }
            shops.push(shop);
        }
        console.log('Seeded shops:', shops.length);
        return shops;
    });
}
