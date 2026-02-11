import React, { useRef, useState, useEffect } from "react";
import Postcard from "./Postcard";
import { observeElement } from "../../utils/intersectionObserver";

const PostcardWrapper = ({
  postData,
  authUser,
  token,
  onHideFromUI,
  onNotInterested,
  viewMode,
  activeVideoId,
  setActiveVideoId
}) => {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const feedId = postData._id || postData.feedId;

  useEffect(() => {
    if (!containerRef.current) return;

    const unobserve = observeElement(
      containerRef.current,
      (entry) => {
        setIsVisible(entry.isIntersecting);

        // If this post becomes primarily visible and it's a video, set it as active
        if (entry.isIntersecting && postData.type === 'video' && setActiveVideoId) {
          setActiveVideoId(feedId);
        }
      },
      {
        threshold: 0.6, // Higher threshold: 60% visibility required to trigger playback
        rootMargin: "0px"
      }
    );

    return unobserve;
  }, [feedId, postData.type, setActiveVideoId]);

  return (
    <div ref={containerRef} className="w-full h-auto">
      <Postcard
        postData={postData}
        authUser={authUser}
        token={token}
        isVisible={isVisible}
        onHideFromUI={onHideFromUI}
        onNotInterested={onNotInterested}
        viewMode={viewMode}
        activeVideoId={activeVideoId}
        setActiveVideoId={setActiveVideoId}
      />
    </div>
  );
};

export default React.memo(PostcardWrapper);
