import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: 'Dataset' | 'Processing' | 'Prediction' | 'Model' | 'Report' | 'System';
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

interface NotificationStore {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  addNotification: (n: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => void;
  setNotifications: (n: AppNotification[]) => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,

      markAsRead: (id) =>
        set((s) => {
          const notifications = s.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          );
          return { notifications, unreadCount: notifications.filter((n) => !n.isRead).length };
        }),

      markAllRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        })),

      markAllAsRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        })),

      removeNotification: (id) =>
        set((s) => {
          const notifications = s.notifications.filter((n) => n.id !== id);
          return { notifications, unreadCount: notifications.filter((n) => !n.isRead).length };
        }),

      deleteNotification: (id) =>
        set((s) => {
          const notifications = s.notifications.filter((n) => n.id !== id);
          return { notifications, unreadCount: notifications.filter((n) => !n.isRead).length };
        }),

      clearAll: () => set({ notifications: [], unreadCount: 0 }),

      addNotification: (n) =>
        set((s) => {
          const newN: AppNotification = {
            ...n,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            isRead: false,
          };
          return {
            notifications: [newN, ...s.notifications],
            unreadCount: s.unreadCount + 1,
          };
        }),

      setNotifications: (notifications) =>
        set({ notifications, unreadCount: notifications.filter((n) => !n.isRead).length }),
    }),
    { name: 'ais-notifications' }
  )
);
