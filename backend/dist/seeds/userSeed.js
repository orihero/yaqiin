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
exports.default = userSeed;
const User_1 = __importDefault(require("../models/User"));
const uzbekNames = [
    'Aziz', 'Jasur', 'Diyor', 'Shahzod', 'Bekzod', 'Ulugbek', 'Javohir', 'Sardor', 'Oybek', 'Shavkat',
    'Dilshod', 'Farruh', 'Bobur', 'Sherzod', 'Rustam', 'Jahongir', 'Akmal', 'Kamol', 'Anvar', 'Islom',
    'Gulnora', 'Dilnoza', 'Malika', 'Nodira', 'Zilola', 'Rayhona', 'Sevara', 'Lola', 'Gulbahor', 'Shahnoza',
    'Madina', 'Zarina', 'Dildora', 'Feruza', 'Nilufar', 'Gulchehra', 'Nargiza', 'Yulduz', 'Shaxzoda', 'Mukhayyo'
];
const uzbekSurnames = [
    'Toshpulatov', 'Karimov', 'Rakhimov', 'Islomov', 'Saidov', 'Ergashev', 'Yusupov', 'Abdullayev', 'Nazarov', 'Mirzayev',
    'Xudoyberdiyev', 'Qodirov', 'Sultonov', 'Mamatqulov', 'Tojiboyev', 'Juraev', 'Tursunov', 'Sobirov', 'Ganiev', 'Kurbanov',
    'Olimova', 'Rasulova', 'Islomova', 'Saidova', 'Ergasheva', 'Yusupova', 'Abdullayeva', 'Nazarova', 'Mirzayeva', 'Qodirova',
    'Sultonova', 'Mamatqulova', 'Tojiboyeva', 'Juraeva', 'Tursunova', 'Sobirova', 'Ganieva', 'Kurbanova'
];
function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function generateUser(role, i) {
    const firstName = randomFrom(uzbekNames);
    const lastName = randomFrom(uzbekSurnames);
    return {
        telegramId: `${role}-${i}-${Math.floor(Math.random() * 100000)}`,
        username: `${role}${i}`,
        firstName,
        lastName,
        role,
        status: 'active',
        password: 'test1234',
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}
function userSeed() {
    return __awaiter(this, void 0, void 0, function* () {
        // Remove all users
        yield User_1.default.deleteMany({});
        // Clients
        const clients = Array.from({ length: 100 }, (_, i) => generateUser('client', i));
        // Couriers
        const couriers = Array.from({ length: 10 }, (_, i) => generateUser('courier', i));
        // Shop Owners
        const shopOwners = Array.from({ length: 5 }, (_, i) => generateUser('shop_owner', i));
        // Admins (besides the main one)
        const admins = Array.from({ length: 3 }, (_, i) => generateUser('admin', i + 1));
        const allUsers = [...clients, ...couriers, ...shopOwners, ...admins];
        for (const user of allUsers) {
            const exists = yield User_1.default.findOne({ telegramId: user.telegramId });
            if (!exists) {
                yield User_1.default.create(user);
            }
        }
        console.log('Seeded users: 100 clients, 10 couriers, 5 shop owners, 3 admins');
    });
}
