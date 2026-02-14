import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import api from '../api/axios';

/**
 * Custom hook for fetching notifications using Infinite Query
 * Supports lazy loading for scale
 */
export function useNotifications(token) {
    return useInfiniteQuery({
        queryKey: ['notifications', token],
        queryFn: async ({ pageParam = 1 }) => {
            const { data } = await api.get(`/api/notifications/all?page=${pageParam}&limit=10`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return data;
        },
        getNextPageParam: (lastPage) => {
            const { page, pages } = lastPage.pagination || {};
            return page < pages ? page + 1 : undefined;
        },
        enabled: !!token,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

/**
 * Get unread notification count
 */
export function useUnreadNotificationCount(token) {
    const { data } = useNotifications(token);
    // Flatten the pages and count unread
    const notifications = data?.pages?.flatMap(page => page.notifications) || [];
    return notifications.filter((n) => !n.isRead).length;
}

/**
 * Mark notification as read mutation
 */
export function useMarkNotificationRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (notificationId) => {
            return await api.put('/api/notifications/read', { notificationId });
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
        mutationFn: async () => {
            return await api.put('/api/notifications/mark-all-read');
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
            return await api.delete('/api/notifications/delete', { data: { notificationId } });
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
