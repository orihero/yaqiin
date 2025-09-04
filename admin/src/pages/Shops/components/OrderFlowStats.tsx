import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { OrderFlowService } from '../../../services/orderFlowService';

interface OrderFlowStatsProps {
  shopId: string;
}

interface FlowStats {
  totalSteps: number;
  activeSteps: number;
  totalDestinations: number;
  customFlow: boolean;
  lastModified?: Date;
}

export default function OrderFlowStats({ shopId }: OrderFlowStatsProps) {
  // Fetch the current flow for this shop
  const { data: shopFlow, isLoading } = useQuery({
    queryKey: ['shop-order-flow', shopId],
    queryFn: () => OrderFlowService.getFlowForShop(shopId),
    enabled: !!shopId,
  });

  // Calculate statistics
  const getFlowStats = (): FlowStats => {
    if (!shopFlow) return {
      totalSteps: 0,
      activeSteps: 0,
      totalDestinations: 0,
      customFlow: false,
    };

    const activeSteps = shopFlow.steps.filter(step => step.isActive);
    const totalDestinations = activeSteps.reduce((sum, step) => 
      sum + step.forwardingDestinations.length, 0
    );

    return {
      totalSteps: shopFlow.steps.length,
      activeSteps: activeSteps.length,
      totalDestinations,
      customFlow: !shopFlow.isDefault,
      lastModified: shopFlow.updatedAt,
    };
  };

  const stats = getFlowStats();

  if (isLoading) {
    return (
      <div className="bg-[#1a2236] rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-600 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-600 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a2236] rounded-lg p-4 mb-6">
      <h3 className="font-semibold mb-4">Flow Statistics</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#232b42] rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-400">{stats.totalSteps}</div>
          <div className="text-sm text-gray-400">Total Steps</div>
        </div>
        
        <div className="bg-[#232b42] rounded-lg p-3">
          <div className="text-2xl font-bold text-green-400">{stats.activeSteps}</div>
          <div className="text-sm text-gray-400">Active Steps</div>
        </div>
        
        <div className="bg-[#232b42] rounded-lg p-3">
          <div className="text-2xl font-bold text-purple-400">{stats.totalDestinations}</div>
          <div className="text-sm text-gray-400">Destinations</div>
        </div>
        
        <div className="bg-[#232b42] rounded-lg p-3">
          <div className="text-2xl font-bold text-orange-400">
            {stats.customFlow ? 'Custom' : 'Default'}
          </div>
          <div className="text-sm text-gray-400">Flow Type</div>
        </div>
      </div>

      {stats.lastModified && (
        <div className="mt-4 text-sm text-gray-400">
          Last modified: {new Date(stats.lastModified).toLocaleDateString()}
        </div>
      )}
    </div>
  );
} 