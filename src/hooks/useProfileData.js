// src/hooks/useProfileData.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

/**
 * Fetch user's own posts
 */
export function useUserPosts(userId = null) {
    return useQuery({
        queryKey: ['userPosts', userId],
        queryFn: async () => {
            const endpoint = userId
                ? `/api/get/single/user/post?id=${userId}`
                : '/api/get/user/post';

            const { data } = await api.get(endpoint);
            return data.posts || [];
        },
        enabled: true,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

/**
 * Fetch user's saved feeds
 */
export function useSavedFeeds() {
    return useQuery({
        queryKey: ['savedFeeds'],
        queryFn: async () => {
            const { data } = await api.get('/api/user/get/saved/feeds');
            return data.savedFeeds || [];
        },
        staleTime: 2 * 60 * 1000,
    });
}

/**
 * Fetch user's liked feeds
 */
export function useLikedFeeds(token) {
    return useQuery({
        queryKey: ['likedFeeds', token],
        queryFn: async () => {
            const { data } = await api.get('/api/user/liked/feeds', {
                headers: { Authorization: `Bearer ${token}` },
            });
            return data.likedFeeds || [];
        },
        enabled: !!token,
        staleTime: 2 * 60 * 1000,
    });
}

/**
 * Fetch user's followers
 */
export function useFollowers(userId = null) {
    return useQuery({
        queryKey: ['followers', userId],
        queryFn: async () => {
            const endpoint = userId
                ? `/api/single/user/followers?id=${userId}`
                : '/api/user/followers';

            const { data } = await api.get(endpoint);
            return data.followers || [];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Fetch user's following
 */
export function useFollowing(userId = null) {
    return useQuery({
        queryKey: ['following', userId],
        queryFn: async () => {
            const endpoint = userId
                ? `/api/single/user/following?id=${userId}`
                : '/api/user/following';

            const { data } = await api.get(endpoint);
            return data.following || [];
        },
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Fetch user activity
 */
export function useUserActivity() {
    return useQuery({
        queryKey: ['userActivity'],
        queryFn: async () => {
            const { data } = await api.get('/api/get/user/activity');
            return data.activities || [];
        },
        staleTime: 2 * 60 * 1000,
    });
}

/**
 * Fetch profile completion status
 */
export function useProfileCompletion() {
    return useQuery({
        queryKey: ['profileCompletion'],
        queryFn: async () => {
            const { data } = await api.get('/api/user/profile/completion');
            return data;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}

/**
 * Fetch profile overview
 */
export function useProfileOverview() {
    return useQuery({
        queryKey: ['profileOverview'],
        queryFn: async () => {
            const { data } = await api.get('/api/get/profile/overview');
            return data;
        },
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Fetch single user profile overview
 */
export function useSingleUserProfile(userId) {
    return useQuery({
        queryKey: ['singleUserProfile', userId],
        queryFn: async () => {
            const { data } = await api.post('/api/single/get/profile/overview', {
                id: userId,
            });
            return data;
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Fetch public resume
 */
export function usePublicResume(username) {
    return useQuery({
        queryKey: ['publicResume', username],
        queryFn: async () => {
            const { data } = await api.get(`/api/public/resume/${username}`);
            return data;
        },
        enabled: !!username,
        staleTime: 10 * 60 * 1000,
    });
}

/**
 * Fetch user portfolio
 */
export function useUserPortfolio(username) {
    return useQuery({
        queryKey: ['userPortfolio', username],
        queryFn: async () => {
            const { data } = await api.get(`/api/user/portfolio/${username}`);
            return data;
        },
        enabled: !!username,
        staleTime: 10 * 60 * 1000,
    });
}

/**
 * Fetch visibility settings
 */
export function useVisibilitySettings() {
    return useQuery({
        queryKey: ['visibilitySettings'],
        queryFn: async () => {
            const { data } = await api.get('/api/user/get/visibility/settings');
            return data;
        },
        staleTime: 10 * 60 * 1000,
    });
}

/**
 * Update visibility settings mutation
 */
export function useUpdateVisibilitySettings() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (settings) => {
            return await api.post('/api/user/update/visibility/settings', settings);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['visibilitySettings'] });
            toast.success('Settings updated successfully');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to update settings');
        },
    });
}

/**
 * Fetch hidden posts
 */
export function useHiddenPosts(token) {
    return useQuery({
        queryKey: ['hiddenPosts', token],
        queryFn: async () => {
            const { data } = await api.get('/user/hidden-posts', {
                headers: { Authorization: `Bearer ${token}` },
            });
            return data.posts || [];
        },
        enabled: !!token,
        staleTime: 2 * 60 * 1000,
    });
}

/**
 * Fetch not interested posts
 */
export function useNotInterestedPosts(token) {
    return useQuery({
        queryKey: ['notInterestedPosts', token],
        queryFn: async () => {
            const { data } = await api.get('/user/not-interested-posts', {
                headers: { Authorization: `Bearer ${token}` },
            });
            return data.posts || [];
        },
        enabled: !!token,
        staleTime: 2 * 60 * 1000,
    });
}
