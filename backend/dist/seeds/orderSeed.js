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
exports.default = orderSeed;
const Order_1 = __importDefault(require("../models/Order"));
const User_1 = __importDefault(require("../models/User"));
const Product_1 = __importDefault(require("../models/Product"));
const Shop_1 = __importDefault(require("../models/Shop"));
function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
const paymentStatuses = ['pending', 'paid', 'failed'];
const orderStatuses = ['pending', 'processing', 'delivered', 'cancelled'];
function orderSeed() {
    return __awaiter(this, void 0, void 0, function* () {
        // Remove all orders
        yield Order_1.default.deleteMany({});
        const clients = yield User_1.default.find({ role: 'client' });
        const couriers = yield User_1.default.find({ role: 'courier' });
        const products = yield Product_1.default.find();
        const shops = yield Shop_1.default.find();
        if (clients.length === 0 || couriers.length === 0 || products.length === 0 || shops.length === 0) {
            throw new Error('Clients, couriers, products, or shops not seeded.');
        }
        let total = 0;
        for (let i = 0; i < 30; i++) {
            const client = randomFrom(clients);
            const courier = randomFrom(couriers);
            const product = randomFrom(products);
            const shop = shops.find(s => s._id.equals(product.shopId)) || randomFrom(shops);
            const quantity = Math.floor(Math.random() * 5) + 1;
            const itemSubtotal = product.price * quantity;
            const items = [{
                    productId: product._id,
                    name: product.name.uz,
                    price: product.price,
                    quantity,
                    unit: product.unit,
                    subtotal: itemSubtotal,
                }];
            const pricing = {
                itemsTotal: itemSubtotal,
                deliveryFee: 10000,
                serviceFee: 2000,
                tax: 0,
                discount: 0,
                total: itemSubtotal + 10000 + 2000,
            };
            const deliveryAddress = {
                title: 'Uy',
                street: shop.address.street,
                city: shop.address.city,
                district: shop.address.district,
                coordinates: shop.address.coordinates,
                notes: 'Yetkazib berish uchun',
            };
            yield Order_1.default.create({
                customerId: client._id,
                shopId: shop._id,
                courierId: courier._id,
                items,
                pricing,
                deliveryAddress,
                paymentMethod: 'cash_on_delivery',
                paymentStatus: randomFrom(paymentStatuses),
                status: randomFrom(orderStatuses),
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            total++;
        }
        console.log('Seeded orders:', total);
    });
}
