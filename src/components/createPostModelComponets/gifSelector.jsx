import React, { useEffect, useRef, useState } from "react";
import { fetchGifs } from "./giphy";

export default function GifSelector({ selectedGif, setSelectedGif }) {
  const [gifSearch, setGifSearch] = useState("");
  const [gifResults, setGifResults] = useState([]);
  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const gifs = await fetchGifs(gifSearch);
      setGifResults(gifs);
    }, 400);
  }, [gifSearch]);

  return (
    <div className="mt-4 p-3 border rounded bg-[#F9FAFB]">
      <input
        type="text"
        placeholder="Search GIFs..."
        className="w-full border-b border-gray-300 px-2 py-1 focus:outline-none"
        value={gifSearch}
        onChange={(e) => setGifSearch(e.target.value)}
      />
      <div className="grid grid-cols-3 gap-2 mt-3 max-h-48 overflow-y-auto">
        {gifResults.map((gif) => (
          <img
            key={gif.id}
            src={gif.images.fixed_height_small.url}
            alt={gif.title}
            className={`cursor-pointer rounded hover:ring-2 ring-blue-400 transition-all ${
              selectedGif === gif.images.fixed_height_small.url ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={() => setSelectedGif(gif.images.fixed_height_small.url)}
          />
        ))}
      </div>

      {selectedGif && (
        <div className="mt-3 flex justify-center">
          <img src={selectedGif} alt="Selected GIF" className="max-h-32 rounded" />
        </div>
      )}
    </div>
  );
}
