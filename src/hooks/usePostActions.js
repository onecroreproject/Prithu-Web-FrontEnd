// src/hooks/usePostActions.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ feedId, userId, action }) => {
      return api.post('/api/user/feed/like', { feedId, userId, action });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeds'] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to update like');
    }
  });
}


export function useSavePost(feedId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => api.post('/api/user/feed/save', { feedId }),
    onSuccess: (response) => {
      const saved = response.data.savedFeeds?.some((f) => f.feedId === feedId);
      queryClient.invalidateQueries({ queryKey: ['feeds'] });
      queryClient.invalidateQueries({ queryKey: ['savedFeeds'] });
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Save failed'),
  });
}

export function useSharePost(feedId, userId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ shareChannel, shareTarget }) =>
      api.post("/api/user/feed/share", {
        feedId,
        userId,
        shareChannel,
        shareTarget
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feeds"] });
    }
  });
}


export function useFollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ targetUserId, currentUserId }) => {
      return api.post("/api/user/follow/creator", {
        userId: targetUserId,
        currentUserId,
      });
    },
    onSuccess: () => {
      toast.success("Following");
      queryClient.invalidateQueries({ queryKey: ["feeds"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["followers"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Follow failed");
    },
  });
}


export function useUnfollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ targetUserId, currentUserId }) => {
      return api.post("/api/user/unfollow/creator", {
        userId: targetUserId,
        currentUserId,
      });
    },
    onSuccess: () => {
      toast.success("Unfollowed");
      queryClient.invalidateQueries({ queryKey: ["feeds"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["followers"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Unfollow failed");
    },
  });
}



const downloadFeedService = async ({ feedId, designMetadata }) => {
  const response = await api.post(`/api/user/feed/download`, { feedId, designMetadata });
  return response.data; // Expecting { success: true, jobId: "..." }
};

export const getDownloadStatus = async (jobId) => {
  const response = await api.get(`/api/user/feed/download-status/${jobId}`);
  return response.data; // Expecting { status: 'completed', downloadLink: '...' }
};

// ------------------------------
// 📌 React Query Hook
// ------------------------------
export const useDownloadFeed = () => {
  return useMutation({
    mutationFn: ({ feedId, userId, designMetadata }) =>
      downloadFeedService({ feedId, userId, designMetadata }),
  });
};

export const useCheckDownloadLimit = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await api.get('/api/user/feed/check-limit');
      return response.data; // { downloadCount, limit, isLimitReached }
    }
  });
};

