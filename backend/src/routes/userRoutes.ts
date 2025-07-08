import { Router, RequestHandler } from "express";
import User from "../models/User";
import { parseQuery } from "../utils/queryHelper";
import Shop from "../models/Shop";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import Courier from '../models/Courier';

const router = Router();

// Simple JWT auth middleware
const authMiddleware = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({
        success: false,
        error: { code: 401, message: "No token provided" },
      });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.user = decoded;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, error: { code: 401, message: "Invalid token" } });
  }
};

// Move this block above all parameterized routes
router.get(
  "/me",
  authMiddleware as RequestHandler,
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        res
          .status(404)
          .json({
            success: false,
            error: { code: 404, message: "User not found" },
          });
        return;
      }
      res.json({ success: true, data: user });
    } catch (err) {
      res
        .status(500)
        .json({
          success: false,
          error: { code: 500, message: "Failed to fetch user profile" },
        });
    }
  }
);

// List all users with pagination, filtering, and search
router.get("/", async (req, res, next) => {
  try {
    const { filter, page, limit, skip } = parseQuery(req, [
      "username",
      "firstName",
      "lastName",
      "phoneNumber",
      "email",
    ]);
    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);
    res.json({
      success: true,
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

// Get available shop owners (role: 'shop_owner' and no shop assigned)
router.get("/available-owners", async (req, res, next) => {
  try {
    // Find all ownerIds that are already assigned to a shop
    const shops = await Shop.find({}, "ownerId");
    const assignedOwnerIds = shops.map((shop) => String(shop.ownerId));
    // Find users with role 'shop_owner' and _id not in assignedOwnerIds
    const availableOwners = await User.find({
      role: "shop_owner",
      _id: { $nin: assignedOwnerIds },
    });
    res.json({
      success: true,
      data: availableOwners,
    });
  } catch (err) {
    next(err);
  }
});

// Get available couriers (role: 'courier' and no courier assigned)
router.get('/available-couriers', async (req, res, next) => {
  try {
    // Find all userIds that are already assigned to a courier
    const couriers = await Courier.find({}, 'userId');
    const assignedCourierUserIds = couriers.map((courier) => String(courier.userId));
    // Find users with role 'courier' and _id not in assignedCourierUserIds
    const availableCouriers = await User.find({
      role: 'courier',
      _id: { $nin: assignedCourierUserIds },
    });
    res.json({
      success: true,
      data: availableCouriers,
    });
  } catch (err) {
    next(err);
  }
});

// Get user by ID
router.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next({ status: 404, message: "User not found" });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

// Create user
router.post("/", async (req, res, next) => {
  try {
    const user = new User(req.body);
    await user.save();
    res
      .status(201)
      .json({ success: true, data: user, message: "User created" });
  } catch (err) {
    next({ status: 400, message: "Failed to create user", details: err });
  }
});

// Update user
router.put("/:id", async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!user) return next({ status: 404, message: "User not found" });
    res.json({ success: true, data: user, message: "User updated" });
  } catch (err) {
    next({ status: 400, message: "Failed to update user", details: err });
  }
});

// Delete user
router.delete("/:id", async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return next({ status: 404, message: "User not found" });
    res.json({ success: true, data: null, message: "User deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
