// src/hooks/useSearch.js
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

/**
 * Global search with automatic caching and debouncing
 * Replaces manual search implementation in Header.jsx
 */
export function useGlobalSearch(searchQuery, enabled = true) {
    return useQuery({
        queryKey: ['globalSearch', searchQuery],
        queryFn: async () => {
            if (!searchQuery || searchQuery.trim().length < 1) {
                return { categories: [] };
            }

            const { data } = await api.get(
                `/api/global/search?q=${encodeURIComponent(searchQuery.trim())}`
            );

            return {
                categories: data.categories || [],
            };
        },
        enabled: enabled && !!searchQuery && searchQuery.trim().length >= 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
    });
}

/**
 * Trending hashtags with long cache duration
 */
export function useTrendingHashtags() {
    return useQuery({
        queryKey: ['trendingHashtags'],
        queryFn: async () => {
            const { data } = await api.get('/api/trending/hashtags');
            return Array.isArray(data) ? data : [];
        },
        staleTime: 60 * 60 * 1000, // 1 hour
        cacheTime: 2 * 60 * 60 * 1000, // 2 hours
        refetchOnWindowFocus: false,
    });
}

/**
 * Search history management (local storage based)
 */
export function useSearchHistory() {
    const SEARCH_HISTORY_KEY = 'prithu_search_history_v1';
    const MAX_HISTORY = 12;

    const getHistory = () => {
        try {
            const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    };

    const addToHistory = (searchTerm) => {
        if (!searchTerm || !searchTerm.trim()) return;

        const normalized = searchTerm.trim();
        const current = getHistory();
        const filtered = current.filter((s) => s !== normalized);
        filtered.unshift(normalized);
        const trimmed = filtered.slice(0, MAX_HISTORY);

        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(trimmed));
    };

    const clearHistory = () => {
        localStorage.removeItem(SEARCH_HISTORY_KEY);
    };

    return {
        history: getHistory(),
        addToHistory,
        clearHistory,
    };
}

/**
 * Check email availability (for registration)
 */
export function useCheckEmailAvailability(email, enabled = false) {
    return useQuery({
        queryKey: ['emailAvailability', email],
        queryFn: async () => {
            const { data } = await api.get('/api/check/email/availability', {
                params: { email },
            });
            return data;
        },
        enabled: enabled && !!email && email.includes('@'),
        staleTime: 30 * 1000, // 30 seconds
    });
}

/**
 * Check username availability (for registration)
 */
export function useCheckUsernameAvailability(username, enabled = false) {
    return useQuery({
        queryKey: ['usernameAvailability', username],
        queryFn: async () => {
            const { data } = await api.get('/api/check/username/availability', {
                params: { username },
            });
            return data;
        },
        enabled: enabled && !!username && username.length >= 3,
        staleTime: 30 * 1000, // 30 seconds
    });
}
