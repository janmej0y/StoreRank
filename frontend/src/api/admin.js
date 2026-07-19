import client from './client';

export const fetchAdminDashboard = () => client.get('/admin/dashboard');

export const fetchAdminUsers = (params) => client.get('/admin/users', { params });
export const fetchAdminUserById = (id) => client.get(`/admin/users/${id}`);
export const createAdminUser = (payload) => client.post('/admin/users', payload);
export const updateUserStatus = (id, isActive) =>
  client.patch(`/admin/users/${id}/status`, { isActive });

export const fetchAdminStores = (params) => client.get('/admin/stores', { params });
export const createAdminStore = (payload) => client.post('/admin/stores', payload);
export const updateStoreStatus = (id, isActive) =>
  client.patch(`/admin/stores/${id}/status`, { isActive });
