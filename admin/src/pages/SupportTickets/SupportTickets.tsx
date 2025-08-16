import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getSupportTickets, createSupportTicket, updateSupportTicket, deleteSupportTicket } from '../../services/supportTicketService';
import { SupportTicket } from '@yaqiin/shared/types/supportTicket';
import { Icon } from '@iconify/react';
import ConfirmDialog from '../../components/ConfirmDialog';
import SupportTicketFormModal from './components/SupportTicketFormModal';

const SupportTickets: React.FC = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTicket, setEditTicket] = useState<SupportTicket | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SupportTicket | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<any>({
    queryKey: ['support-tickets', page, limit, search],
    queryFn: () => getSupportTickets(page, limit, search),
  });

  const createMutation = useMutation({
    mutationFn: async (input: Partial<SupportTicket>) => createSupportTicket(input),
    onSuccess: () => {
      setShowModal(false);
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (input: Partial<SupportTicket> & { _id: string }) => updateSupportTicket(input),
    onSuccess: () => {
      setShowModal(false);
      setEditTicket(null);
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (ticket: SupportTicket) => deleteSupportTicket(ticket._id),
    onSuccess: () => {
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
    },
  });

  const handleAdd = () => {
    setEditTicket(null);
    setShowModal(true);
  };

  const handleEdit = (ticket: SupportTicket) => {
    setEditTicket(ticket);
    setShowModal(true);
  };

  const handleDelete = (ticket: SupportTicket) => {
    setDeleteTarget(ticket);
  };

  return (
    <div className="p-8 min-h-screen bg-[#1a2236] text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('navigation.supportTickets')}</h1>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold"
          onClick={handleAdd}
        >
          <Icon icon="mdi:plus" className="inline-block mr-2" /> {t('supportTickets.addTicket')}
        </button>
      </div>
      <div className="mb-4 flex items-center">
        <input
          className="bg-[#232b42] text-white px-4 py-2 rounded-lg w-80 focus:outline-none focus:ring"
          placeholder={t('supportTickets.searchTicket')}
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <span className="ml-4 text-gray-400">{t('navigation.dashboard')} • <span className="bg-blue-900 text-blue-300 px-2 py-1 rounded text-xs ml-2">{t('navigation.supportTickets')}</span></span>
      </div>
      <div className="bg-[#232b42] rounded-xl overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b border-[#2e3650]">
              <th className="py-3 px-4">#</th>
              <th className="py-3 px-4">{t('supportTickets.title')}</th>
              <th className="py-3 px-4">{t('supportTickets.userRole')}</th>
              <th className="py-3 px-4">{t('supportTickets.priority')}</th>
              <th className="py-3 px-4">{t('supportTickets.status')}</th>
              <th className="py-3 px-4">{t('supportTickets.createdAt')}</th>
              <th className="py-3 px-4 text-center">{t('supportTickets.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-8">{t('common.loading')}</td></tr>
            ) : isError ? (
              <tr><td colSpan={7} className="text-center py-8 text-red-400">{t('supportTickets.failedToLoad')}</td></tr>
            ) : !data?.data?.length ? (
              <tr><td colSpan={7} className="text-center py-16 text-gray-400">
                <div className="flex flex-col items-center">
                  <Icon icon="mdi:lifebuoy" className="text-5xl mb-4" />
                  <div className="text-lg font-medium">{t('supportTickets.noTicketsFound')}</div>
                  <div className="text-sm">{t('supportTickets.clickAddTicketToCreate')}</div>
                </div>
              </td></tr>
            ) : (
              data?.data?.map((ticket: SupportTicket) => (
                <tr key={ticket._id} className="border-b border-[#2e3650] hover:bg-[#202840] transition">
                  <td className="py-3 px-4">{ticket.ticketNumber}</td>
                  <td className="py-3 px-4">{ticket.title}</td>
                  <td className="py-3 px-4">{ticket.userRole}</td>
                  <td className="py-3 px-4">{ticket.priority}</td>
                  <td className="py-3 px-4">{ticket.status}</td>
                  <td className="py-3 px-4">{new Date(ticket.createdAt).toLocaleString()}</td>
                  <td className="py-3 px-4 text-center flex gap-3 justify-center">
                    <button className="hover:text-blue-400" title={t('common.edit')} onClick={() => handleEdit(ticket)}>
                      <Icon icon="mdi:pencil" width={18} height={18} />
                    </button>
                    <button className="hover:text-red-400" title={t('common.delete')} onClick={() => handleDelete(ticket)}>
                      <Icon icon="mdi:delete" width={18} height={18} />
                    </button>
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
          <span>{t('common.itemsPerPage')}:</span>
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
          >{t('common.pagination.first')}</button>
          <button
            className="px-2 py-1 mx-1 rounded disabled:opacity-50"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >{t('common.pagination.previous')}</button>
          <span className="mx-2">{page} / {data?.meta?.totalPages ?? 1}</span>
          <button
            className="px-2 py-1 mx-1 rounded disabled:opacity-50"
            onClick={() => setPage(p => Math.min((data?.meta?.totalPages ?? 1), p + 1))}
            disabled={page === (data?.meta?.totalPages ?? 1)}
          >{t('common.pagination.next')}</button>
          <button
            className="px-2 py-1 mx-1 rounded disabled:opacity-50"
            onClick={() => setPage(data?.meta?.totalPages ?? 1)}
            disabled={page === (data?.meta?.totalPages ?? 1)}
          >{t('common.pagination.last')}</button>
        </div>
      </div>
      {/* Support Ticket Modal (Add/Edit) */}
      <SupportTicketFormModal
        open={showModal}
        ticket={editTicket || undefined}
        loading={createMutation.isPending || updateMutation.isPending}
        error={createMutation.isError ? (createMutation.error as any)?.message : updateMutation.isError ? (updateMutation.error as any)?.message : null}
        onClose={() => { setShowModal(false); setEditTicket(null); }}
        onSubmit={(values) => {
          if (editTicket) {
            updateMutation.mutate({ ...editTicket, ...values } as any);
          } else {
            createMutation.mutate(values as any);
          }
        }}
      />
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={t('supportTickets.deleteTicket')}
        description={deleteTarget ? t('supportTickets.deleteTicketConfirmation', { ticketNumber: deleteTarget.ticketNumber }) : ''}
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget); }}
      />
    </div>
  );
};

export default SupportTickets; 