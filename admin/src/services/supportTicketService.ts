import axios from 'axios';
import { SupportTicket } from '@yaqiin/shared/types/supportTicket';

export const getSupportTickets = async (page = 1, limit = 10, search = '') => {
  const { data } = await axios.get(`/api/support-tickets`, { params: { page, limit, search } });
  return data;
};

export const createSupportTicket = async (input: Partial<SupportTicket>) => {
  const { data } = await axios.post(`/api/support-tickets`, input);
  return data;
};

export const updateSupportTicket = async (input: Partial<SupportTicket> & { _id: string }) => {
  const { _id, ...rest } = input;
  const { data } = await axios.put(`/api/support-tickets/${_id}`, rest);
  return data;
};

export const deleteSupportTicket = async (_id: string) => {
  const { data } = await axios.delete(`/api/support-tickets/${_id}`);
  return data;
}; 