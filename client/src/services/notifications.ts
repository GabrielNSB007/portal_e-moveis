import api from "./api";
import type { BackendOffer } from "@/lib/offer-mappers";

export type NotificationResponse = {
  id: string;
  userId: string;
  offerId?: string | null;
  offer?: BackendOffer | null;
  type: string;
  title: string;
  description: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
};

export const listNotifications = async () => api.get<NotificationResponse[]>("/notifications");
export const markNotificationRead = async (id: string) => api.patch<NotificationResponse>(`/notifications/${id}/read`);
export const markAllNotificationsRead = async () => api.patch("/notifications/read-all");
