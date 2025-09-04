import { Router, RequestHandler } from "express";
import User from "../models/User";
import { parseQuery } from "../utils/queryHelper";
import Shop from "../models/Shop";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import authMiddleware from "../utils/authMiddleware";

const router = Router();

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

// Update current user profile
router.put(
  "/me",
  authMiddleware as RequestHandler,
  async (req: any, res: Response, next: NextFunction) => {
    try {
      // Only allow updating certain fields for security
      const allowedFields = [
        'firstName',
        'lastName',
        'phoneNumber',
        'email',
        'addresses',
        'preferences'
      ];
      
      const updateData: any = {};
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      const user = await User.findByIdAndUpdate(
        req.user.id,
        updateData,
        { new: true }
      );
      
      if (!user) {
        res
          .status(404)
          .json({
            success: false,
            error: { code: 404, message: "User not found" },
          });
        return;
      }
      
      res.json({ success: true, data: user, message: "Profile updated successfully" });
    } catch (err) {
      res
        .status(500)
        .json({
          success: false,
          error: { code: 500, message: "Failed to update user profile" },
        });
    }
  }
);

// List all users with pagination, filtering, and search
router.get("/", async (req, res, next) => {
  try {
    const { filter, page, limit, skip, search } = parseQuery(req, [
      "username",
      "firstName",
      "lastName",
      "phoneNumber",
      "email",
    ]);

    // Enhanced full name search
    if (search && search.includes(" ")) {
      const parts = search.trim().split(/\s+/);
      if (parts.length >= 2) {
        // Try both orders: firstName + lastName and lastName + firstName
        filter.$or = [
          { $and: [
            { firstName: { $regex: `^${parts[0]}`, $options: "i" } },
            { lastName: { $regex: `^${parts.slice(1).join(" ")}`, $options: "i" } }
          ] },
          { $and: [
            { firstName: { $regex: `^${parts.slice(1).join(" ")}`, $options: "i" } },
            { lastName: { $regex: `^${parts[0]}`, $options: "i" } }
          ] }
        ];
      }
    }

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

// Address management routes
// Add new address
router.post("/me/addresses", authMiddleware as RequestHandler, async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({
        success: false,
        error: { code: 404, message: "User not found" },
      });
      return;
    }

    const newAddress = {
      ...req.body,
      _id: new Date().getTime().toString(), // Generate a temporary ID
    };

    // If this is the first address, make it default
    if (!user.addresses || user.addresses.length === 0) {
      newAddress.isDefault = true;
    }

    // If the new address is set as default, remove default from other addresses
    if (newAddress.isDefault && user.addresses) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({
      success: true,
      data: newAddress,
      message: "Address added successfully"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 500, message: "Failed to add address" },
    });
  }
});

// Update address
router.put("/me/addresses/:addressId", authMiddleware as RequestHandler, async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({
        success: false,
        error: { code: 404, message: "User not found" },
      });
      return;
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id === req.params.addressId);
    if (addressIndex === -1) {
      res.status(404).json({
        success: false,
        error: { code: 404, message: "Address not found" },
      });
      return;
    }

    // If the address is being set as default, remove default from other addresses
    if (req.body.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex],
      ...req.body,
    };

    await user.save();

    res.json({
      success: true,
      data: user.addresses[addressIndex],
      message: "Address updated successfully"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 500, message: "Failed to update address" },
    });
  }
});

// Delete address
router.delete("/me/addresses/:addressId", authMiddleware as RequestHandler, async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({
        success: false,
        error: { code: 404, message: "User not found" },
      });
      return;
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id === req.params.addressId);
    if (addressIndex === -1) {
      res.status(404).json({
        success: false,
        error: { code: 404, message: "Address not found" },
      });
      return;
    }

    const deletedAddress = user.addresses[addressIndex];
    user.addresses.splice(addressIndex, 1);

    // If the deleted address was default and there are other addresses, make the first one default
    if (deletedAddress.isDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.json({
      success: true,
      data: null,
      message: "Address deleted successfully"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 500, message: "Failed to delete address" },
    });
  }
});

// Set address as default
router.patch("/me/addresses/:addressId/default", authMiddleware as RequestHandler, async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({
        success: false,
        error: { code: 404, message: "User not found" },
      });
      return;
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id === req.params.addressId);
    if (addressIndex === -1) {
      res.status(404).json({
        success: false,
        error: { code: 404, message: "Address not found" },
      });
      return;
    }

    // Remove default from all addresses
    user.addresses.forEach(addr => addr.isDefault = false);

    // Set the specified address as default
    user.addresses[addressIndex].isDefault = true;

    await user.save();

    res.json({
      success: true,
      data: user.addresses[addressIndex],
      message: "Default address updated successfully"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 500, message: "Failed to set default address" },
    });
  }
});

export default router;
