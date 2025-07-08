import { Request, Response, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import User from './models/User';
import crypto from 'crypto';

// TODO: Move secret to env
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN';
const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_JWT_SECRET';

function parseInitData(initData: string) {
  // Parse query string into object
  return Object.fromEntries(new URLSearchParams(initData));
}

function validateTelegramInitData(initData: string): any {
  if (!initData) return null;
  const data = parseInitData(initData);
  const { hash, ...authData } = data;
  // 1. Sort keys alphabetically and build data_check_string
  const dataCheckArr = Object.keys(authData)
    .sort()
    .map((key) => `${key}=${authData[key]}`);
  const dataCheckString = dataCheckArr.join('\n');
  // 2. Create secret key
  const secret = crypto.createHmac('sha256', 'WebAppData').update(TELEGRAM_BOT_TOKEN).digest();
  // 3. Calculate HMAC-SHA256
  const hmac = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');
  // 4. Compare hashes
  if (hmac !== hash) return null;
  // 5. Optionally check auth_date (timestamp)
  const now = Math.floor(Date.now() / 1000);
  if (authData.auth_date && now - Number(authData.auth_date) > 86400) return null; // 24h expiry
  // 6. Return user info
  return {
    id: authData.id,
    first_name: authData.first_name,
    last_name: authData.last_name,
    username: authData.username,
    photo_url: authData.photo_url,
  };
}

export const loginWithTelegram: RequestHandler = async (req, res) => {
  const { initData } = req.body;
  if (!initData) {
    res.status(400).json({ success: false, error: { code: 'NO_INIT_DATA', message: 'initData is required' } });
    return;
  }
  const telegramUser = validateTelegramInitData(initData);
  if (!telegramUser) {
    res.status(401).json({ success: false, error: { code: 'INVALID_INIT_DATA', message: 'Invalid Telegram initData' } });
    return;
  }
  // Find or create user
  let user = await User.findOne({ telegramId: telegramUser.id });
  if (!user) {
    user = await User.create({
      telegramId: telegramUser.id,
      firstName: telegramUser.first_name,
      lastName: telegramUser.last_name,
      username: telegramUser.username,
      photoUrl: telegramUser.photo_url,
    });
  }
  // Issue JWT
  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, data: { token, user } });
}; 