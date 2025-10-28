import { GIPHY_API_KEY } from "./constants";

export async function fetchGifs(query) {
  if (!query.trim()) return [];
  const res = await fetch(
    `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=12&rating=pg`
  );
  const data = await res.json();
  return data.data || [];
}
