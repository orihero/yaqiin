import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import fs from 'fs';

const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  console.log('Authorization header:', authHeader);
  console.log('JWT_SECRET at middleware:', process.env.JWT_SECRET);
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: { code: 401, message: 'No token provided' } });
    return;
  }
  
  const token = authHeader.split(' ')[1];
  console.log('Token received:', token);
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    console.log('Decoded token:', decoded);
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log('User not found for id:', decoded.id);
      res.status(401).json({ success: false, error: { code: 401, message: 'User not found' } });
      return;
    }
    // Attach user to request
    (req as any).user = user;
    next();
  } catch (err) {
    console.error('JWT verification error:', err);
    res.status(401).json({ success: false, error: { code: 401, message: 'Invalid token' } });
  }
};

export default authMiddleware;