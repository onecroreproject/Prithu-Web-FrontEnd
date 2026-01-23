// src/hooks/useMiscellaneous.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

/**
 * Fetch user birthdays
 */
export function useBirthdays() {
    return useQuery({
        queryKey: ['birthdays'],
        queryFn: async () => {
            const { data } = await api.get('/api/get/user/birthday');
            return data.birthdays || [];
        },
        staleTime: 24 * 60 * 60 * 1000, // 24 hours
    });
}


/**
 * Fetch all categories
 */
export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data } = await api.get('/api/user/get/all/category');
            return data.categories || [];
        },
        staleTime: 60 * 60 * 1000, // 1 hour
    });
}

/**
 * Fetch trending feeds
 */
export function useTrendingFeeds() {
    return useQuery({
        queryKey: ['trendingFeeds'],
        queryFn: async () => {
            const { data } = await api.get('/api/get/trending/feed');
            return data.feeds || [];
        },
        staleTime: 15 * 60 * 1000,
    });
}

/**
 * Save user location mutation
 */
export function useSaveLocation() {
    return useMutation({
        mutationFn: async (locationData) => {
            return await api.post('/api/save/user/location', locationData);
        },
        onError: (error) => {
            console.error('Failed to save location:', error);
        },
    });
}

/**
 * Report content mutation
 */
export function useReportContent() {
    return useMutation({
        mutationFn: async ({ targetId, targetType, reason }) => {
            return await api.post('/api/report/content', {
                targetId,
                targetType,
                reason,
            });
        },
        onSuccess: () => {
            toast.success('Report submitted successfully');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to submit report');
        },
    });
}

/**
 * Send admin notification mutation
 */
export function useSendAdminNotification() {
    return useMutation({
        mutationFn: async (notificationData) => {
            return await api.post('/api/admin/send/notification', notificationData);
        },
        onSuccess: () => {
            toast.success('Notification sent successfully');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to send notification');
        },
    });
}

/**
 * Fetch subscription plans
 */
export function useSubscriptionPlans() {
    return useQuery({
        queryKey: ['subscriptionPlans'],
        queryFn: async () => {
            const { data } = await api.get('/api/user/getall/subscriptions');
            return data.plans || [];
        },
        staleTime: 60 * 60 * 1000, // 1 hour
    });
}

/**
 * Subscribe to plan mutation
 */
export function useSubscribeToPlan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (planData) => {
            return await api.post('/api/user/plan/subscription', planData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            toast.success('Subscription successful!');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Subscription failed');
        },
    });
}

/**
 * Invite friends mutation
 */
export function useInviteFriends() {
    return useMutation({
        mutationFn: async (inviteData) => {
            return await api.post('/api/user/invite/friends', inviteData);
        },
        onSuccess: () => {
            toast.success('Invitations sent successfully!');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to send invitations');
        },
    });
}

/**
 * Hide post mutation
 */
export function useHidePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (feedId) => {
            return await api.post('/api/user/hide/post', { feedId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['feeds'] });
            queryClient.invalidateQueries({ queryKey: ['hiddenPosts'] });
            toast.success('Post hidden');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to hide post');
        },
    });
}

/**
 * Mark as not interested mutation
 */
export function useMarkNotInterested() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (feedId) => {
            return await api.post('/api/user/not-interested', { feedId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['feeds'] });
            queryClient.invalidateQueries({ queryKey: ['notInterestedPosts'] });
            toast.success('Marked as not interested');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to mark as not interested');
        },
    });
}

/**
 * Block user mutation
 */
export function useBlockUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId) => {
            return await api.post('/api/user/block', { userId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['feeds'] });
            queryClient.invalidateQueries({ queryKey: ['followers'] });
            queryClient.invalidateQueries({ queryKey: ['following'] });
            toast.success('User blocked');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to block user');
        },
    });
}
