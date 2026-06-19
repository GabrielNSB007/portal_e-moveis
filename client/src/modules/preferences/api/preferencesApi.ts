import { api } from "@/shared/api/httpClient";
import type { CreatePreferencePayload, PaginatedResponse, Preference } from "@/shared/types/domain";

function normalizePreferences(data: Preference[] | PaginatedResponse<Preference>) {
  return Array.isArray(data) ? data : data.items;
}

function normalizePreference(data: Preference | { preference?: Preference }) {
  return "preference" in data && data.preference ? data.preference : (data as Preference);
}

export async function createPreference(payload: CreatePreferencePayload) {
  const { data } = await api.post<Preference>('/preferences', payload);
  return data;
}

export async function getPreferences(params?: { isActive?: boolean }) {
  const { data } = await api.get<Preference[] | PaginatedResponse<Preference>>('/preferences', { params });
  return normalizePreferences(data);
}

export async function updatePreference(id: string, payload: Partial<CreatePreferencePayload>) {
  const { data } = await api.patch<Preference>(`/preferences/${id}`, payload);
  return data;
}

export async function activatePreference(id: string) {
  const { data } = await api.patch<Preference | { preference?: Preference }>(`/preferences/${id}/activate`);
  return normalizePreference(data);
}

export async function deactivatePreference(id: string) {
  const { data } = await api.delete<Preference | { preference?: Preference }>(`/preferences/${id}`);
  return normalizePreference(data);
}
