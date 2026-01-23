import React, { useRef, useState, useEffect } from "react";
import Postcard from "./Postcard";

const PostcardWrapper = ({ postData, authUser, token, onHideFromUI, onNotInterested }) => {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.15, // Trigger when 15% visible
        rootMargin: "0px"
      }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      <Postcard
        postData={postData}
        authUser={authUser}
        token={token}
        isVisible={isVisible}
        onHideFromUI={onHideFromUI}
        onNotInterested={onNotInterested}
      />
    </div>
  );
};

export default React.memo(PostcardWrapper);
