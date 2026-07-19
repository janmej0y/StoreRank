import client from './client';

export const fetchOwnerDashboard = (params) => client.get('/owner/dashboard', { params });

export const respondToRating = (ratingId, response) =>
  client.patch(`/owner/ratings/${ratingId}/response`, { response });

export const updateOwnerStore = (payload) => client.patch('/owner/store', payload);
