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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginWithTelegram = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("./models/User"));
const crypto_1 = __importDefault(require("crypto"));
// TODO: Move secret to env
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN';
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
function parseInitData(initData) {
    // Parse query string into object
    return Object.fromEntries(new URLSearchParams(initData));
}
function validateTelegramInitData(initData) {
    if (!initData)
        return null;
    const data = parseInitData(initData);
    const { hash } = data, authData = __rest(data, ["hash"]);
    // 1. Sort keys alphabetically and build data_check_string
    const dataCheckArr = Object.keys(authData)
        .sort()
        .map((key) => `${key}=${authData[key]}`);
    const dataCheckString = dataCheckArr.join('\n');
    // 2. Create secret key
    const secret = crypto_1.default.createHmac('sha256', 'WebAppData').update(TELEGRAM_BOT_TOKEN).digest();
    // 3. Calculate HMAC-SHA256
    const hmac = crypto_1.default.createHmac('sha256', secret).update(dataCheckString).digest('hex');
    // 4. Compare hashes
    if (hmac !== hash)
        return null;
    // 5. Optionally check auth_date (timestamp)
    const now = Math.floor(Date.now() / 1000);
    if (authData.auth_date && now - Number(authData.auth_date) > 86400)
        return null; // 24h expiry
    // 6. Return user info
    return {
        id: authData.id,
        first_name: authData.first_name,
        last_name: authData.last_name,
        username: authData.username,
        photo_url: authData.photo_url,
    };
}
const loginWithTelegram = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { telegramId } = req.body;
    if (!telegramId) {
        res.status(400).json({ success: false, error: { code: 'NO_TELEGRAM_ID', message: 'telegramId is required' } });
        return;
    }
    // Find user by telegramId
    const user = yield User_1.default.findOne({ telegramId });
    if (!user) {
        res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User with this telegramId not found' } });
        return;
    }
    // Issue JWT
    const token = jsonwebtoken_1.default.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, data: { token, user } });
});
exports.loginWithTelegram = loginWithTelegram;
