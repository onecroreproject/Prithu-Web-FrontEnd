import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Context
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { UserStatusProvider } from "./context/userContext.jsx";

// 🔒 Protected Route Component (import only, don’t redeclare)
import ProtectedRoute from "./context/authProtectedRoutes.jsx";

// Pages
import Login from "./components/Login.jsx";
import Layout from "./components/Layout.jsx";
import Profilelayout from "./pages/Profilelayout.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import SubscriptionPage from "./pages/SubscriptionPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import InviteFriends from "./pages/InviteFriends.jsx";
import SubscriptionDetails from "./pages/SubscriptionDetail.jsx";
import SavedPage from "./pages/SavedPage.jsx";
import LikedPosts from "./pages/LikedPosts.jsx";
import NotInterestedposts from "./pages/NotInterestedposts.jsx";
import Hiddenpost from "./pages/Hiddenpost.jsx";
import PrivacyPolicy from "./privacyPolicy.jsx";
import PublicResume from "./pages/publiceResume.jsx";
import JobList from "./components/Jobs/jobCardPop-Up.jsx";
import PortfolioLayout from "./components/User_PrortFolio/profileLayout.jsx";
import AdminSendNotification from "./components/adminsendnotification.jsx";
import PostDetails from "./components/FeedPageComponent/postView.jsx"; // ✅ (you likely need to import this)
import SingleUserProfilelayout from "./pages/singleUserProfileview.jsx";
import ReferralUnderConstruction from "./pages/SubscriptionPage.jsx";
import JobDetailsPopup from "./components/Jobs/jobCardPop-Up.jsx";
import SearchJobDetailsPopup from "./components/Jobs/JobCardComponets/searchBarJobPop-up.jsx";
import { Feed } from "@mui/icons-material";
import RegisterForm from "./components/LoginPageComponents/forms/registerForm.jsx";

// ✅ Create a single QueryClient instance
const queryClient = new QueryClient();

// ✅ Placeholder Page
const PlaceholderPage = ({ title }) => (
  <div className="flex items-center justify-center w-full h-full">
    <span className="text-gray-500 text-lg font-medium">
      {title} Page (Under Construction)
    </span>
  </div>
);

function AppRoutes() {
  const { token } = useAuth();

  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={!token ? <Login /> : <Navigate to="/" replace />} />

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
        <Route path="invite" element={<InviteFriends />} />

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
          <Route path="subscription-details" element={<SubscriptionDetails />} />
          <Route path="invite-friends" element={<InviteFriends />} />
        </Route>
      </Route>

      {/* Public routes */}
      <Route path="/logout" element={<Navigate to="/login" replace />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/r/:username" element={<PublicResume />} />
      <Route path="/portfolio/:username" element={<PortfolioLayout />} />
      <Route path="/admin/notification" element={<AdminSendNotification />} />
      <Route path="/user/profile/:username" element={<SingleUserProfilelayout/>} />
      <Route path="/referral" element={<ReferralUnderConstruction/>} />
      <Route path="/job/view/:id" element={<SearchJobDetailsPopup/>}/>
      <Route path="/feed" element={<Feed/>}/>
      <Route path="/create/account" element={<RegisterForm/>}/>

      {/* ✅ Shared Post Redirect Route */}
      <Route
        path="/post/:feedId"
        element={
          <ProtectedRoute>
            <PostDetails />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <UserStatusProvider>
            <AppRoutes />
            <Toaster position="top-right" reverseOrder={false} />
          </UserStatusProvider>
        </AuthProvider>
      </Router>

      {/* ✅ Optional: React Query Devtools */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
