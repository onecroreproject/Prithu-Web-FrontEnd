// src/components/FeedPageComponent/PostcardWrapper.jsx
import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Postcard from "./Postcard";

export default function PostcardWrapper(props) {
  const wrapperRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        console.log("📌 OBSERVER ENTRY:", {
          feedId: props?.postData?.feedId,
          isIntersecting: entry.isIntersecting,
          ratio: entry.intersectionRatio,
        });

        if (entry.isIntersecting) {
          console.log("👀 Card now VISIBLE →", props?.postData?.feedId);
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "200px",
      }
    );

    if (wrapperRef.current) {
      observer.observe(wrapperRef.current);
    }

    return () => {
      if (wrapperRef.current) observer.unobserve(wrapperRef.current);
    };
  }, []);

  return (
    <motion.div
      ref={wrapperRef}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4 }}
    >
      <Postcard {...props} isVisible={isVisible} />
    </motion.div>
  );
}
