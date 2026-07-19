import client from './client';

export const fetchOwnerDashboard = (params) => client.get('/owner/dashboard', { params });
