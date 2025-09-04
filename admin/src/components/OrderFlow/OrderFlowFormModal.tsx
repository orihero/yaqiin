import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Icon } from '@iconify/react';
import { OrderFlowService } from '../../services/orderFlowService';
import { getUsersByRole } from '../../services/userService';
import { getGroups } from '../../services/groupService';
import { OrderFlow, OrderFlowStep, ForwardingDestination, OrderFlowRole } from '../../../../shared/types/orderFlow';

interface OrderFlowFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  flow?: OrderFlow | null;
  shopId?: string;
}

const OrderFlowFormModal: React.FC<OrderFlowFormModalProps> = ({ isOpen, onClose, flow, shopId }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shopId: '',
    isActive: true,
    steps: [] as OrderFlowStep[],
  });

  const [currentStep, setCurrentStep] = useState<OrderFlowStep>({
    status: '',
    name: '',
    description: '',
    forwardingDestinations: [],
    authorizedRoles: [],
    nextStatuses: [],
    isActive: true,
    order: 0,
  });

  const [isStepModalOpen, setIsStepModalOpen] = useState(false);
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentDestinationIndex, setCurrentDestinationIndex] = useState<number | null>(null);

  // Available roles for authorization
  const availableRoles: OrderFlowRole[] = ['User', 'Admin', 'Operator', 'ShopOwner', 'Courier'];

  // Common order statuses
  const commonStatuses = [
    'created', 'confirmed', 'packing', 'packed', 'courier_picked', 'delivered', 'paid', 'rejected', 'cancelled'
  ];

  // Forwarding destination types
  const destinationTypes = [
    { value: 'telegram_user', label: 'Telegram User' },
    { value: 'telegram_group', label: 'Telegram Group' },
    { value: 'telegram_channel', label: 'Telegram Channel' },
  ];

  // Fetch users with 'client' role for Telegram User suggestions
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users-by-role', 'client'],
    queryFn: () => getUsersByRole('client'),
    enabled: false, // Only fetch when needed
  });

  // Fetch groups for Telegram Group suggestions
  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: getGroups,
    enabled: false, // Only fetch when needed
  });

  useEffect(() => {
    if (flow) {
      setFormData({
        name: flow.name,
        description: flow.description || '',
        shopId: flow.shopId || '',
        isActive: flow.isActive,
        steps: [...flow.steps],
      });
    } else {
      setFormData({
        name: '',
        description: '',
        shopId: shopId || '',
        isActive: true,
        steps: [],
      });
    }
  }, [flow, shopId]);

  const createMutation = useMutation({
    mutationFn: OrderFlowService.createFlow,
    onSuccess: () => {
      toast.success('Order flow created successfully');
      queryClient.invalidateQueries({ queryKey: ['orderFlows'] });
      if (shopId) {
        queryClient.invalidateQueries({ queryKey: ['shop-order-flow', shopId] });
      }
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create order flow');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<OrderFlow>) => OrderFlowService.updateFlow(flow!._id, data),
    onSuccess: () => {
      toast.success('Order flow updated successfully');
      queryClient.invalidateQueries({ queryKey: ['orderFlows'] });
      if (shopId) {
        queryClient.invalidateQueries({ queryKey: ['shop-order-flow', shopId] });
      }
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update order flow');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.steps.length === 0) {
      toast.error('Please add at least one step to the flow');
      return;
    }

    const flowData = {
      ...formData,
      steps: formData.steps.map((step, index) => ({ ...step, order: index })),
    };

    if (flow) {
      updateMutation.mutate(flowData);
    } else {
      createMutation.mutate(flowData);
    }
  };

  const handleAddStep = () => {
    setCurrentStep({
      status: '',
      name: '',
      description: '',
      forwardingDestinations: [],
      authorizedRoles: [],
      nextStatuses: [],
      isActive: true,
      order: formData.steps.length,
    });
    setEditingStepIndex(null);
    setIsStepModalOpen(true);
  };

  const handleEditStep = (index: number) => {
    setCurrentStep({ ...formData.steps[index] });
    setEditingStepIndex(index);
    setIsStepModalOpen(true);
  };

  const handleDeleteStep = (index: number) => {
    const newSteps = formData.steps.filter((_, i) => i !== index);
    setFormData({ ...formData, steps: newSteps });
  };

  const handleSaveStep = () => {
    if (!currentStep.status || !currentStep.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newSteps = [...formData.steps];
    if (editingStepIndex !== null) {
      newSteps[editingStepIndex] = currentStep;
    } else {
      newSteps.push(currentStep);
    }

    setFormData({ ...formData, steps: newSteps });
    setIsStepModalOpen(false);
  };

  const addForwardingDestination = () => {
    const newDestination: ForwardingDestination = {
      type: 'telegram_user',
      identifier: '',
      name: '',
      isActive: true,
    };
    setCurrentStep({
      ...currentStep,
      forwardingDestinations: [...currentStep.forwardingDestinations, newDestination],
    });
  };

  const updateForwardingDestination = (index: number, field: keyof ForwardingDestination, value: any) => {
    console.log('updateForwardingDestination called:', { index, field, value });
    const newDestinations = [...currentStep.forwardingDestinations];
    newDestinations[index] = { ...newDestinations[index], [field]: value };
    console.log('Updated destination:', newDestinations[index]);
    setCurrentStep({ ...currentStep, forwardingDestinations: newDestinations });
  };

  const removeForwardingDestination = (index: number) => {
    const newDestinations = currentStep.forwardingDestinations.filter((_, i) => i !== index);
    setCurrentStep({ ...currentStep, forwardingDestinations: newDestinations });
  };

  const handleDestinationTypeChange = (index: number, type: string) => {
    // Update all fields at once to avoid multiple state updates
    const newDestinations = [...currentStep.forwardingDestinations];
    newDestinations[index] = { 
      ...newDestinations[index], 
      type: type as 'telegram_user' | 'telegram_group' | 'telegram_channel',
      identifier: '',
      name: ''
    };
    setCurrentStep({ ...currentStep, forwardingDestinations: newDestinations });
    
    // Fetch suggestions based on type
    if (type === 'telegram_user') {
      queryClient.fetchQuery({ queryKey: ['users-by-role', 'client'] });
    } else if (type === 'telegram_group') {
      queryClient.fetchQuery({ queryKey: ['groups'] });
    }
  };

  const handleIdentifierFocus = (index: number) => {
    setCurrentDestinationIndex(index);
    const destination = currentStep.forwardingDestinations[index];
    
    if (destination.type === 'telegram_user') {
      queryClient.fetchQuery({ queryKey: ['users-by-role', 'client'] });
      setSuggestions(usersData || []);
      setShowSuggestions(true);
    } else if (destination.type === 'telegram_group') {
      queryClient.fetchQuery({ queryKey: ['groups'] });
      setSuggestions(groupsData || []);
      setShowSuggestions(true);
    }
  };

  const handleIdentifierChange = (index: number, value: string) => {
    updateForwardingDestination(index, 'identifier', value);
    
    // Filter suggestions based on input
    const destination = currentStep.forwardingDestinations[index];
    if (destination.type === 'telegram_user' && usersData) {
      const filtered = usersData.filter((user: any) => 
        user.telegramId?.includes(value) || 
        user.username?.includes(value) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else if (destination.type === 'telegram_group' && groupsData) {
      const filtered = groupsData.filter((group: any) => 
        group.chatId?.toString().includes(value) || 
        group.title?.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    }
  };

  const selectSuggestion = (suggestion: any) => {
    console.log('selectSuggestion called with:', suggestion);
    console.log('currentDestinationIndex:', currentDestinationIndex);
    
    if (currentDestinationIndex !== null) {
      const destination = currentStep.forwardingDestinations[currentDestinationIndex];
      console.log('Current destination:', destination);
      
      if (destination.type === 'telegram_user') {
        console.log('Updating telegram user with:', suggestion.telegramId);
        // Update both fields in a single state update
        const newDestinations = [...currentStep.forwardingDestinations];
        newDestinations[currentDestinationIndex] = {
          ...newDestinations[currentDestinationIndex],
          identifier: suggestion.telegramId,
          name: `${suggestion.firstName} ${suggestion.lastName}`.trim()
        };
        setCurrentStep({ ...currentStep, forwardingDestinations: newDestinations });
      } else if (destination.type === 'telegram_group') {
        console.log('Updating telegram group with:', suggestion.chatId.toString());
        // Update both fields in a single state update
        const newDestinations = [...currentStep.forwardingDestinations];
        newDestinations[currentDestinationIndex] = {
          ...newDestinations[currentDestinationIndex],
          identifier: suggestion.chatId.toString(),
          name: suggestion.title || suggestion.chatId.toString()
        };
        setCurrentStep({ ...currentStep, forwardingDestinations: newDestinations });
      }
    }
    setShowSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
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

  if (!isOpen) return null;

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[#232b42] rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-[#2e3650]">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">
                {flow ? 'Edit Order Flow' : 'Create New Order Flow'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Icon icon="mdi:close" className="text-xl" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Flow Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[#2e3650] bg-[#1a2236] text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Shop ID {shopId ? '(pre-filled)' : '(optional)'}
                </label>
                <input
                  type="text"
                  value={formData.shopId}
                  onChange={(e) => setFormData({ ...formData, shopId: e.target.value })}
                  placeholder="Leave empty for global flow"
                  className="w-full px-3 py-2 border border-[#2e3650] bg-[#1a2236] text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  disabled={!!shopId}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-[#2e3650] bg-[#1a2236] text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-[#2e3650] rounded bg-[#1a2236]"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-300">
                  Active
                </label>
              </div>
            </div>

            {/* Steps Section */}
            <div className="border-t border-[#2e3650] pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">Flow Steps</h3>
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Icon icon="mdi:plus" />
                  Add Step
                </button>
              </div>

              {formData.steps.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No steps added yet. Click "Add Step" to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.steps.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-[#1a2236] rounded-lg border border-[#2e3650]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="bg-cyan-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          {index + 1}
                        </span>
                        <div>
                          <div className="font-medium text-white">{step.name}</div>
                          <div className="text-sm text-gray-400">{step.status}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditStep(index)}
                          className="text-blue-400 hover:text-blue-300 p-1 rounded transition-colors"
                        >
                          <Icon icon="mdi:pencil" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStep(index)}
                          className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
                        >
                          <Icon icon="mdi:delete" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-[#2e3650]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-300 bg-[#1a2236] hover:bg-[#2e3650] rounded-lg transition-colors border border-[#2e3650]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Flow'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Step Modal */}
      {isStepModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-[#232b42] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#2e3650]">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">
                  {editingStepIndex !== null ? 'Edit Step' : 'Add New Step'}
                </h3>
                <button
                  onClick={() => setIsStepModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Icon icon="mdi:close" className="text-xl" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status *
                  </label>
                  <select
                    value={currentStep.status}
                    onChange={(e) => setCurrentStep({ ...currentStep, status: e.target.value })}
                    className="w-full px-3 py-2 border border-[#2e3650] bg-[#1a2236] text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    required
                  >
                    <option value="">Select Status</option>
                    {commonStatuses.map((status) => (
                      <option key={status} value={status} className="bg-[#1a2236] text-white">
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Step Name *
                  </label>
                  <input
                    type="text"
                    value={currentStep.name}
                    onChange={(e) => setCurrentStep({ ...currentStep, name: e.target.value })}
                    className="w-full px-3 py-2 border border-[#2e3650] bg-[#1a2236] text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={currentStep.description || ''}
                    onChange={(e) => setCurrentStep({ ...currentStep, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-[#2e3650] bg-[#1a2236] text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Authorized Roles
                  </label>
                  <div className="space-y-2">
                    {availableRoles.map((role) => (
                      <label key={role} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={currentStep.authorizedRoles.includes(role)}
                          onChange={(e) => {
                            const newRoles = e.target.checked
                              ? [...currentStep.authorizedRoles, role]
                              : currentStep.authorizedRoles.filter((r) => r !== role);
                            setCurrentStep({ ...currentStep, authorizedRoles: newRoles });
                          }}
                          className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-[#2e3650] rounded bg-[#1a2236]"
                        />
                        <span className="ml-2 text-sm text-gray-300">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Next Possible Statuses
                  </label>
                  <div className="space-y-2">
                    {commonStatuses.map((status) => (
                      <label key={status} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={currentStep.nextStatuses.includes(status)}
                          onChange={(e) => {
                            const newStatuses = e.target.checked
                              ? [...currentStep.nextStatuses, status]
                              : currentStep.nextStatuses.filter((s) => s !== status);
                            setCurrentStep({ ...currentStep, nextStatuses: newStatuses });
                          }}
                          className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-[#2e3650] rounded bg-[#1a2236]"
                        />
                        <span className="ml-2 text-sm text-gray-300">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Active
                  </label>
                  <input
                    type="checkbox"
                    checked={currentStep.isActive}
                    onChange={(e) => setCurrentStep({ ...currentStep, isActive: e.target.checked })}
                    className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-[#2e3650] rounded bg-[#1a2236]"
                  />
                </div>
              </div>

              {/* Forwarding Destinations */}
              <div className="border-t border-[#2e3650] pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-medium text-white">Forwarding Destinations</h4>
                  <button
                    type="button"
                    onClick={addForwardingDestination}
                    className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                  >
                    + Add Destination
                  </button>
                </div>

                {currentStep.forwardingDestinations.map((destination, index) => (
                  <div key={index} className="border border-[#2e3650] rounded-lg p-4 mb-3 bg-[#1a2236]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Type
                        </label>
                        <select
                          key={`${index}-${destination.type}`}
                          value={destination.type}
                          onChange={(e) => handleDestinationTypeChange(index, e.target.value)}
                          className="w-full px-3 py-2 border border-[#2e3650] bg-[#1a2236] text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        >
                          {destinationTypes.map((type) => (
                            <option key={type.value} value={type.value} className="bg-[#1a2236] text-white">
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="relative suggestions-container">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Identifier
                        </label>
                        <input
                          type="text"
                          value={destination.identifier}
                          onChange={(e) => handleIdentifierChange(index, e.target.value)}
                          onFocus={() => handleIdentifierFocus(index)}
                          placeholder={
                            destination.type === 'telegram_user' 
                              ? 'Search by Telegram ID, username, or name' 
                              : destination.type === 'telegram_group'
                              ? 'Search by group ID or title'
                              : 'Telegram ID or username'
                          }
                          className="w-full px-3 py-2 border border-[#2e3650] bg-[#1a2236] text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        />
                        
                        {/* Suggestions Dropdown */}
                        {showSuggestions && currentDestinationIndex === index && (
                          <div className="suggestions-container absolute z-50 w-full mt-1 bg-[#1a2236] border border-[#2e3650] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {destination.type === 'telegram_user' && usersLoading ? (
                              <div className="px-3 py-2 text-gray-400 text-sm">Loading users...</div>
                            ) : destination.type === 'telegram_group' && groupsLoading ? (
                              <div className="px-3 py-2 text-gray-400 text-sm">Loading groups...</div>
                            ) : suggestions.length > 0 ? (
                              suggestions.map((suggestion, suggestionIndex) => (
                                <div
                                  key={suggestionIndex}
                                  className="px-3 py-2 hover:bg-[#2e3650] cursor-pointer text-sm"
                                  onClick={() => selectSuggestion(suggestion)}
                                >
                                  {destination.type === 'telegram_user' ? (
                                    <div>
                                      <div className="text-white">
                                        {suggestion.firstName} {suggestion.lastName}
                                      </div>
                                      <div className="text-gray-400 text-xs">
                                        @{suggestion.username} • {suggestion.telegramId}
                                      </div>
                                    </div>
                                  ) : destination.type === 'telegram_group' ? (
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
                              <div className="px-3 py-2 text-gray-400 text-sm">
                                {destination.type === 'telegram_user' 
                                  ? 'No users found' 
                                  : destination.type === 'telegram_group'
                                  ? 'No groups found'
                                  : 'No suggestions available'
                                }
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Name (optional)
                        </label>
                        <input
                          type="text"
                          value={destination.name || ''}
                          onChange={(e) => updateForwardingDestination(index, 'name', e.target.value)}
                          placeholder="Human-readable name"
                          className="w-full px-3 py-2 border border-[#2e3650] bg-[#1a2236] text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={destination.isActive}
                          onChange={(e) => updateForwardingDestination(index, 'isActive', e.target.checked)}
                          className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-[#2e3650] rounded bg-[#1a2236]"
                        />
                        <label className="ml-2 block text-sm text-gray-300">Active</label>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeForwardingDestination(index)}
                      className="mt-3 text-red-400 hover:text-red-300 text-sm font-medium"
                    >
                      Remove Destination
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-[#2e3650]">
                <button
                  type="button"
                  onClick={() => setIsStepModalOpen(false)}
                  className="px-4 py-2 text-gray-300 bg-[#1a2236] hover:bg-[#2e3650] rounded-lg transition-colors border border-[#2e3650]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveStep}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
                >
                  Save Step
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderFlowFormModal; 