import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Context
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { UserStatusProvider } from "./context/userContext.jsx";

// Protected Route
import ProtectedRoute from "./context/authProtectedRoutes.jsx";

// Pages & Components
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
import PortfolioLayout from "./components/User_PrortFolio/portFolioLayout.jsx";
import AdminSendNotification from "./components/adminsendnotification.jsx";
import PostDetails from "./components/FeedPageComponent/postView.jsx";
import SingleUserProfilelayout from "./components/SingleUserProfileViewComponent/singleProfileLayout.jsx";
import SearchJobDetailsPopup from "./components/Jobs/JobCardComponets/searchBarJobPop-up.jsx";
import RegisterForm from "./components/LoginPageComponents/forms/registerForm.jsx";
import UserActivity from "./components/UserActivity/userActivity.jsx";
import Feed from "./pages/Feed.jsx";
import SearchResultsScreen from "./components/SearchComponent/mainLayout.jsx";
import UpcomingEvents from "./components/UpcomingEvents.jsx";
import JobDomainPage from "./components/Jobs/HeaderJobs/JobDomainPage.jsx";
import JobsHomePage from "./components/Jobs/HeaderJobs/JobLayout.jsx";
import CompanyLogin from "./components/CompanyLoginComponents/mainLoginLayout.jsx";
import JobPageWrapper from "./components/Jobs/HeaderJobs/jobPageWraper.jsx";
import CompanyDashboard from "./Company/Home/companyLayout.jsx";
import JobPostingForm from "./Company/Home/companyLayoutComponent/tabComponent/createTabComponent/JobApplication.jsx";
import JobApplicationPage from "./components/Jobs/HeaderJobs/appliedPagePop-up.jsx";
import AptitudeTest from "./components/Aptitude/aptitudeMainLayout.jsx";
import CompanyProfile from "./Company/Home/companyProfile.jsx";
import LandingPage from "./pages/mainHome.jsx";
import SharePostPage from "./components/FeedPageComponent/createOGTags.jsx";
import AppliedJobs from "./pages/userJobApplication/userAppliedJobs.jsx";

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

      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/r/:username" element={<PublicResume />} />
      <Route path="/portfolio/:username" element={<PortfolioLayout />} />
      <Route path="/admin/notification" element={<AdminSendNotification />} />
      <Route path="/home/user/profile/:id" element={<SingleUserProfilelayout />} />
      <Route path="/job/view/:id" element={<SearchJobDetailsPopup />} />
      <Route path="/create/account" element={<RegisterForm />} />
      <Route path="/search" element={<SearchResultsScreen />} />
      <Route path="/event" element={<UpcomingEvents />} />
      <Route path="/jobs/:domain" element={<JobDomainPage />} />
      <Route path="/jobs" element={<JobsHomePage />} />
      <Route path="/company/login" element={<CompanyLogin />} />
      <Route path="/company/home" element={<CompanyDashboard />} />
      <Route path="/job/:id" element={<JobPageWrapper />} />
      <Route path="/jobs/create" element={<JobPostingForm />} />
      <Route path="/jobs/edit/:id" element={<JobPostingForm />} />
      <Route path="/job/apply/:jobId" element={<JobApplicationPage />} />
      <Route path="/aptitude" element={<AptitudeTest />} />
      <Route path="/post/:id" element={<PostDetails />} />
      <Route path="/company/:companyId" element={<CompanyProfile />} />
      <Route path="/share/post/:feedId" element={<SharePostPage />} />
      <Route path="/jobs/applied/jobs" element={<AppliedJobs/>} />
      

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
        <Route path="/home/retrivefeed/:notifyfeedid" element={<Feed />} />
        <Route path="/home/hashtag/:tagname" element={<Feed />} />

        {/* Profile & Activity */}
        <Route path="profile" element={<Profilelayout />} />
        <Route path="subscriptions" element={<SubscriptionPage />} />
        <Route path="invite" element={<InviteFriends />} />
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
          <UserStatusProvider>
            <AppRoutes />
            <Toaster position="top-right" />
          </UserStatusProvider>
        </AuthProvider>
      </Router>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
