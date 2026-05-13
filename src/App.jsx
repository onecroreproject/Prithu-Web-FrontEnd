import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Context
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";

// Protected Route
import ProtectedRoute from "./context/authProtectedRoutes.jsx";

// Pages & Components
import Login from "./components/Login.jsx";
import Layout from "./components/Layout.jsx";
import Profilelayout from "./pages/Profilelayout.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import SubscriptionPage from "./pages/SubscriptionPage.jsx";
import Paymentdemo from "./pages/Paymentdemo.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import InviteFriends from "./pages/InviteFriends.jsx";
import SubscriptionDetails from "./pages/SubscriptionDetail.jsx";
import SavedPage from "./pages/SavedPage.jsx";
import LikedPosts from "./pages/LikedPosts.jsx";
import NotInterestedposts from "./pages/NotInterestedposts.jsx";
import Hiddenpost from "./pages/Hiddenpost.jsx";
import PrivacyPolicy from "./privacyPolicy.jsx";
import AdminSendNotification from "./components/adminsendnotification.jsx";
import PostDetails from "./components/FeedPageComponent/postView.jsx";
import SingleUserProfilelayout from "./components/SingleUserProfileViewComponent/singleProfileLayout.jsx";
import RegisterForm from "./components/LoginPageComponents/forms/registerForm.jsx";
import UserActivity from "./components/UserActivity/userActivity.jsx";
import Feed from "./pages/Feed.jsx";
import SearchResultsScreen from "./components/SearchComponent/mainLayout.jsx";
import LandingPage from "./pages/mainHome.jsx";
import HelpPageLayout from "./pages/HelpPageLayout.jsx";
import FAQPage from "./pages/HelpPageLayout.jsx";
import FeedbackSupportPage from "./pages/FeedbackSupportPage.jsx";
import FeedbackPage from "./pages/FeedbackSupportPage.jsx";
import ReferralPage from "./pages/ReferralPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import Blogs from "./pages/Blogs.jsx";
import BlogDetail from "./pages/BlogDetail.jsx";
import WhatsNewPage from "./pages/WhatsNewPage.jsx";
import { UpdateProvider } from "./context/UpdateContext.jsx";
import { DownloadProvider } from "./context/DownloadContext.jsx";
import DownloadAppPopUp from "./components/DownloadAppPopUp.jsx";

// Static Pages
import AboutUs from "./pages/AboutUs.jsx";
import TermsAndConditions from "./pages/TermsAndConditions.jsx";
import RefundPolicy from "./pages/RefundPolicy.jsx";
import SubscriptionDetailPage from "./pages/SubscriptionDetailPage.jsx";
import ReferralDetailPage from "./pages/ReferralDetailPage.jsx";
import DeleteAccount from "./pages/DeleteAccount.jsx";
import HowToDeleteAccount from "./pages/HowToDeleteAccount.jsx";
import DeleteDataPage from "./pages/DeleteDataPage.jsx";
import ChildSafetyStandards from "./pages/ChildSafetyStandards.jsx";



// React Query Client
const queryClient = new QueryClient();

// Placeholder Page
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
      {/* ================= PUBLIC ROUTES ================= */}

      {/* ✅ ROOT FIX: redirect if already logged in */}
      <Route
        path="/"
        element={token ? <Navigate to="/home" replace /> : <LandingPage />}
      />

      <Route
        path="/login"
        element={!token ? <Login /> : <Navigate to="/home" replace />}
      />

      <Route
        path="/signup"
        element={!token ? <Login initialMode="register" /> : <Navigate to="/home" replace />}
      />

      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/admin/notification" element={<AdminSendNotification />} />
      <Route path="/home/user/profile/:id" element={<SingleUserProfilelayout />} />
      <Route path="/create/account" element={<RegisterForm />} />
      <Route path="/search" element={<SearchResultsScreen />} />
      <Route path="/post/:id" element={<PostDetails />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/how-to-delete-account" element={<HowToDeleteAccount />} />
      <Route path="/delete-data" element={<DeleteDataPage />} />
      <Route path="/child-safety-standards" element={<ChildSafetyStandards />} />


      {/* Static Footer Pages */}
      <Route path="/about-us" element={<AboutUs />} />
      <Route path="/terms-conditions" element={<TermsAndConditions />} />
      <Route path="/refund-policy" element={<RefundPolicy />} />
      <Route path="/subscription-detail" element={<SubscriptionDetailPage />} />
      <Route path="/referral-detail" element={<ReferralDetailPage />} />


      {/* ================= PROTECTED ROUTES ================= */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Home Feed */}
        <Route index element={<Feed />} />
        <Route path="/home/reels" element={<Feed />} />
        <Route path="/home/images" element={<Feed />} />
        <Route path="/home/birthday" element={<Feed />} />
        <Route path="/home/anniversary" element={<Feed />} />
        <Route path="/home/politics" element={<Feed />} />
        <Route path="/home/retrivefeed/:notifyfeedid" element={<Feed />} />
        <Route path="/home/hashtag/:tagname" element={<Feed />} />

        {/* Profile & Activity */}
        <Route path="profile" element={<Profilelayout />} />
        <Route path="subscriptions" element={<Paymentdemo />} />
        <Route path="invite" element={<InviteFriends />} />
        <Route path="referral" element={<ReferralPage />} />
        <Route path="activity" element={<UserActivity />} />

        {/* Settings */}
        <Route path="settings/*" element={<SettingsPage />}>
          <Route index element={<PlaceholderPage title="Settings" />} />
          <Route path="saved-posts" element={<SavedPage />} />
          <Route path="liked-posts" element={<LikedPosts />} />
          <Route path="not-interested-posts" element={<NotInterestedposts />} />
          <Route path="hidden-posts" element={<Hiddenpost />} />
          <Route path="subscription-details" element={<SubscriptionDetails />} />
        </Route>

        {/* Help */}
        <Route path="help" element={<FAQPage />} />
        <Route path="feedback-support" element={<FeedbackPage />} />

        {/* What's New */}
        <Route path="whats-new" element={<WhatsNewPage />} />

        {/* Delete Account */}
        <Route path="delete-account" element={<DeleteAccount />} />
      </Route>


      {/* Blogs - Moved out of Protected /home section */}
      <Route path="/blogs" element={<Layout />}>
        <Route index element={<Blogs />} />
        <Route path=":slug" element={<BlogDetail />} />
      </Route>

      {/* Subscription Route with Layout */}
      <Route
        path="/subscription"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Paymentdemo />} />
      </Route>

      {/* Shared Post */}
      <Route
        path="/retrivefeed/:feedId"
        element={
          <ProtectedRoute>
            <PostDetails />
          </ProtectedRoute>
        }
      />

      {/* Catch All */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <UpdateProvider>
            <DownloadProvider>
              <AppRoutes />
              <DownloadAppPopUp />
              <Toaster position="top-right" />
            </DownloadProvider>
          </UpdateProvider>
        </AuthProvider>
      </Router>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
