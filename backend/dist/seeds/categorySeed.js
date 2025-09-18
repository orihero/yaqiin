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
exports.default = categorySeed;
const Category_1 = __importDefault(require("../models/Category"));
const uzbekCategories = [
    { uz: 'Mevalar', ru: 'Фрукты', icon: 'mdi:fruit-cherries', imageUrl: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc' },
    { uz: 'Sabzavotlar', ru: 'Овощи', icon: 'mdi:carrot', imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399' },
    { uz: 'Go‘sht', ru: 'Мясо', icon: 'mdi:food-steak', imageUrl: 'https://images.unsplash.com/photo-1606788075761-9c3e1c8e6c9e' },
    { uz: 'Sut mahsulotlari', ru: 'Молочные продукты', icon: 'mdi:food-croissant', imageUrl: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c' },
    { uz: 'Ichimliklar', ru: 'Напитки', icon: 'mdi:cup-water', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836' },
    { uz: 'Non va pishiriqlar', ru: 'Хлеб и выпечка', icon: 'mdi:bread-slice', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836' },
    { uz: 'Shirinliklar', ru: 'Сладости', icon: 'mdi:candy', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836' },
    { uz: 'Baliq', ru: 'Рыба', icon: 'mdi:fish', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836' },
    { uz: 'Yog‘lar', ru: 'Масла', icon: 'mdi:bottle-tonic', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836' },
    { uz: 'Guruch va don', ru: 'Рис и зерно', icon: 'mdi:rice', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836' }
];
function categorySeed() {
    return __awaiter(this, void 0, void 0, function* () {
        // Remove all categories
        yield Category_1.default.deleteMany({});
        for (const cat of uzbekCategories) {
            const exists = yield Category_1.default.findOne({ 'name.uz': cat.uz });
            if (!exists) {
                yield Category_1.default.create({
                    name: { uz: cat.uz, ru: cat.ru },
                    icon: cat.icon,
                    imageUrl: cat.imageUrl,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }
        }
        console.log('Seeded categories:', uzbekCategories.length);
    });
}
