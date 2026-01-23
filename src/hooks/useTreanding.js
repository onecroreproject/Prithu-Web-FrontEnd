import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";

// Combined API + Hook
export const useTrendingHashtags = () => {
  
  // API function inside hook (no external file needed)
  const fetchTrending = async () => {
    const response = await api.get("/api/get/trending/hashtag");
    return response.data;
  };

  // React Query logic
  return useQuery({
    queryKey: ["trending-hashtags"],
    queryFn: fetchTrending,
    staleTime: 5 * 60 * 1000,     // data stays fresh for 5 minutes
    cacheTime: 10 * 60 * 1000,    // cache kept for 10 minutes
    refetchOnWindowFocus: false,
  });
};
