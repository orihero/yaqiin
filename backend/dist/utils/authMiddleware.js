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
exports.telegramAuthMiddleware = void 0;
const init_data_node_1 = require("@telegram-apps/init-data-node");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    console.log("Authorization header:", authHeader);
    console.log("JWT_SECRET at middleware:", process.env.JWT_SECRET);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
            success: false,
            error: { code: 401, message: "No token provided" },
        });
        return;
    }
    const token = authHeader.split(" ")[1];
    console.log("Token received:", token);
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "secret");
        console.log("Decoded token:", decoded);
        const user = yield User_1.default.findById(decoded.id);
        if (!user) {
            console.log("User not found for id:", decoded.id);
            res.status(401).json({
                success: false,
                error: { code: 401, message: "User not found" },
            });
            return;
        }
        // Attach user to request
        req.user = user;
        next();
    }
    catch (err) {
        console.error("JWT verification error:", err);
        res
            .status(401)
            .json({ success: false, error: { code: 401, message: "Invalid token" } });
    }
});
const telegramAuthMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("tma ")) {
        res.status(401).json({
            success: false,
            error: { code: 401, message: "No Telegram init data provided" },
        });
        return;
    }
    const initDataRaw = authHeader.slice(4);
    try {
        const initData = (0, init_data_node_1.parse)(initDataRaw, false);
        req.telegramUser = initData.user;
        next();
    }
    catch (err) {
        res.status(401).json({
            success: false,
            error: { code: 401, message: "Invalid Telegram init data" },
        });
    }
});
exports.telegramAuthMiddleware = telegramAuthMiddleware;
exports.default = authMiddleware;
