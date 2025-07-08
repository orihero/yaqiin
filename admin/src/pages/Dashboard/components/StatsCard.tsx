import React from 'react';
import { Icon } from '@iconify/react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string; // Iconify icon name
  iconBg: string; // Tailwind bg color class
  iconColor: string; // Tailwind text color class
  growth?: string; // e.g. '+8.2%'
  growthType?: 'up' | 'down';
}

const growthIcon = {
  up: 'mdi:arrow-up-bold',
  down: 'mdi:arrow-down-bold',
};

const growthColor = {
  up: 'text-green-400',
  down: 'text-red-400',
};

function StatsCard({ title, value, icon, iconBg, iconColor, growth, growthType }: StatsCardProps) {
  return (
    <div className="bg-gray-800 rounded-2xl p-5 shadow flex items-center gap-4 min-h-[100px]">
      <div className={`rounded-full ${iconBg} flex items-center justify-center w-14 h-14`}>
        <Icon icon={icon} className={`text-3xl ${iconColor}`} />
      </div>
      <div className="flex-1">
        <div className="text-gray-400 text-sm font-medium mb-1">{title}</div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-100">{value}</span>
          {growth && growthType && (
            <span className={`flex items-center text-xs font-semibold ${growthColor[growthType]}`}>
              <Icon icon={growthIcon[growthType]} className="inline-block mr-1" />
              {growth}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default StatsCard; 