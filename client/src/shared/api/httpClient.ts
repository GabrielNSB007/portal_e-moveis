import axios from "axios";
import { getAuthToken } from "./tokenStorage";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string; message?: string } | undefined;
    return data?.error ?? data?.message ?? "Não foi possível completar a solicitação.";
  }

  if (error instanceof Error) return error.message;

  return "Erro inesperado.";
}
