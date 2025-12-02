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
import PortfolioLayout from "./components/User_PrortFolio/portFolioLayout.jsx";
import AdminSendNotification from "./components/adminsendnotification.jsx";
import PostDetails from "./components/FeedPageComponent/postView.jsx";
import SingleUserProfilelayout from "./components/SingleUserProfileViewComponent/singleProfileLayout.jsx";
import ReferralUnderConstruction from "./pages/SubscriptionPage.jsx"; // TODO: Create dedicated ReferralPage.jsx
import SearchJobDetailsPopup from "./components/Jobs/JobCardComponets/searchBarJobPop-up.jsx";
import RegisterForm from "./components/LoginPageComponents/forms/registerForm.jsx";
import UserActivity from './components/UserActivity/userActivity.jsx';
import Feed from './pages/Feed.jsx';
import SearchResultsScreen from "./components/SearchComponent/mainLayout.jsx";
import UpcomingEvents from "./components/UpcomingEvents.jsx";
import Jobsection from "./components/Jobs/Jobsection.jsx";
import JobsHomePage from "./components/Jobs/HeaderJobs/JobLayout.jsx";
import JobDomainPage from "./components/Jobs/HeaderJobs/JobDomainPage.jsx";
import CompanyLogin from "./components/CompanyLoginComponents/mainLoginLayout.jsx";
import JobPageWrapper from "./components/Jobs/HeaderJobs/jobPageWraper.jsx";
import CompanyDashboard from "./Company/Home/companyLayout.jsx";
import JobPostingForm from "./Company/Home/companyLayoutComponent/tabComponent/createTabComponent/JobApplication.jsx";


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

      {/* Protected routes using Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* HOME */}
<Route index element={<Feed />} />
<Route path="retrivefeed/:notifyfeedid" element={<Feed />} />
<Route path="hashtag/:tagname" element={<Feed />} />   // ⭐ Keep this above "/feed"


        {/* Other Layout children */}
        <Route path="profile" element={<Profilelayout />} />
        <Route path="subscriptions" element={<SubscriptionPage />} />
        <Route path="invite" element={<InviteFriends />} />
        <Route path="activity" element={<UserActivity />} />
     

        {/* Settings nested routes */}
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

      {/* Public routes (outside layout) */}
      <Route path="/logout" element={<Navigate to="/login" replace />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/r/:username" element={<PublicResume />} />
      <Route path="/portfolio/:username" element={<PortfolioLayout />} />
      <Route path="/admin/notification" element={<AdminSendNotification />} />
      <Route path="/user/profile/:id" element={<SingleUserProfilelayout />} />
      <Route path="/referral" element={<ReferralUnderConstruction />} />
      <Route path="/job/view/:id" element={<SearchJobDetailsPopup />} />
      <Route path="/feed" element={<Feed />} />
      <Route path="/create/account" element={<RegisterForm />} />
      <Route path="/search" element={<SearchResultsScreen/>}/>
      <Route path="/event" element={<UpcomingEvents/>}/>
      <Route path="/jobs/:domain" element={<JobDomainPage/>}/>
      <Route path="/jobs" element ={<JobsHomePage/>}/>
      <Route path="/company/login" element ={<CompanyLogin/>}/>
      <Route path="/company/home" element={<CompanyDashboard/>}/>
      <Route path="/job/:id" element ={<JobPageWrapper/>}/>
      <Route path="/jobs/create" element={<JobPostingForm/>} />
      <Route path="/jobs/edit/:id" element={<JobPostingForm />} />

      {/* Shared post */}
      <Route
        path="/retrivefeed/:feedId"
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