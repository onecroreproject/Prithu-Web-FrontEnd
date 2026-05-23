import { useState, useEffect, useRef, useCallback } from 'react';
import axios from '../api/axios';
import debounce from 'lodash.debounce';

/**
 * 🚀 Hook to track feed engagement automatically
 * @param {string} feedId - The ID of the feed being tracked
 * @param {boolean} isVideo - Whether the feed is a video
 * @param {string} sessionId - Unique session ID for the user session
 */
const useFeedTracking = (feedId, isVisible, isVideo = false, sessionId = 'default_session', recoScore = 0, recoSource = 'organic') => {
  const [watchTime, setWatchTime] = useState(0);
  const [percentageWatched, setPercentageWatched] = useState(0);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Debounced API call to update watch time
  const updateWatchTimeApi = useCallback(
    debounce(async (time, percent) => {
      try {
        const response = await axios.post('/api/track-watch-time', {
          feedId,
          watchTime: Math.round(time),
          percentageWatched: percent,
          sessionId,
          recoScore,
          recoSource
        });
        if (response.data && response.data.triggerFeedbackPopup) {
          const event = new CustomEvent("triggerFeedbackPopup", {
            detail: { feedId }
          });
          window.dispatchEvent(event);
        }
      } catch (err) {
        console.error('Failed to update watch time:', err);
      }
    }, 3000), 
    [feedId, sessionId]
  );

  // Track scroll depth/stop
  const trackScrollApi = useCallback(
    debounce(async (depth) => {
      try {
        await axios.post('/api/track-scroll', {
          feedId,
          scrollDepth: depth,
          timestamp: new Date()
        });
      } catch (err) {
        console.error('Failed to track scroll:', err);
      }
    }, 2000),
    [feedId]
  );

  useEffect(() => {
    if (isVisible) {
      // Initialize view tracking
      axios.post('/api/track-feed-view', {
        feedId,
        deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop',
        sessionId,
        recoScore,
        recoSource
      }).catch(err => console.error('Failed to initialize view tracking:', err));

      // Track scroll on visibility
      trackScrollApi(window.scrollY);

      // Start timer
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setWatchTime(prev => {
          const newTime = prev + 1;
          updateWatchTimeApi(newTime, percentageWatched); 
          return newTime;
        });
      }, 1000);
    } else {
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      // Final update on hide
      if (watchTime > 0) {
        updateWatchTimeApi(watchTime, percentageWatched);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        // Ensure final update on unmount
        if (watchTime > 0) {
            updateWatchTimeApi(watchTime, percentageWatched);
        }
      }
    };
  }, [isVisible, feedId, percentageWatched]);

  return {
    watchTime,
    setPercentageWatched
  };
};

export default useFeedTracking;
