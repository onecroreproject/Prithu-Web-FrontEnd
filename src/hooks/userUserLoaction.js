
import { useEffect, useRef } from "react";
import api from "../api/axios";

const useUserLocation = () => {
  const retryTimer = useRef(null);

  // helper to request actual coordinates
  const requestLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        console.log("✅ Location granted:", latitude, longitude);
        try {
          await api.post("/api/save/user/location", {
            latitude,
            longitude,
          });
          console.log("📍 Location saved to DB");
        } catch (err) {
          console.error("Failed to save location:", err);
        }
      },
      (err) => {
        console.warn("❌ User denied or error:", err);
        scheduleRetry(); // user denied — schedule retry
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // helper to re-ask every 5 minutes
  const scheduleRetry = () => {
    if (retryTimer.current) clearTimeout(retryTimer.current);
    retryTimer.current = setTimeout(() => {
      console.log("🔁 Re-asking location permission...");
      requestLocation();
    }, 5 * 60 * 1000); // 5 minutes
  };

  // main effect
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      console.error("Geolocation not supported by this browser.");
      return;
    }

    // use Permissions API if available
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        console.log("Permission state:", result.state);
        if (result.state === "granted") {
          requestLocation();
        } else if (result.state === "prompt") {
          requestLocation();
        } else if (result.state === "denied") {
          scheduleRetry();
        }

        // Listen for changes (e.g., user changes browser permission)
        result.onchange = () => {
          if (result.state === "granted") {
            clearTimeout(retryTimer.current);
            requestLocation();
          } else if (result.state === "denied") {
            scheduleRetry();
          }
        };
      });
    } else {
      // fallback if Permissions API not supported
      requestLocation();
    }

    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, [userId]);
};

export default useUserLocation;
