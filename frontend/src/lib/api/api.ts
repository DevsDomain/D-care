// src/lib/api/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  timeout: 10000,
});

// Desembrulha data (api.post(...)-> retorna data direto)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err?.response?.data?.message ??
      err?.message ??
      'Erro de rede';
    return Promise.reject(new Error(Array.isArray(msg) ? msg.join(', ') : msg));
  }
);
