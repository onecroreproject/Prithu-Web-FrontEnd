import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyA3QOb6FOv91upHLT4gtGsBtr-7jKCL5Uk",
  authDomain: "prithu-app-35919.firebaseapp.com",
  projectId: "prithu-app-35919",
  storageBucket: "prithu-app-35919.firebasestorage.app",
  messagingSenderId: "1032343355991",
  appId: "1:1032343355991:web:0d5948b2a9ac6ddd52d912",
  measurementId: "G-TC86W4GJW6",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestFCMPermissionAndToken = async () => {
  try {
    console.log("🔔 Requesting notification permission...");
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("✅ Notification permission granted.");

      // ✅ Ensure service worker is registered
      const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      console.log("✅ Service Worker registered successfully:", registration);

      const token = await getToken(messaging, {
        vapidKey: "BLU_4otT1lF7NmTspMCDsW7WdQelgSPBWmRirEuSCz64I5X-WDIiWy22cFzBUhzglnfzmrvCRUwrKtYw6YLSVCU",
        serviceWorkerRegistration: registration,
      });

      if (token) {
        console.log("🎯 FCM Token:", token);
        return token;
      } else {
        console.warn("⚠️ No registration token available.");
        return null;
      }
    } else {
      console.warn("🚫 Notification permission denied.");
      return null;
    }
  } catch (err) {
    console.error("Error getting FCM token:", err);
    return null;
  }
};

export const onMessageListener = (callback) => {
  onMessage(messaging, (payload) => {
    callback(payload);
  });
};
