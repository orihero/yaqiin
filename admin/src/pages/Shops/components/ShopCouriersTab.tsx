import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assignCourierToShop, getShopAvailableCouriers, getShopCouriers, unassignCourierFromShop } from '../../../services/shopService';

interface ShopCouriersTabProps {
  shopId: string;
  assignedCouriersData: any;
  assignedCouriersLoading: boolean;
  assignedCouriersError: Error | null;
  availableCouriersData: any;
  availableCouriersLoading: boolean;
  availableCouriersError: Error | null;
  courierSearch: string;
  setCourierSearch: (search: string) => void;
}

export default function ShopCouriersTab({
  shopId,
  assignedCouriersData,
  assignedCouriersLoading,
  assignedCouriersError,
  availableCouriersData,
  availableCouriersLoading,
  availableCouriersError,
  courierSearch,
  setCourierSearch
}: ShopCouriersTabProps) {
  const [addCourierModalOpen, setAddCourierModalOpen] = useState(false);
  const [modalCourierSearch, setModalCourierSearch] = useState('');
  const [assigningCourierId, setAssigningCourierId] = useState<string | null>(null);
  const [unassigningCourierId, setUnassigningCourierId] = useState<string | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [unassignError, setUnassignError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Assign courier mutation
  const assignCourierMutation = useMutation({
    mutationFn: async (courierId: string) => {
      setAssigningCourierId(courierId);
      setAssignError(null);
      try {
        await assignCourierToShop(shopId, courierId);
        queryClient.invalidateQueries({ queryKey: ['shop-assigned-couriers', shopId] });
        queryClient.invalidateQueries({ queryKey: ['shop-available-couriers', shopId] });
      } catch (err: any) {
        setAssignError(err?.message || 'Failed to assign courier');
        throw err;
      } finally {
        setAssigningCourierId(null);
      }
    },
  });

  // Unassign courier mutation
  const unassignCourierMutation = useMutation({
    mutationFn: async (courierId: string) => {
      setUnassigningCourierId(courierId);
      setUnassignError(null);
      try {
        await unassignCourierFromShop(shopId, courierId);
        queryClient.invalidateQueries({ queryKey: ['shop-assigned-couriers', shopId] });
        queryClient.invalidateQueries({ queryKey: ['shop-available-couriers', shopId] });
      } catch (err: any) {
        setUnassignError(err?.message || 'Failed to unassign courier');
        throw err;
      } finally {
        setUnassigningCourierId(null);
      }
    },
  });

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Assigned Couriers 🚚</h2>
      <button
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold mb-4"
        onClick={() => setAddCourierModalOpen(true)}
      >
        Add Courier ➕
      </button>
      
      {assignedCouriersLoading ? (
        <div>Loading assigned couriers...</div>
      ) : assignedCouriersError ? (
        <div className="text-red-400">{String(assignedCouriersError.message)}</div>
      ) : !assignedCouriersData?.data?.length ? (
        <div className="text-gray-400">No couriers assigned to this shop.</div>
      ) : (
        <table className="min-w-full text-left bg-[#232b42] rounded-lg mb-6">
          <thead>
            <tr>
              <th className="py-2 px-4">#</th>
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignedCouriersData.data.map((courier: any, idx: number) => (
              <tr key={courier._id} className="border-b border-[#2e3650]">
                <td className="py-2 px-4">{idx + 1}</td>
                <td className="py-2 px-4">{courier.firstName} {courier.lastName}</td>
                <td className="py-2 px-4">
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded font-semibold"
                    disabled={unassigningCourierId === courier._id}
                    onClick={() => unassignCourierMutation.mutate(courier._id)}
                    title="Unassign Courier"
                  >
                    {unassigningCourierId === courier._id ? 'Unassigning...' : 'Unassign ❌'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      {unassignError && <div className="text-red-400 mb-2">{unassignError} ❗</div>}
      
      {/* Add Courier Modal */}
      {addCourierModalOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-all"
            style={{ backdropFilter: 'blur(8px)' }}
            onClick={() => setAddCourierModalOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-[#232b42] shadow-2xl p-8 overflow-y-auto transition-transform duration-300 transform translate-x-0">
            <h2 className="text-xl font-bold mb-4">Add Courier to Shop</h2>
            <div className="mb-4">
              <input
                className="bg-[#232b42] text-white px-4 py-2 rounded-lg w-full focus:outline-none focus:ring mb-2"
                placeholder="Search available couriers..."
                value={modalCourierSearch}
                onChange={e => setModalCourierSearch(e.target.value)}
              />
            </div>
            
            {availableCouriersLoading ? (
              <div>Loading available couriers...</div>
            ) : availableCouriersError ? (
              <div className="text-red-400">{String(availableCouriersError.message)}</div>
            ) : !availableCouriersData?.data?.length ? (
              <div className="text-gray-400">No available couriers found.</div>
            ) : (
              <table className="min-w-full text-left bg-[#232b42] rounded-lg mb-2">
                <thead>
                  <tr>
                    <th className="py-2 px-4">#</th>
                    <th className="py-2 px-4">Name</th>
                    <th className="py-2 px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {availableCouriersData.data?.filter((courier: any) => {
                    const search = modalCourierSearch.trim().toLowerCase();
                    if (!search) return true;
                    return (
                      (courier.firstName && courier.firstName.toLowerCase().includes(search)) ||
                      (courier.lastName && courier.lastName.toLowerCase().includes(search))
                    );
                  }).map((courier: any, idx: number) => (
                    <tr key={courier._id} className="border-b border-[#2e3650]">
                      <td className="py-2 px-4">{idx + 1}</td>
                      <td className="py-2 px-4">{courier.firstName} {courier.lastName}</td>
                      <td className="py-2 px-4">
                        <button
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded font-semibold"
                          disabled={assigningCourierId === courier._id}
                          onClick={() => assignCourierMutation.mutate(courier._id)}
                          title="Assign Courier"
                        >
                          {assigningCourierId === courier._id ? 'Assigning...' : 'Assign ➕'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            
            {assignError && <div className="text-red-400 mb-2">{assignError} ❗</div>}
            
            <div className="flex justify-end gap-2 mt-6">
              <button className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700" onClick={() => setAddCourierModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
