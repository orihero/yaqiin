import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OrderFlowService } from '../../../services/orderFlowService';
import { OrderFlow, OrderFlowStep } from '@yaqiin/shared/types/orderFlow';
import OrderFlowStats from './OrderFlowStats';
import OrderFlowActivity from './OrderFlowActivity';
import OrderFlowHelp from './OrderFlowHelp';
import OrderFlowFormModal from '../../../components/OrderFlow/OrderFlowFormModal';
import { getUsers } from '../../../services/userService';
import { getUnassignedGroups } from '../../../services/shopService';

interface OrderFlowManagerProps {
  shopId: string;
  showCreateModal?: boolean;
  setShowCreateModal?: (show: boolean) => void;
  editingFlow?: any;
  setEditingFlow?: (flow: any) => void;
}

export default function OrderFlowManager({ 
  shopId, 
  showCreateModal: externalShowCreateModal, 
  setShowCreateModal: externalSetShowCreateModal,
  editingFlow: externalEditingFlow,
  setEditingFlow: externalSetEditingFlow
}: OrderFlowManagerProps) {
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [localEditingFlow, setLocalEditingFlow] = useState<OrderFlow | null>(null);
  const [showFlowComparison, setShowFlowComparison] = useState(false);
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [currentDestinationIndex, setCurrentDestinationIndex] = useState<number | null>(null);
  const [currentDestinationType, setCurrentDestinationType] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Use external editingFlow if provided, otherwise use local
  const editingFlow = externalEditingFlow !== undefined ? externalEditingFlow : localEditingFlow;
  const setEditingFlow = externalSetEditingFlow || setLocalEditingFlow;

  // Fetch the current flow for this shop
  const { data: shopFlow, isLoading: flowLoading, error: flowError } = useQuery({
    queryKey: ['shop-order-flow', shopId],
    queryFn: () => OrderFlowService.getFlowForShop(shopId),
    enabled: !!shopId,
  });

  // Fetch the default flow for comparison
  const { data: defaultFlow, isLoading: defaultFlowLoading } = useQuery({
    queryKey: ['default-order-flow'],
    queryFn: () => OrderFlowService.getAllFlows().then(flows => flows.find(f => f.isDefault)),
  });

  // Fetch users for telegram_user suggestions
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users-for-suggestions'],
    queryFn: () => getUsers(1, 100, '').then(res => res.data || []),
    enabled: showCustomizeModal,
  });

  // Fetch groups for telegram_group suggestions
  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ['groups-for-suggestions'],
    queryFn: () => getUnassignedGroups(),
    enabled: showCustomizeModal,
  });

  // Mutation to set custom flow
  const setCustomFlowMutation = useMutation({
    mutationFn: async (flowData: Partial<OrderFlow>) => {
      return OrderFlowService.createFlow({
        ...flowData,
        shopId,
        isDefault: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-order-flow', shopId] });
      setShowCustomizeModal(false);
    },
  });

  // Mutation to update flow
  const updateFlowMutation = useMutation({
    mutationFn: async ({ flowId, flowData }: { flowId: string; flowData: Partial<OrderFlow> }) => {
      return OrderFlowService.updateFlow(flowId, flowData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-order-flow', shopId] });
      setShowCustomizeModal(false);
    },
  });

  // Mutation to reset to default
  const resetToDefaultMutation = useMutation({
    mutationFn: async () => {
      // Delete any custom flow for this shop
      if (shopFlow && !shopFlow.isDefault) {
        await OrderFlowService.deleteFlow(shopFlow._id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-order-flow', shopId] });
    },
  });

  const currentFlow = shopFlow || defaultFlow;
  const isUsingCustomFlow = shopFlow && !shopFlow.isDefault;

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

  const getStatusDescription = (status: string) => {
    const descriptions: Record<string, string> = {
      created: 'Order has been created and needs operator confirmation',
      confirmed: 'Order confirmed by operator, sent to shop owner',
      packing: 'Order is being packed by shop',
      packed: 'Order has been packed and is ready for courier pickup',
      courier_picked: 'Order has been picked up by courier',
      delivered: 'Order has been delivered to customer',
      paid: 'Order has been paid and completed',
      rejected: 'Order has been rejected',
    };
    return descriptions[status] || 'No description available';
  };

  const handleEditFlow = () => {
    if (currentFlow) {
      const flowCopy = JSON.parse(JSON.stringify(currentFlow)); // Deep copy
      setEditingFlow(flowCopy);
      setShowCustomizeModal(true);
    }
  };

  const handleCreateNewFlow = () => {
    if (externalSetEditingFlow) {
      externalSetEditingFlow(null);
    } else {
      setEditingFlow(null);
    }
    if (externalSetShowCreateModal) {
      externalSetShowCreateModal(true);
    } else {
      setShowCreateModal(true);
    }
  };

  const handleSaveFlow = () => {
    if (!editingFlow) return;

    if (isUsingCustomFlow) {
      // Update existing custom flow
      updateFlowMutation.mutate({
        flowId: shopFlow!._id,
        flowData: editingFlow
      });
    } else {
      // Create new custom flow
      setCustomFlowMutation.mutate(editingFlow);
    }
  };

  const updateStep = (stepStatus: string, updates: Partial<OrderFlowStep>) => {
    if (!editingFlow) return;

    setEditingFlow({
      ...editingFlow,
      steps: editingFlow.steps.map((step: OrderFlowStep) => 
        step.status === stepStatus ? { ...step, ...updates } : step
      )
    });
  };

  const updateDestination = (stepStatus: string, destIndex: number, updates: any) => {
    console.log('updateDestination called with:', { stepStatus, destIndex, updates });
    if (!editingFlow) {
      console.log('No editingFlow, returning');
      return;
    }

    console.log('Current editingFlow before update:', editingFlow);
    
    setEditingFlow({
      ...editingFlow,
      steps: editingFlow.steps.map((step: OrderFlowStep) => {
        if (step.status === stepStatus) {
          const newDestinations = [...step.forwardingDestinations];
          newDestinations[destIndex] = { ...newDestinations[destIndex], ...updates };
          console.log('Updated destination at index', destIndex, ':', newDestinations[destIndex]);
          return { ...step, forwardingDestinations: newDestinations };
        }
        return step;
      })
    });
  };

  const addDestination = (stepStatus: string) => {
    if (!editingFlow) return;

    setEditingFlow({
      ...editingFlow,
      steps: editingFlow.steps.map((step: OrderFlowStep) => {
        if (step.status === stepStatus) {
          return {
            ...step,
            forwardingDestinations: [
              ...step.forwardingDestinations,
              {
                type: 'telegram_group' as const,
                identifier: '',
                name: '',
                isActive: true
              }
            ]
          };
        }
        return step;
      })
    });
  };

  const removeDestination = (stepStatus: string, destIndex: number) => {
    if (!editingFlow) return;

    setEditingFlow({
      ...editingFlow,
      steps: editingFlow.steps.map((step: OrderFlowStep) => {
        if (step.status === stepStatus) {
          const newDestinations = step.forwardingDestinations.filter((_: any, idx: number) => idx !== destIndex);
          return { ...step, forwardingDestinations: newDestinations };
        }
        return step;
      })
    });
  };

  const handleCreateModalClose = () => {
    if (externalSetShowCreateModal) {
      externalSetShowCreateModal(false);
    } else {
      setShowCreateModal(false);
    }
    if (externalSetEditingFlow) {
      externalSetEditingFlow(null);
    } else {
      setEditingFlow(null);
    }
  };

  const handleIdentifierFocus = (stepStatus: string, destIndex: number, type: string) => {
    console.log('handleIdentifierFocus called:', { stepStatus, destIndex, type });
    setCurrentDestinationIndex(destIndex);
    setCurrentDestinationType(type);
    setActiveStep(stepStatus);
    setShowSuggestions(true);
  };

  const handleIdentifierChange = (stepStatus: string, destIndex: number, value: string, type: string) => {
    console.log('handleIdentifierChange called:', { stepStatus, destIndex, value, type });
    updateDestination(stepStatus, destIndex, { identifier: value });
    
    // Filter suggestions based on type and value
    if (value.trim()) {
      if (type === 'telegram_user' && usersData) {
        const filtered = usersData.filter((user: any) => 
          user.telegramId?.includes(value) || 
          user.username?.includes(value) ||
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(value.toLowerCase())
        );
        console.log('Filtered users:', filtered);
        setSuggestions(filtered);
      } else if (type === 'telegram_group' && groupsData) {
        const filtered = groupsData.filter((group: any) => 
          group.chatId?.toString().includes(value) || 
          group.title?.toLowerCase().includes(value.toLowerCase())
        );
        console.log('Filtered groups:', filtered);
        setSuggestions(filtered);
      }
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (suggestion: any) => {
    console.log('selectSuggestion called with:', suggestion);
    console.log('Current state:', { currentDestinationIndex, currentDestinationType, activeStep });
    
    if (currentDestinationIndex !== null && currentDestinationType && activeStep) {
      if (currentDestinationType === 'telegram_user') {
        const updates = {
          identifier: suggestion.telegramId,
          name: `${suggestion.firstName} ${suggestion.lastName}`.trim()
        };
        console.log('Updating telegram user with:', updates);
        updateDestination(activeStep, currentDestinationIndex, updates);
      } else if (currentDestinationType === 'telegram_group') {
        const updates = {
          identifier: suggestion.chatId.toString(),
          name: suggestion.title || suggestion.chatId.toString()
        };
        console.log('Updating telegram group with:', updates);
        updateDestination(activeStep, currentDestinationIndex, updates);
      }
    }
    // Close suggestions after a small delay to ensure the update is processed
    setTimeout(() => {
      setShowSuggestions(false);
    }, 100);
  };

  // Close suggestions when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.suggestions-container')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (flowLoading || defaultFlowLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading order flow...</p>
        </div>
      </div>
    );
  }

  if (flowError) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 mb-4">
          <div className="text-2xl mb-2">⚠️</div>
          Error loading order flow
        </div>
        <p className="text-gray-400 mb-4">{String(flowError)}</p>
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['shop-order-flow', shopId] })}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!currentFlow) {
    return (
      <div className="text-center py-8">
        <div className="text-yellow-400 mb-4">
          <div className="text-2xl mb-2">⚠️</div>
          No order flow available
        </div>
        <p className="text-gray-400 mb-4">No default order flow has been configured yet.</p>
        <div className="flex gap-2 justify-center">
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['default-order-flow'] })}
          >
            Retry
          </button>
          <button 
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            onClick={handleCreateNewFlow}
          >
            Create New Flow
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Help Section */}
      <OrderFlowHelp />

      {/* Flow Statistics and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <OrderFlowStats shopId={shopId} />
        <OrderFlowActivity shopId={shopId} />
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Order Flow Management</h2>
          <p className="text-sm text-gray-400 mt-1">
            Configure how orders flow through different statuses and who gets notified at each step
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm"
            onClick={handleCreateNewFlow}
            title="Create a new order flow for this shop"
          >
            Create New Flow
          </button>
          <button 
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm"
            onClick={() => setShowFlowComparison(!showFlowComparison)}
            title="Compare current flow with default flow"
          >
            {showFlowComparison ? 'Hide' : 'Show'} Flow Comparison
          </button>
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
            onClick={handleEditFlow}
            title="Customize the order flow for this shop"
          >
            Customize Flow
          </button>
          {isUsingCustomFlow && (
            <button 
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded text-sm"
              onClick={() => resetToDefaultMutation.mutate()}
              disabled={resetToDefaultMutation.isPending}
              title="Reset to use the default flow"
            >
              {resetToDefaultMutation.isPending ? 'Resetting...' : 'Reset to Default'}
            </button>
          )}
        </div>
      </div>
      
      {/* Flow Status */}
      <div className="bg-[#1a2236] rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">
              {isUsingCustomFlow ? 'Custom Flow' : 'Default Flow'}
            </h3>
            <p className="text-sm text-gray-400">
              {isUsingCustomFlow 
                ? 'This shop uses a custom order flow configuration'
                : 'This shop uses the default order flow configuration'
              }
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Flow Status</div>
            <div className={`text-sm font-semibold ${isUsingCustomFlow ? 'text-green-400' : 'text-blue-400'}`}>
              {isUsingCustomFlow ? 'Custom' : 'Default'}
            </div>
          </div>
        </div>
      </div>

      {/* Flow Comparison */}
      {showFlowComparison && shopFlow && defaultFlow && (
        <div className="bg-[#1a2236] rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-4">Flow Comparison</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-blue-400 mb-2">Current Flow</h4>
              <div className="text-xs text-gray-400">
                {shopFlow.steps.length} steps configured
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-green-400 mb-2">Default Flow</h4>
              <div className="text-xs text-gray-400">
                {defaultFlow.steps.length} steps configured
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flow Steps Overview */}
      {currentFlow && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {currentFlow.steps
            .filter(step => step.isActive)
            .sort((a, b) => a.order - b.order)
            .map((step: OrderFlowStep) => (
              <div 
                key={step.status} 
                className={`bg-[#1a2236] rounded-lg p-4 cursor-pointer transition-all hover:bg-[#2a3246] ${
                  activeStep === step.status ? 'ring-2 ring-blue-400' : ''
                }`}
                onClick={() => setActiveStep(activeStep === step.status ? null : step.status)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{getStatusIcon(step.status)}</span>
                  <h3 className={`font-semibold ${getStatusColor(step.status)}`}>
                    {step.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-400 mb-3">
                  {getStatusDescription(step.status)}
                </p>
                <div className="space-y-2">
                  {step.forwardingDestinations.length > 0 ? (
                    <div>
                      <p className="text-sm text-gray-400">Forwards to:</p>
                      <ul className="text-sm text-gray-300 ml-2">
                        {step.forwardingDestinations.map((dest, idx) => (
                          <li key={idx} className="flex items-center gap-1">
                            <span className="text-xs">
                              {dest.type === 'telegram_user' ? '👤' : 
                               dest.type === 'telegram_group' ? '👥' : '📢'}
                            </span>
                            {dest.name || dest.identifier}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No forwarding destinations</p>
                  )}
                  <div>
                    <p className="text-sm text-gray-400">Authorized roles:</p>
                    <p className="text-sm text-gray-300">{step.authorizedRoles.join(', ')}</p>
                  </div>
                  {step.nextStatuses.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-400">Next possible statuses:</p>
                      <p className="text-sm text-gray-300">{step.nextStatuses.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Customize Flow Modal */}
      {showCustomizeModal && editingFlow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all"
            onClick={() => setShowCustomizeModal(false)}
          />
          <div className="relative bg-[#232b42] shadow-2xl rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Customize Order Flow</h2>
                <button 
                  className="text-gray-400 hover:text-white"
                  onClick={() => setShowCustomizeModal(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                <p className="text-gray-300">
                  Configure the order flow for this shop. You can modify forwarding destinations, 
                  authorized roles, and next possible statuses for each order stage.
                </p>
                
                {/* Flow Steps Editor */}
                <div className="space-y-4">
                  {editingFlow.steps.map((step: OrderFlowStep) => (
                    <div key={step.status} className="bg-[#1a2236] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">{getStatusIcon(step.status)}</span>
                        <h3 className={`font-semibold ${getStatusColor(step.status)}`}>
                          {step.name}
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Forwarding Destinations
                          </label>
                          <div className="space-y-2">
                            {step.forwardingDestinations.map((dest, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <select 
                                  className="bg-[#232b42] text-white px-2 py-1 rounded text-sm"
                                  value={dest.type}
                                  onChange={(e) => updateDestination(step.status, idx, { type: e.target.value })}
                                >
                                  <option value="telegram_user">👤 User</option>
                                  <option value="telegram_group">👥 Group</option>
                                  <option value="telegram_channel">📢 Channel</option>
                                </select>
                                <div className="relative suggestions-container flex-1">
                                  <input 
                                    type="text" 
                                    placeholder={
                                      dest.type === 'telegram_user' 
                                        ? 'Search by Telegram ID, username, or name' 
                                        : dest.type === 'telegram_group'
                                        ? 'Search by group ID or title'
                                        : 'Telegram ID or username'
                                    }
                                    className="bg-[#232b42] text-white px-2 py-1 rounded text-sm w-full"
                                    value={dest.identifier || ''}
                                    onChange={(e) => handleIdentifierChange(step.status, idx, e.target.value, dest.type)}
                                    onFocus={() => handleIdentifierFocus(step.status, idx, dest.type)}
                                  />
                                  
                                  {/* Suggestions Dropdown */}
                                  {showSuggestions && currentDestinationIndex === idx && (
                                    <div className="absolute z-50 w-full mt-1 bg-[#232b42] border border-[#363f5f] rounded-md shadow-lg max-h-60 overflow-y-auto">
                                      <div className="p-2">
                                        {currentDestinationType === 'telegram_user' && usersLoading ? (
                                          <div className="p-2 text-sm text-gray-400">Loading users...</div>
                                        ) : currentDestinationType === 'telegram_group' && groupsLoading ? (
                                          <div className="p-2 text-sm text-gray-400">Loading groups...</div>
                                        ) : suggestions.length > 0 ? (
                                          suggestions.map((suggestion, suggestionIndex) => (
                                            <div
                                              key={suggestionIndex}
                                              className="p-2 cursor-pointer hover:bg-[#363f5f] rounded text-sm"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                console.log('Suggestion clicked:', suggestion);
                                                selectSuggestion(suggestion);
                                              }}
                                            >
                                              {currentDestinationType === 'telegram_user' ? (
                                                <div>
                                                  <div className="text-white">
                                                    {suggestion.firstName} {suggestion.lastName}
                                                  </div>
                                                  <div className="text-gray-400 text-xs">
                                                    @{suggestion.username} • {suggestion.telegramId}
                                                  </div>
                                                </div>
                                              ) : currentDestinationType === 'telegram_group' ? (
                                                <div>
                                                  <div className="text-white">
                                                    {suggestion.title || `Group ${suggestion.chatId}`}
                                                  </div>
                                                  <div className="text-gray-400 text-xs">
                                                    ID: {suggestion.chatId} • Type: {suggestion.type}
                                                  </div>
                                                </div>
                                              ) : (
                                                <div className="text-white">{suggestion.identifier}</div>
                                              )}
                                            </div>
                                          ))
                                        ) : (
                                          <div className="p-2 text-sm text-gray-400">
                                            {currentDestinationType === 'telegram_user' 
                                              ? 'No users found' 
                                              : currentDestinationType === 'telegram_group'
                                              ? 'No groups found'
                                              : 'No suggestions available'
                                            }
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <input 
                                  type="text" 
                                  placeholder="Name (optional)"
                                  className="bg-[#232b42] text-white px-2 py-1 rounded text-sm flex-1"
                                  value={dest.name || ''}
                                  onChange={(e) => updateDestination(step.status, idx, { name: e.target.value })}
                                />
                                <button 
                                  className="text-red-400 hover:text-red-300"
                                  onClick={() => removeDestination(step.status, idx)}
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                            <button 
                              className="text-blue-400 text-sm hover:text-blue-300"
                              onClick={() => addDestination(step.status)}
                            >
                              + Add Destination
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Authorized Roles
                          </label>
                          <div className="space-y-2">
                            {['User', 'Admin', 'Operator', 'ShopOwner', 'Courier'].map(role => (
                              <label key={role} className="flex items-center gap-2">
                                <input 
                                  type="checkbox" 
                                  className="rounded"
                                  checked={step.authorizedRoles.includes(role)}
                                  onChange={(e) => {
                                    const newRoles = e.target.checked
                                      ? [...step.authorizedRoles, role]
                                      : step.authorizedRoles.filter(r => r !== role);
                                    updateStep(step.status, { authorizedRoles: newRoles });
                                  }}
                                />
                                <span className="text-sm text-gray-300">{role}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end gap-4 pt-4 border-t border-[#2e3650]">
                  <button 
                    className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700"
                    onClick={() => setShowCustomizeModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
                    onClick={handleSaveFlow}
                    disabled={setCustomFlowMutation.isPending || updateFlowMutation.isPending}
                  >
                    {setCustomFlowMutation.isPending || updateFlowMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
} 