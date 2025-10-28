// src/lib/api/api.ts
import axios from 'axios';
export const API_BASE = import.meta.env.VITE_API_BASE as string;

export const api = axios.create({
  baseURL: API_BASE,
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
