import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes";
import shopRoutes from "./routes/shopRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import productRoutes from "./routes/productRoutes";
import shopProductRoutes from "./routes/shopProductRoutes";
import orderRoutes from "./routes/orderRoutes";
import deliveryRoutes from "./routes/deliveryRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import settingRoutes from "./routes/settingRoutes";
import supportTicketRoutes from "./routes/supportTicketRoutes";
import excelImportRoutes from "./routes/excelImportRoutes";
import imageGenerationRoutes from "./routes/imageGenerationRoutes";
// import outreachRoutes from "./routes/outreachRoutes"; // Temporarily disabled
import morgan from "morgan";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import path from "path";
import Setting from "./models/Setting";
import { telegramAuthMiddleware } from "./utils/authMiddleware";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/yaqiin";

// Disable ETag to prevent 304 Not Modified responses
app.set("etag", false);

app.use(express.json());
app.use(morgan("dev"));
app.use(cors({ origin: "*", credentials: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Apply Telegram auth middleware to selected routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/shop-products", shopProductRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/support-tickets", supportTicketRoutes);
app.use("/api/excel-import", excelImportRoutes);
app.use("/api/image-generation", imageGenerationRoutes);
// app.use("/api/outreach", outreachRoutes); // Temporarily disabled
app.use("/api/auth", authRoutes);

// Serve uploads directory - try both possible locations
const uploadsPath = path.join(__dirname, "../uploads");
const uploadsPathAlt = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadsPath));
app.use("/uploads", express.static(uploadsPathAlt));

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: {
      code: status,
      message: err.message || "Internal Server Error",
      ...(err.details ? { details: err.details } : {}),
    },
  });
});

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    app.listen(PORT, async () => {
      console.log(`Server running on port ${PORT}`);
      // Start Telegram bots based on feature flags
      const isDev = process.env.NODE_ENV === "development";
      let courierBotEnabled = false;
      let mainBotEnabled = false;
      if (isDev) {
        courierBotEnabled = true;
        mainBotEnabled = true;
      } else {
        const flags = await Setting.find({
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
      } else {
        console.log("Courier bot NOT started (feature flag off)");
      }
      if (mainBotEnabled) {
        require("./bots/mainBot");
        console.log("Main bot started");
      } else {
        console.log("Main bot NOT started (feature flag off)");
      }
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });
