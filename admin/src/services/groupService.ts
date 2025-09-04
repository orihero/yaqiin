import api from './api';

export const getGroups = async () => {
  const res = await api.get('/shops/groups/unassigned');
  return res.data.data;
};

export const getAllGroups = async () => {
  const res = await api.get('/shops/groups/unassigned');
  return res.data.data;
}; 