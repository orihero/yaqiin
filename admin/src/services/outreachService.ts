import api from './api';
import { CreateOutreachData, Outreach, OutreachStats } from '../../../shared/types';

export const createOutreach = async (data: CreateOutreachData): Promise<Outreach> => {
  const response = await api.post('/outreach', data);
  return response.data;
};

export const getOutreachHistory = async (): Promise<Outreach[]> => {
  const response = await api.get('/outreach');
  return response.data;
};

export const getOutreachById = async (id: string): Promise<Outreach> => {
  const response = await api.get(`/outreach/${id}`);
  return response.data;
};

export const updateOutreach = async (id: string, data: Partial<CreateOutreachData>): Promise<Outreach> => {
  const response = await api.put(`/outreach/${id}`, data);
  return response.data;
};

export const deleteOutreach = async (id: string): Promise<void> => {
  await api.delete(`/outreach/${id}`);
};

export const sendOutreach = async (id: string): Promise<Outreach> => {
  const response = await api.post(`/outreach/${id}/send`);
  return response.data;
};

export const getOutreachStats = async (id: string): Promise<OutreachStats> => {
  const response = await api.get(`/outreach/${id}/stats`);
  return response.data;
};
