import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Context
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";

// Protected Route
import ProtectedRoute from "./context/authProtectedRoutes.jsx";

// Pages & Components
const Login = lazy(() => import("./components/Login.jsx"));
const Layout = lazy(() => import("./components/Layout.jsx"));
const Profilelayout = lazy(() => import("./pages/Profilelayout.jsx"));
const SearchPage = lazy(() => import("./pages/SearchPage.jsx"));
const SubscriptionPage = lazy(() => import("./pages/SubscriptionPage.jsx"));
const SettingsPage = lazy(() => import("./pages/SettingsPage.jsx"));
const InviteFriends = lazy(() => import("./pages/InviteFriends.jsx"));
const SubscriptionDetails = lazy(() => import("./pages/SubscriptionDetail.jsx"));
const SavedPage = lazy(() => import("./pages/SavedPage.jsx"));
const LikedPosts = lazy(() => import("./pages/LikedPosts.jsx"));
const NotInterestedposts = lazy(() => import("./pages/NotInterestedposts.jsx"));
const Hiddenpost = lazy(() => import("./pages/Hiddenpost.jsx"));
const PrivacyPolicy = lazy(() => import("./privacyPolicy.jsx"));
const AdminSendNotification = lazy(() => import("./components/adminsendnotification.jsx"));
const PostDetails = lazy(() => import("./components/FeedPageComponent/postView.jsx"));
const SingleUserProfilelayout = lazy(() => import("./components/SingleUserProfileViewComponent/singleProfileLayout.jsx"));
const RegisterForm = lazy(() => import("./components/LoginPageComponents/forms/registerForm.jsx"));
const UserActivity = lazy(() => import("./components/UserActivity/userActivity.jsx"));
const Feed = lazy(() => import("./pages/Feed.jsx"));
const SearchResultsScreen = lazy(() => import("./components/SearchComponent/mainLayout.jsx"));
const LandingPage = lazy(() => import("./pages/mainHome.jsx"));
const HelpPageLayout = lazy(() => import("./pages/HelpPageLayout.jsx"));
const FAQPage = lazy(() => import("./pages/HelpPageLayout.jsx"));
const FeedbackSupportPage = lazy(() => import("./pages/FeedbackSupportPage.jsx"));
const FeedbackPage = lazy(() => import("./pages/FeedbackSupportPage.jsx"));
const ReferralPage = lazy(() => import("./pages/ReferralPage.jsx"));
const ContactPage = lazy(() => import("./pages/ContactPage.jsx"));
const Blogs = lazy(() => import("./pages/Blogs.jsx"));
const BlogDetail = lazy(() => import("./pages/BlogDetail.jsx"));
const WhatsNewPage = lazy(() => import("./pages/WhatsNewPage.jsx"));
const AIPromptsPage = lazy(() => import("./pages/AIPromptsPage.jsx"));
import { UpdateProvider } from "./context/UpdateContext.jsx";
import { DownloadProvider } from "./context/DownloadContext.jsx";
const DownloadAppPopUp = lazy(() => import("./components/DownloadAppPopUp.jsx"));

// Wallet Pages
const WalletDashboard = lazy(() => import("./pages/Wallet/WalletDashboard.jsx"));
const TransactionHistory = lazy(() => import("./pages/Wallet/TransactionHistory.jsx"));
const PromptUnlockHistory = lazy(() => import("./pages/Wallet/PromptUnlockHistory.jsx"));
const AIGenerationHistory = lazy(() => import("./pages/Wallet/AIGenerationHistory.jsx"));

// Static Pages
const AboutUs = lazy(() => import("./pages/AboutUs.jsx"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions.jsx"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy.jsx"));
const SubscriptionDetailPage = lazy(() => import("./pages/SubscriptionDetailPage.jsx"));
const ReferralDetailPage = lazy(() => import("./pages/ReferralDetailPage.jsx"));
const DeleteAccount = lazy(() => import("./pages/DeleteAccount.jsx"));
const HowToDeleteAccount = lazy(() => import("./pages/HowToDeleteAccount.jsx"));
const DeleteDataPage = lazy(() => import("./pages/DeleteDataPage.jsx"));
const ChildSafetyStandards = lazy(() => import("./pages/ChildSafetyStandards.jsx"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess.jsx"));
const PaymentFailed = lazy(() => import("./pages/PaymentFailed.jsx"));
const PaymentVerification = lazy(() => import("./pages/PaymentVerification.jsx"));



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
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen text-gray-500 text-lg font-medium">
        Loading...
      </div>
    }>
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
      <Route path="/free-ai-prompt" element={<Layout />}>
        <Route index element={<AIPromptsPage />} />
      </Route>
      <Route path="/free-ai-prompts" element={<Layout />}>
        <Route index element={<AIPromptsPage />} />
      </Route>
      <Route path="/free%20ai%20prompt" element={<Layout />}>
        <Route index element={<AIPromptsPage />} />
      </Route>
      <Route path="/free ai prompt" element={<Layout />}>
        <Route index element={<AIPromptsPage />} />
      </Route>
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
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-failed" element={<PaymentFailed />} />
      <Route path="/payment-verification" element={<PaymentVerification />} />


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
        <Route path="/home/prompts" element={<AIPromptsPage />} />
        <Route path="/home/birthday" element={<Feed />} />
        <Route path="/home/anniversary" element={<Feed />} />
        <Route path="/home/politics" element={<Feed />} />
        <Route path="/home/retrivefeed/:notifyfeedid" element={<Feed />} />
        <Route path="/home/hashtag/:tagname" element={<Feed />} />

        {/* Profile & Activity */}
        <Route path="profile" element={<Profilelayout />} />
        <Route path="subscriptions" element={<SubscriptionPage />} />
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
        <Route index element={<SubscriptionPage />} />
      </Route>

      {/* Wallet Routes */}
      <Route
        path="/wallet"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<WalletDashboard />} />
        <Route path="transactions" element={<TransactionHistory />} />
        <Route path="unlocks" element={<PromptUnlockHistory />} />
        <Route path="generations" element={<AIGenerationHistory />} />
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
    </Suspense>
  );
}

const Chatbot = lazy(() => import("./components/Chat/Chatbot.jsx"));

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <UpdateProvider>
            <DownloadProvider>
              <AppRoutes />
              <DownloadAppPopUp />
              <Chatbot />
              <Toaster position="top-right" />
            </DownloadProvider>
          </UpdateProvider>
        </AuthProvider>
      </Router>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
