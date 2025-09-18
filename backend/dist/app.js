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
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const shopRoutes_1 = __importDefault(require("./routes/shopRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const shopProductRoutes_1 = __importDefault(require("./routes/shopProductRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const deliveryRoutes_1 = __importDefault(require("./routes/deliveryRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const reviewRoutes_1 = __importDefault(require("./routes/reviewRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
const settingRoutes_1 = __importDefault(require("./routes/settingRoutes"));
const supportTicketRoutes_1 = __importDefault(require("./routes/supportTicketRoutes"));
const excelImportRoutes_1 = __importDefault(require("./routes/excelImportRoutes"));
const customExcelImportRoutes_1 = __importDefault(require("./routes/customExcelImportRoutes"));
const imageGenerationRoutes_1 = __importDefault(require("./routes/imageGenerationRoutes"));
const translationRoutes_1 = __importDefault(require("./routes/translationRoutes"));
// import outreachRoutes from "./routes/outreachRoutes"; // Temporarily disabled
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const path_1 = __importDefault(require("path"));
const Setting_1 = __importDefault(require("./models/Setting"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/yaqiin";
// Disable ETag to prevent 304 Not Modified responses
app.set("etag", false);
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
app.use((0, cors_1.default)({ origin: "*", credentials: true }));
// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});
// Apply Telegram auth middleware to selected routes
app.use("/api/users", userRoutes_1.default);
app.use("/api/products", productRoutes_1.default);
app.use("/api/shop-products", shopProductRoutes_1.default);
app.use("/api/shops", shopRoutes_1.default);
app.use("/api/categories", categoryRoutes_1.default);
app.use("/api/orders", orderRoutes_1.default);
app.use("/api/deliveries", deliveryRoutes_1.default);
app.use("/api/notifications", notificationRoutes_1.default);
app.use("/api/reviews", reviewRoutes_1.default);
app.use("/api/analytics", analyticsRoutes_1.default);
app.use("/api/settings", settingRoutes_1.default);
app.use("/api/support-tickets", supportTicketRoutes_1.default);
app.use("/api/excel-import", excelImportRoutes_1.default);
app.use("/api/custom-excel-import", customExcelImportRoutes_1.default);
app.use("/api/image-generation", imageGenerationRoutes_1.default);
app.use("/api/translation", translationRoutes_1.default);
// app.use("/api/outreach", outreachRoutes); // Temporarily disabled
app.use("/api/auth", authRoutes_1.default);
// Serve uploads directory - try both possible locations
const uploadsPath = path_1.default.join(__dirname, "../uploads");
const uploadsPathAlt = path_1.default.join(__dirname, "uploads");
app.use("/uploads", express_1.default.static(uploadsPath));
app.use("/uploads", express_1.default.static(uploadsPathAlt));
// Error handler
app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).json({
        success: false,
        error: Object.assign({ code: status, message: err.message || "Internal Server Error" }, (err.details ? { details: err.details } : {})),
    });
});
mongoose_1.default
    .connect(MONGO_URI)
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    app.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
        console.log(`Server running on port ${PORT}`);
        // Start Telegram bots based on feature flags
        const isDev = process.env.NODE_ENV === "development";
        let courierBotEnabled = false;
        let mainBotEnabled = false;
        if (isDev) {
            courierBotEnabled = true;
            mainBotEnabled = true;
        }
        else {
            const flags = yield Setting_1.default.find({
                key: { $in: ["courier_bot_enabled", "main_bot_enabled"] },
                isActive: true,
            });
            for (const flag of flags) {
                if (flag.key === "courier_bot_enabled" && flag.value === true)
                    courierBotEnabled = true;
                if (flag.key === "main_bot_enabled" && flag.value === true)
                    mainBotEnabled = true;
            }
        }
        if (courierBotEnabled) {
            require("./bots/courierBot");
            console.log("Courier bot started");
        }
        else {
            console.log("Courier bot NOT started (feature flag off)");
        }
        if (mainBotEnabled) {
            require("./bots/mainBot");
            console.log("Main bot started");
        }
        else {
            console.log("Main bot NOT started (feature flag off)");
        }
    }));
}))
    .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
});
