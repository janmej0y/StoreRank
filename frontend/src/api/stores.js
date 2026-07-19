import client from './client';

export const fetchStores = (params) => client.get('/stores', { params });
export const fetchStoreById = (id) => client.get(`/stores/${id}`);
export const rateStore = (storeId, rating, comment) =>
  client.post(`/stores/${storeId}/rating`, { rating, comment });
