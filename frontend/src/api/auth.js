import client from './client';

export const registerUser = (payload) => client.post('/auth/register', payload);
export const loginUser = (payload) => client.post('/auth/login', payload);
export const fetchMe = () => client.get('/auth/me');
export const changePassword = (payload) => client.patch('/auth/password', payload);
