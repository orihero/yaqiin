import api from './api';

export const getDashboardStats = async () => {
  const res = await api.get('/analytics/dashboard');
  return res.data;
};

export default {
  getDashboardStats,
}; 