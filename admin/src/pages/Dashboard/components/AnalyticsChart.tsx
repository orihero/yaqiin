import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useTranslation } from 'react-i18next';
import type { DashboardStats } from '../../../../../shared/types/analytics';

interface AnalyticsChartProps {
  stats?: DashboardStats;
}

function AnalyticsChart({ stats }: AnalyticsChartProps) {
  const { t } = useTranslation();
  
  const mockData = [
    { day: t('common.weekDays.mon'), value1: 0, value2: 0 },
    { day: t('common.weekDays.tue'), value1: 18, value2: 12 },
    { day: t('common.weekDays.wed'), value1: 14, value2: 20 },
    { day: t('common.weekDays.thu'), value1: 17, value2: 13 },
    { day: t('common.weekDays.fri'), value1: 23, value2: 25 },
    { day: t('common.weekDays.sat'), value1: 27, value2: 20 },
    { day: t('common.weekDays.sun'), value1: 30, value2: 24 },
  ];
  // You can use stats here as needed
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mockData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="day" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip contentStyle={{ background: '#1e293b', border: 'none', color: '#f1f5f9' }} />
          <Line type="monotone" dataKey="value1" stroke="#38bdf8" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="value2" stroke="#a78bfa" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AnalyticsChart; 