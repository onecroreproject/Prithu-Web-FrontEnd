// src/hooks/useNotifications.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

/**
 * Custom hook for fetching notifications using React Query
 * Replaces polling with proper caching and WebSocket integration
 */
export function useNotifications(token) {
    return useQuery({
        queryKey: ['notifications', token],
        queryFn: async () => {
            const { data } = await api.get('/api/get/user/all/notification', {
                headers: { Authorization: `Bearer ${token}` },
            });
            return data?.notifications || [];
        },
        enabled: !!token,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false, // Rely on WebSocket for real-time updates
        refetchInterval: false, // No polling - use WebSocket instead
    });
}

/**
 * Get unread notification count
 */
export function useUnreadNotificationCount(token) {
    const { data: notifications = [] } = useNotifications(token);
    return notifications.filter((n) => !n.isRead).length;
}

/**
 * Mark notification as read mutation
 */
export function useMarkNotificationRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (notificationId) => {
            return await api.post('/api/mark/notification/read', { notificationId });
        },
        onSuccess: () => {
            // Invalidate notifications to refetch
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
}

/**
 * Mark all notifications as read mutation
 */
export function useMarkAllNotificationsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId) => {
            return await api.post('/api/mark/all/notifications/read', { userId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
}

/**
 * Delete notification mutation
 */
export function useDeleteNotification() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (notificationId) => {
            return await api.delete(`/api/delete/notification/${notificationId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
}

/**
 * Refresh notifications manually (for WebSocket integration)
 */
export function useRefreshNotifications() {
    const queryClient = useQueryClient();

    return () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };
}
