// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.1/firebase-messaging-compat.js");

// 🔹 Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyA3QOb6FOv91upHLT4gtGsBtr-7jKCL5Uk",
  authDomain: "prithu-app-35919.firebaseapp.com",
  projectId: "prithu-app-35919",
  storageBucket: "prithu-app-35919.firebasestorage.app",
  messagingSenderId: "1032343355991",
  appId: "1:1032343355991:web:0d5948b2a9ac6ddd52d912",
  measurementId: "G-TC86W4GJW6",
});

// 🔹 Retrieve Firebase Messaging
const messaging = firebase.messaging();

// 🔹 Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("📩 Received background message: ", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/firebase-logo.png", // optional
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
