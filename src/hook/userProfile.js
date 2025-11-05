// src/hooks/useUserProfile.js
import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "../Service/userService";


export const useUserProfile = () => {
  return useQuery({
    queryKey: ["userProfile"], // Cache key — unique per user/token
    queryFn: () => getUserProfile(),
    staleTime: 5 * 60 * 1000, // 5 min cache
    cacheTime: 30 * 60 * 1000, // 30 min in background
    retry: 1, // retry once if failed
    refetchOnWindowFocus: true,
  });
};

