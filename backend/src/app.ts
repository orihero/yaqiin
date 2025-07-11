import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes";
import shopRoutes from "./routes/shopRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import productRoutes from "./routes/productRoutes";
import orderRoutes from "./routes/orderRoutes";
import courierRoutes from "./routes/courierRoutes";
import deliveryRoutes from "./routes/deliveryRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import settingRoutes from "./routes/settingRoutes";
import supportTicketRoutes from "./routes/supportTicketRoutes";
import morgan from "morgan";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import path from 'path';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/yaqiin";

// Disable ETag to prevent 304 Not Modified responses
app.set("etag", false);

app.use(express.json());
app.use(morgan("dev"));
app.use(cors({ origin: "*" }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// TODO: Import and use routes here
app.use("/api/users", userRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/couriers", courierRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/support-tickets", supportTicketRoutes);
app.use("/api/auth", authRoutes);

// Serve uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      // Start Telegram bots
      // require('./bots/mainBot');
      require('./bots/courierBot');
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });
