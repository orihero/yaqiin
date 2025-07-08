import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: { code: 401, message: 'No token provided' } });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, error: { code: 401, message: 'User not found' } });
    }
    // Attach user to request
    (req as any).user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: { code: 401, message: 'Invalid token' } });
  }
};

export default authMiddleware; 