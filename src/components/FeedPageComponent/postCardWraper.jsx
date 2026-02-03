import React, { useRef, useState, useEffect } from "react";
import Postcard from "./Postcard";
import { observeElement } from "../../utils/intersectionObserver";

const PostcardWrapper = ({ postData, authUser, token, onHideFromUI, onNotInterested, viewMode }) => {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const unobserve = observeElement(
      containerRef.current,
      (entry) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.15, // Trigger when 15% visible
        rootMargin: "0px"
      }
    );

    return unobserve;
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full">
      <Postcard
        postData={postData}
        authUser={authUser}
        token={token}
        isVisible={isVisible}
        onHideFromUI={onHideFromUI}
        onNotInterested={onNotInterested}
        viewMode={viewMode}
      />
    </div>
  );
};

export default React.memo(PostcardWrapper);
