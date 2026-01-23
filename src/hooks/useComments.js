// src/hooks/useComments.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

/**
 * Fetch comments for a specific feed
 */
export function useComments(feedId, enabled = true) {
    return useQuery({
        queryKey: ['comments', feedId],
        queryFn: async () => {
            const res = await api.post('/api/get/comments/for/feed', { feedId });
            return res.data.comments?.slice(0, 10) || [];
        },
        enabled: enabled && !!feedId,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

/**
 * Add comment mutation
 */
export function useAddComment(feedId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ commentText, userId }) => {
            return await api.post('/api/user/feed/comment', {
                feedId,
                commentText,
                userId,
            });
        },
        onSuccess: () => {
            // Invalidate comments to refetch
            queryClient.invalidateQueries({ queryKey: ['comments', feedId] });
            queryClient.invalidateQueries({ queryKey: ['feeds'] }); // Update comment count
            toast.success('Comment added!');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to add comment');
        },
    });
}

/**
 * Like comment mutation
 */
export function useLikeComment(feedId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (commentId) => {
            return await api.post('/api/user/comment/like', { commentId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', feedId] });
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to like comment');
        },
    });
}

/**
 * Reply to comment mutation
 */
export function useReplyToComment(feedId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ commentId, replyText, userId }) => {
            return await api.post('/api/user/feed/reply/comment', {
                commentId,
                replyText,
                userId,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', feedId] });
            toast.success('Reply added!');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to add reply');
        },
    });
}

/**
 * Fetch replies for a comment
 */
export function useCommentReplies(commentId, enabled = false) {
    return useQuery({
        queryKey: ['replies', commentId],
        queryFn: async () => {
            const res = await api.post('/api/get/replies/for/comment', { commentId });
            return res.data.replies || [];
        },
        enabled: enabled && !!commentId,
        staleTime: 2 * 60 * 1000,
    });
}

/**
 * Like reply mutation
 */
export function useLikeReply(feedId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (replyCommentId) => {
            return await api.post('/api/user/replycomment/like', { replyCommentId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', feedId] });
            queryClient.invalidateQueries({ queryKey: ['replies'] });
        },
    });
}

/**
 * Delete comment mutation
 */
export function useDeleteComment(feedId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (commentId) => {
            return await api.delete(`/api/user/comment/delete/${commentId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', feedId] });
            queryClient.invalidateQueries({ queryKey: ['feeds'] });
            toast.success('Comment deleted');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to delete comment');
        },
    });
}
