import { RequestHandler, Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { loginWithTelegram } from '../authController';

const router = Router();

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password } = req.body;
    console.log('Login attempt:', { username, email, password });
    if (!password || (!username && !email)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Username/email and password are required.",
        },
      });
    }
    const user = await User.findOne(username ? { username } : { email }).select(
      "+password"
    );
    console.log('User found:', user);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid username/email or password.",
        },
      });
    }
    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid username/email or password.",
        },
      });
    }
    // Create JWT
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
router.post("/login", login as RequestHandler);

// Telegram Mini App seamless auth
router.post('/telegram', loginWithTelegram);

export default router;
