import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getOrdersByShop } from '../../../services/orderService';

interface OrderFlowActivityProps {
  shopId: string;
}

interface OrderActivity {
  _id: string;
  orderNumber: string;
  status: string;
  statusHistory: Array<{
    status: string;
    timestamp: Date;
    updatedBy: string;
    notes?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export default function OrderFlowActivity({ shopId }: OrderFlowActivityProps) {
  // Fetch recent orders for this shop
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['shop-orders', shopId],
    queryFn: () => getOrdersByShop(shopId),
    enabled: !!shopId,
  });

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      created: '🆕',
      confirmed: '✅',
      packing: '📦',
      packed: '📋',
      courier_picked: '🚚',
      delivered: '🎯',
      paid: '💰',
      rejected: '❌',
    };
    return icons[status] || '📋';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      created: 'text-blue-300',
      confirmed: 'text-green-300',
      packing: 'text-yellow-300',
      packed: 'text-orange-300',
      courier_picked: 'text-purple-300',
      delivered: 'text-red-300',
      paid: 'text-green-400',
      rejected: 'text-red-400',
    };
    return colors[status] || 'text-gray-300';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRecentActivity = () => {
    if (!ordersData?.data) return [];

    const orders = ordersData.data as OrderActivity[];
    
    // Get all status changes from all orders
    const allStatusChanges = orders.flatMap(order => 
      order.statusHistory?.map(history => ({
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: history.status,
        timestamp: new Date(history.timestamp),
        updatedBy: history.updatedBy,
        notes: history.notes,
      })) || []
    );

    // Sort by timestamp (most recent first) and take the last 10
    return allStatusChanges
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
  };

  const recentActivity = getRecentActivity();

  if (isLoading) {
    return (
      <div className="bg-[#1a2236] rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-600 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-600 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a2236] rounded-lg p-4 mb-6">
      <h3 className="font-semibold mb-4">Recent Flow Activity</h3>
      
      {recentActivity.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">📋</div>
          <p className="text-gray-400">No recent activity</p>
          <p className="text-sm text-gray-500">Order status changes will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-[#232b42] rounded-lg">
              <div className={`text-lg ${getStatusColor(activity.status)}`}>
                {getStatusIcon(activity.status)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">
                    Order #{activity.orderNumber}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(activity.status)} bg-opacity-20`}>
                    {activity.status}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {formatDate(activity.timestamp)}
                  {activity.notes && (
                    <span className="ml-2">• {activity.notes}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {recentActivity.length > 0 && (
        <div className="mt-4 text-center">
          <button className="text-blue-400 hover:text-blue-300 text-sm">
            View All Activity
          </button>
        </div>
      )}
    </div>
  );
} 