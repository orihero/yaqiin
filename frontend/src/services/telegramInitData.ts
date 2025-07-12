import { retrieveLaunchParams, init } from '@telegram-apps/sdk';

export function getTelegramInitDataRaw() {
  init(); // Safe to call multiple times
  const { initDataRaw } = retrieveLaunchParams();
  return initDataRaw;
} 