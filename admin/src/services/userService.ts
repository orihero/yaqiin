import api from './api';

export const getAvailableOwners = async () => {
  const res = await api.get('/users/available-owners');
  return res.data.data;
};

export const getUsers = async (page: number, limit: number, search: string) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.append('search', search);
  const res = await api.get(`/users?${params.toString()}`);
  return res.data;
};

export const createUser = async (input: any) => {
  const res = await api.post('/users', input);
  if (!res.data.success) throw new Error(res.data?.error?.message || 'Failed to create user');
  return res.data.data;
};

export const updateUser = async (input: any) => {
  const { _id, ...rest } = input;
  const res = await api.put(`/users/${_id}`, rest);
  if (!res.data.success) throw new Error(res.data?.error?.message || 'Failed to update user');
  return res.data.data;
};

export const deleteUser = async (_id: string) => {
  const res = await api.delete(`/users/${_id}`);
  if (!res.data.success) throw new Error(res.data?.error?.message || 'Failed to delete user');
  return res.data.data;
};

export const getProfile = async () => {
  const res = await api.get('/users/me');
  return res.data.data;
};

export const getUserById = async (id: string) => {
  const res = await api.get(`/users/${id}`);
  return res.data.data;
};

export const getAllUsers = async () => {
  const res = await api.get('/users');
  return res.data.data;
};

export const getAvailableCouriers = async () => {
  const res = await api.get('/users/available-couriers');
  return res.data.data;
};

export const getUsersBySearch = async (search: string) => {
  const res = await getUsers(1, 20, search);
  return res.data;
}; 