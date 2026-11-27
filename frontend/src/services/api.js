import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/billing',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lg_jwt');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const executeIdempotentCharge = async (payload, idempotencyKey) => {
  return api.post('/charge', payload, {
    headers: { 'x-idempotency-key': idempotencyKey }
  });
};

export const fetchLedger = () => api.get('/ledger');
