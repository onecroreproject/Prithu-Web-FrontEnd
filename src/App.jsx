import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Context
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { UserStatusProvider } from "./context/userContext.jsx";

// Pages
import Login from "./components/Login.jsx";
import Layout from "./components/Layout.jsx";
import ProfilePage from "./pages/Profilelayout.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import SubscriptionPage from "./pages/SubscriptionPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import ReelsPage from "./pages/ReelsPage.jsx";
import InviteFriends from "./pages/InviteFriends.jsx";
import ReferralPage from "./pages/ReferralPage.jsx";
import SubscriptionDetails from "./pages/SubscriptionDetail.jsx";
import SavedPage from "./pages/SavedPage.jsx";

// Feed pages
import LikedPosts from "./pages/LikedPosts.jsx";
import NotInterestedposts from "./pages/NotInterestedposts.jsx";
import Hiddenpost from "./pages/Hiddenpost.jsx";
//profile pages

import Profilelayout from "./pages/Profilelayout.jsx";
import PrivacyPolicy from "./privacyPolicy.jsx";
// Placeholder pages for settings routes
const PlaceholderPage = ({ title }) => (
  <div className="flex items-center justify-center w-full h-full">
    <span className="text-gray-500 text-lg font-medium">{title} Page (Under Construction)</span>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function AppRoutes() {
  const { token } = useAuth();

  return (
    <Routes>
      {/* Public route */}
      <Route
        path="/login"
        element={!token ? <Login /> : <Navigate to="/" replace />}
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<div />} />
        <Route path="profile" element={<Profilelayout />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="subscriptions" element={<SubscriptionPage />} />
        <Route path="reels" element={<ReelsPage />} />
        <Route path="invite" element={<InviteFriends />} />
        <Route path="referrals" element={<ReferralPage />} />

        {/* Settings with nested routes */}
        <Route path="settings/*" element={<SettingsPage />}>
          <Route
            index
            element={
              <div className="flex items-center justify-center align-content w-full h-full">
                <span className="text-gray-500 text-lg font-medium">
                  Select a setting from the sidebar
                </span>
              </div>
            }
          />
          <Route path="account-type" element={<PlaceholderPage title="Account Type" />} />
          <Route path="notification" element={<PlaceholderPage title="Notification" />} />
          <Route path="security" element={<PlaceholderPage title="Security" />} />
          <Route path="account" element={<PlaceholderPage title="Account" />} />
          <Route path="about" element={<PlaceholderPage title="About" />} />
          <Route path="saved-posts" element={<SavedPage />} />
          <Route path="feed" element={<PlaceholderPage title="Feed" />} />
          <Route path="liked-posts" element={<LikedPosts />} />
          <Route path="not-interested-posts" element={<NotInterestedposts />} />
          <Route path="hidden-posts" element={<Hiddenpost />} />
          <Route path="theme" element={<PlaceholderPage title="Theme" />} />
          <Route path="payment" element={<PlaceholderPage title="Payment" />} />
          <Route path="referral" element={<PlaceholderPage title="Referral" />} />
          <Route path="subscription-details" element={<SubscriptionDetails />} />
          <Route path="invite-friends" element={<InviteFriends />} />
          
        </Route>
      </Route>

      {/* Logout route */}
      <Route path="/logout" element={<Navigate to="/login" replace />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy/>}/>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <UserStatusProvider>
        <AppRoutes />
        <Toaster position="top-right" reverseOrder={false} />
        </UserStatusProvider>
      </AuthProvider>
    </Router>
  );
}