import React from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import AnalyticsChart from './components/AnalyticsChart';
import DashboardWidgetsSection from './components/DashboardWidgetsSection';
import TopGroceryProductsTable from './components/TopGroceryProductsTable';
import { useQuery } from '@tanstack/react-query';
import analyticsService from '../../services/analyticsService';
import type { DashboardStats } from '../../../../shared/types/analytics';

function Dashboard() {
  const { t } = useTranslation();
  
  const { data, isLoading, error } = useQuery<{ success: boolean; data: DashboardStats }, Error>({
    queryKey: ['dashboardStats'],
    queryFn: analyticsService.getDashboardStats,
  });

  // Prepare hero stats from API data if available
  const heroStats = data?.data ? [
    {
      title: `${data.data.totalOrders?.value ?? 0} ${t('dashboard.stats.totalOrders').toLowerCase()}`,
      sublabel: t('dashboard.charts.ordersChart'),
      icon: 'mdi:calendar-check',
      iconBg: 'bg-cyan-900',
      iconColor: 'text-cyan-300',
      emoji: '📊',
      growth: data.data.totalOrders?.percent != null ? `${data.data.totalOrders.percent.toFixed(1)}%` : undefined,
      growthType: data.data.totalOrders?.percent && data.data.totalOrders.percent > 0 ? 'up' : 'down',
    },
    {
      title: `${data.data.newUsers?.value ?? 0} ${t('dashboard.stats.totalUsers').toLowerCase()}`,
      sublabel: t('dashboard.charts.usersChart'),
      icon: 'mdi:account-plus',
      iconBg: 'bg-[#3b263a]',
      iconColor: 'text-[#a78bfa]',
      emoji: '👥',
      growth: data.data.newUsers?.percent != null ? `${data.data.newUsers.percent.toFixed(1)}%` : undefined,
      growthType: data.data.newUsers?.percent && data.data.newUsers.percent > 0 ? 'up' : 'down',
    },
    {
      title: `${data.data.totalRevenue?.value?.toLocaleString() ?? 0} ${t('dashboard.stats.totalRevenue').toLowerCase()}`,
      sublabel: t('dashboard.charts.revenueChart'),
      icon: 'mdi:currency-usd',
      iconBg: 'bg-[#164e43]',
      iconColor: 'text-[#14b8a6]',
      emoji: '💰',
      growth: data.data.totalRevenue?.percent != null ? `${data.data.totalRevenue.percent.toFixed(1)}%` : undefined,
      growthType: data.data.totalRevenue?.percent && data.data.totalRevenue.percent > 0 ? 'up' : 'down',
    },
  ] : [];

  return (
    <div className="min-h-screen bg-[#192132] text-gray-100 p-6">
      {isLoading && <div className="text-center py-10">🔄 {t('common.loading')}</div>}
      {error && <div className="text-center py-10 text-red-400">❌ {t('modals.errorOccurred')}</div>}
      {!isLoading && !error && (
        <>
          {/* Hero Section */}
          <div className="bg-[#232c43] rounded-2xl px-8 py-6 flex flex-col md:flex-row items-center gap-8 shadow-lg justify-between">
            {/* Left: Greeting, Stats */}
            <div className="flex flex-col justify-center min-w-[260px] items-start flex-1">
              <h2 className="text-xl font-bold mb-1">🎉 {t('dashboard.welcome')}</h2>
              <div className="text-gray-400 mb-4 text-sm">📈 {t('dashboard.overview')}</div>
              <div className="flex flex-col gap-3 w-full">
                {heroStats.map((stat) => (
                  <div key={stat.title} className="flex items-center gap-3">
                    <span className={`rounded-xl ${stat.iconBg} flex items-center justify-center w-10 h-10`}>
                      <span className="text-lg">{stat.emoji}</span>
                    </span>
                    <div>
                      <div className="font-semibold text-base leading-tight">{stat.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{stat.sublabel}</div>
                      {stat.growth && (
                        <div className={`text-xs font-semibold ${stat.growthType === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                          {stat.growthType === 'up' ? '📈' : '📉'} {stat.growth}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Illustration */}
            <div className="flex items-center justify-center min-w-[180px] mx-4">
              <span className="text-8xl">📊</span>
            </div>
            {/* Right: Main Chart */}
            <div className="flex-1 min-w-[320px] flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-base font-semibold">📋 {t('dashboard.stats.totalOrders')}</div>
                  <div className="text-gray-400 text-xs">📅 {t('dashboard.charts.ordersChart')}</div>
                </div>
                <button className="bg-transparent border border-[#2e3952] text-gray-300 px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
                  📅 {t('common.thisWeek', 'This Week')}
                  <Icon icon="mdi:chevron-down" className="text-base" />
                </button>
              </div>
              <div className="flex-1">
                <AnalyticsChart stats={data?.data} />
              </div>
            </div>
          </div>
          {/* Lower widgets section */}
          <DashboardWidgetsSection stats={data?.data} />
          <TopGroceryProductsTable topProducts={data?.data?.topProducts} />
        </>
      )}
    </div>
  );
}

export default Dashboard; 