import type { CreatePreference, UpdatePreference, ReadDeletePreference } from "@/types/preferencesTypes";
import api from "./api"

export const createPreference = async (preferencesData: CreatePreference) => {
    return api.post('/preferences', preferencesData)
}

export const updatePreference = async (id : string, preferencesData: UpdatePreference) => {
    return api.patch(`/preferences/${id}`, preferencesData)
}

export const updatePreferenceActive = async (id : string, preferencesData: UpdatePreference) => {
    return api.patch(`/preferences/activate/${id}`, preferencesData)
}

export const findPreferenceById = async (id : string) => {
    return api.get<ReadDeletePreference>(`/preferences/${id}`)
}

export const findManyPreferences = async () => {
    return api.get<ReadDeletePreference[]>(`/preferences/`)
}


export const deleteOffer = async (id : string) => {
    return api.delete(`/preferences/${id}`)
}