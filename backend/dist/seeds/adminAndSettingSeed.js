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
exports.default = adminAndSettingSeed;
const User_1 = __importDefault(require("../models/User"));
const Setting_1 = __importDefault(require("../models/Setting"));
const adminTelegramId = 'admin-telegram-id';
const adminPassword = 'admin123'; // Change this in production!
function adminAndSettingSeed() {
    return __awaiter(this, void 0, void 0, function* () {
        // Remove all users and settings
        yield User_1.default.deleteMany({});
        yield Setting_1.default.deleteMany({});
        // Seed admin user
        const admin = yield User_1.default.findOne({ telegramId: adminTelegramId });
        if (!admin) {
            yield User_1.default.create({
                telegramId: adminTelegramId,
                username: 'admin',
                firstName: 'Admin',
                lastName: 'User',
                role: 'admin',
                status: 'active',
                password: adminPassword,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            console.log('Admin user created.');
        }
        else {
            console.log('Admin user already exists.');
        }
        // Seed default setting
        const defaultSettingKey = 'platform_name';
        const setting = yield Setting_1.default.findOne({ key: defaultSettingKey });
        if (!setting) {
            yield Setting_1.default.create({
                key: defaultSettingKey,
                value: 'yaqiin.uz',
                type: 'system',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            console.log('Default setting created.');
        }
        else {
            console.log('Default setting already exists.');
        }
    });
}
