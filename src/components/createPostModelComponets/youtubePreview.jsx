import React from "react";
import { getYoutubeId } from "./youtube";

export default function YoutubePreview({ youtubeLink, setYoutubeLink }) {
  const ytId = getYoutubeId(youtubeLink);
  const ytThumb = ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : null;

  return (
    <>
      <input
        type="text"
        placeholder="https://www.youtube.com/watch?v=..."
        className="border-b border-gray-300 px-2 py-1 w-full text-sm bg-transparent focus:outline-none"
        value={youtubeLink}
        onChange={(e) => setYoutubeLink(e.target.value)}
      />
      {ytThumb && (
        <img src={ytThumb} alt="YouTube Preview" className="mt-2 w-full rounded max-h-32 object-cover" />
      )}
    </>
  );
}
