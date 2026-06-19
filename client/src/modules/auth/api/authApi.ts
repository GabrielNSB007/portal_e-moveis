import { api } from "@/shared/api/httpClient";
import type { AuthPayload, AuthResponse, User } from "@/shared/types/domain";

export type UpdateProfilePayload = {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
};

export async function register(payload: AuthPayload) {
  const { data } = await api.post<AuthResponse>("/auth/register", payload);
  return data;
}

export async function login(payload: Pick<AuthPayload, "email" | "password">) {
  const { data } = await api.post<AuthResponse>("/auth/login", payload);
  return data;
}

export async function getProfile() {
  const { data } = await api.get<User | { user: User }>("/auth/profile");
  return "user" in data ? data.user : data;
}

export async function updateProfile(payload: UpdateProfilePayload) {
  const { data } = await api.put<User | { user: User }>("/auth/profile", payload);
  return "user" in data ? data.user : data;
}

export async function deleteProfile() {
  const { data } = await api.delete("/auth/profile");
  return data;
}

export function extractAuthToken(response: AuthResponse) {
  return response.accessToken ?? response.token ?? response.data?.accessToken ?? response.data?.token ?? null;
}

export function extractAuthUser(response: AuthResponse) {
  return response.user ?? response.data?.user ?? null;
}
