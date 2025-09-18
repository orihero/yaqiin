import React, { useState, useEffect } from 'react';
import { SupportTicket } from '@yaqiin/shared/types/supportTicket';

interface SupportTicketFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Partial<SupportTicket>) => void;
  loading?: boolean;
  error?: string | null;
  ticket?: SupportTicket;
}

const userRoles = [
  { value: 'client', label: 'Client' },
  { value: 'courier', label: 'Courier' },
  { value: 'shop_owner', label: 'Shop Owner' },
  { value: 'operator', label: 'Operator' },
];
const priorities = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];
const statuses = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'waiting_for_response', label: 'Waiting for Response' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const SupportTicketFormModal: React.FC<SupportTicketFormModalProps> = ({ open, onClose, onSubmit, loading, error, ticket }) => {
  const [form, setForm] = useState<Partial<SupportTicket>>({
    title: '',
    userRole: 'client',
    priority: 'low',
    status: 'open',
    description: '',
  });

  useEffect(() => {
    if (ticket) {
      setForm({
        title: ticket.title,
        userRole: ticket.userRole,
        priority: ticket.priority,
        status: ticket.status,
        description: ticket.description,
      });
    } else {
      setForm({
        title: '',
        userRole: 'client',
        priority: 'low',
        status: 'open',
        description: '',
      });
    }
  }, [ticket, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 backdrop-blur-sm bg-black/30" onClick={onClose} />
      <div className="w-1/2 bg-[#232b42] p-8 h-full shadow-xl overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{ticket ? 'Edit Ticket' : 'Add Ticket'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-[#1a2236] text-white focus:outline-none"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">User Role</label>
            <select
              name="userRole"
              value={form.userRole}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-[#1a2236] text-white focus:outline-none"
              required
              disabled={loading}
            >
              {userRoles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Priority</label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-[#1a2236] text-white focus:outline-none"
              required
              disabled={loading}
            >
              {priorities.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-[#1a2236] text-white focus:outline-none"
              required
              disabled={loading}
            >
              {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-[#1a2236] text-white focus:outline-none"
              rows={4}
              required
              disabled={loading}
            />
          </div>
          <div className="flex justify-end gap-2 mt-8">
            <button type="button" className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
          </div>
          {error && <div className="text-red-400 mt-4">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default SupportTicketFormModal; 