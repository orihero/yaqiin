import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CourierFormModal from './components/CourierFormModal';
import { Courier } from '@yaqiin/shared/types/courier';
import { getCouriers, createCourier, updateCourier, deleteCourier as deleteCourierApi } from '../../services/courierService';
import ConfirmDialog from '../../components/ConfirmDialog';
import { toast } from 'react-toastify';

export default function CouriersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editCourier, setEditCourier] = useState<Courier | null>(null);
  const [deleteCourier, setDeleteCourier] = useState<Courier | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['couriers', page, limit, search],
    queryFn: () => getCouriers(page, limit, search),
  });

  const createCourierMutation = useMutation({
    mutationFn: async (input: Partial<Courier>) => createCourier(input),
    onSuccess: () => {
      setShowModal(false);
      queryClient.invalidateQueries({ queryKey: ['couriers'] });
      toast.success('Courier created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create courier');
    },
  });

  const updateCourierMutation = useMutation({
    mutationFn: async (input: Partial<Courier> & { _id: string }) => updateCourier(input),
    onSuccess: () => {
      setShowModal(false);
      setEditCourier(null);
      queryClient.invalidateQueries({ queryKey: ['couriers'] });
      toast.success('Courier updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update courier');
    },
  });

  const deleteCourierMutation = useMutation({
    mutationFn: async (courier: Courier) => {
      if (!courier || !courier._id) throw new Error('Invalid courier');
      return deleteCourierApi(courier._id);
    },
    onSuccess: () => {
      setDeleteCourier(null);
      queryClient.invalidateQueries({ queryKey: ['couriers'] });
      toast.success('Courier deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete courier');
    },
  });

  return (
    <div className="p-8 min-h-screen bg-[#1a2236] text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Couriers</h1>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold"
          onClick={() => { setEditCourier(null); setShowModal(true); }}
        >
          Add Courier
        </button>
      </div>
      <div className="mb-4 flex items-center">
        <input
          className="bg-[#232b42] text-white px-4 py-2 rounded-lg w-80 focus:outline-none focus:ring"
          placeholder="Search Courier"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="bg-[#232b42] rounded-xl overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-[#2e3650]">
              <th className="py-3 px-4">#</th>
              <th className="py-3 px-4">Vehicle</th>
              <th className="py-3 px-4">License</th>
              <th className="py-3 px-4">Availability</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Created</th>
              <th className="py-3 px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-8">Loading...</td></tr>
            ) : error ? (
              <tr><td colSpan={7} className="text-center py-8 text-red-400">{String(error.message)}</td></tr>
            ) : !data?.data?.length ? (
              <tr><td colSpan={7} className="text-center py-8">No couriers found.</td></tr>
            ) : (
              data.data.map((courier: Courier, idx: number) => (
                <tr key={courier._id} className="border-b border-[#2e3650] hover:bg-[#202840] transition">
                  <td className="py-3 px-4">{(page - 1) * limit + idx + 1}</td>
                  <td className="py-3 px-4">{courier.vehicleType}</td>
                  <td className="py-3 px-4">{courier.licenseNumber}</td>
                  <td className="py-3 px-4 capitalize">{courier.availability}</td>
                  <td className="py-3 px-4">{courier.isActive ? 'Active' : 'Inactive'}</td>
                  <td className="py-3 px-4">{new Date(courier.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 flex gap-3">
                    <button onClick={() => { setEditCourier(courier); setShowModal(true); }} className="hover:text-blue-400" title="Edit">Edit</button>
                    <button onClick={() => setDeleteCourier(courier)} className="hover:text-red-400" title="Delete">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <span>Items per page:</span>
          <select
            className="bg-[#232b42] text-white px-2 py-1 rounded"
            value={limit}
            onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
          >
            {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <button
            className="px-2 py-1 mx-1 rounded disabled:opacity-50"
            onClick={() => setPage(1)}
            disabled={page === 1}
          >{'<<'}</button>
          <button
            className="px-2 py-1 mx-1 rounded disabled:opacity-50"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >{'<'}</button>
          <span className="mx-2">{page} / {data?.meta?.totalPages ?? 1}</span>
          <button
            className="px-2 py-1 mx-1 rounded disabled:opacity-50"
            onClick={() => setPage(p => Math.min((data?.meta?.totalPages ?? 1), p + 1))}
            disabled={page === (data?.meta?.totalPages ?? 1)}
          >{'>'}</button>
          <button
            className="px-2 py-1 mx-1 rounded disabled:opacity-50"
            onClick={() => setPage(data?.meta?.totalPages ?? 1)}
            disabled={page === (data?.meta?.totalPages ?? 1)}
          >{'>>'}</button>
        </div>
      </div>
      {/* Courier Modal (Add/Edit) */}
      <CourierFormModal
        open={showModal}
        mode={editCourier ? 'edit' : 'add'}
        initialValues={editCourier || undefined}
        loading={createCourierMutation.status === 'pending' || updateCourierMutation.status === 'pending'}
        error={createCourierMutation.isError ? (createCourierMutation.error as any)?.message : updateCourierMutation.isError ? (updateCourierMutation.error as any)?.message : null}
        details={createCourierMutation.isError ? (createCourierMutation.error as any)?.details : updateCourierMutation.isError ? (updateCourierMutation.error as any)?.details : null}
        onClose={() => { setShowModal(false); setEditCourier(null); }}
        onSubmit={(values: Partial<Courier>) => {
          if (editCourier) {
            updateCourierMutation.mutate({ ...values, _id: editCourier._id });
          } else {
            createCourierMutation.mutate(values);
          }
        }}
      />
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteCourier}
        title="Delete Courier"
        description={`Are you sure you want to delete this courier? This action cannot be undone.`}
        loading={deleteCourierMutation.status === 'pending'}
        onCancel={() => setDeleteCourier(null)}
        onConfirm={() => deleteCourier && deleteCourierMutation.mutate(deleteCourier)}
      />
    </div>
  );
} 