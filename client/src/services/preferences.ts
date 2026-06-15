import type {
  CreatePreferenceFormData,
  UpdatePreferenceFormData,
  ReadDeletePreference,
} from "@/types/preferences.js";
import api from "./api";

export const createPreference = async (preferencesData: CreatePreferenceFormData) => {
  const response = await api.post<ReadDeletePreference>(
    "/preferences",
    preferencesData,
  );
  return response.data;
};

export const updatePreference = async (
  id: string,
  preferencesData: UpdatePreferenceFormData,
) => {
  const response = await api.patch<ReadDeletePreference>(
    `/preferences/${id}`,
    preferencesData,
  );
  return response.data;
};

export const updatePreferenceActive = async (
  id: string,
  preferencesData: Pick<UpdatePreferenceFormData, "isActive">,
) => {
  const response = await api.patch<ReadDeletePreference>(
    `/preferences/activate/${id}`,
    preferencesData,
  );
  return response.data;
};

export const findPreferenceById = async (id: string) => {
  const response = await api.get<ReadDeletePreference>(`/preferences/${id}`);
  return response.data;
};

export const findManyPreferences = async () => {
  const response = await api.get<ReadDeletePreference[]>("/preferences");
  return response.data;
};

export const deletePreference = async (id: string) => {
  await api.delete(`/preferences/${id}`);
};
