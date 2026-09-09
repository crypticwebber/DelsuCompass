import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { AdminRoute } from "@/features/auth/components/AdminRoute";
import { StudentAppLayout } from "@/layouts/StudentAppLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { NotFoundPage } from "@/components/feedback/NotFoundPage";
import { RouteErrorPage } from "@/components/feedback/RouteErrorPage";

const FoundationPage = lazy(() => import("@/features/dashboard/FoundationPage").then((m) => ({ default: m.FoundationPage })));
const DashboardPage = lazy(() => import("@/features/dashboard/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const LoginPage = lazy(() => import("@/features/auth/LoginPage").then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("@/features/auth/RegisterPage").then((m) => ({ default: m.RegisterPage })));
const VerifyEmailPage = lazy(() => import("@/features/auth/VerifyEmailPage").then((m) => ({ default: m.VerifyEmailPage })));
const ForgotPasswordPage = lazy(() => import("@/features/auth/ForgotPasswordPage").then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import("@/features/auth/ResetPasswordPage").then((m) => ({ default: m.ResetPasswordPage })));
const ExplorePage = lazy(() => import("@/features/public/ExplorePage").then((m) => ({ default: m.ExplorePage })));
const ProfilePage = lazy(() => import("@/features/profile/ProfilePage").then((m) => ({ default: m.ProfilePage })));
const NotificationsPage = lazy(() => import("@/features/notifications/NotificationsPage").then((m) => ({ default: m.NotificationsPage })));
const SearchPage = lazy(() => import("@/features/search/SearchPage").then((m) => ({ default: m.SearchPage })));
const TimetablePage = lazy(() => import("@/features/timetable/TimetablePage").then((m) => ({ default: m.TimetablePage })));
const RemindersPage = lazy(() => import("@/features/reminders/RemindersPage").then((m) => ({ default: m.RemindersPage })));
const AccommodationPage = lazy(() => import("@/features/accommodation/AccommodationPage").then((m) => ({ default: m.AccommodationPage })));
const CommunityPage = lazy(() => import("@/features/community/CommunityPage").then((m) => ({ default: m.CommunityPage })));
const EventsPage = lazy(() => import("@/features/events/EventsPage").then((m) => ({ default: m.EventsPage })));
const OpportunitiesPage = lazy(() => import("@/features/opportunities/OpportunitiesPage").then((m) => ({ default: m.OpportunitiesPage })));
const SafetyPage = lazy(() => import("@/features/safety/SafetyPage").then((m) => ({ default: m.SafetyPage })));
const MapPage = lazy(() => import("@/features/map/MapPage").then((m) => ({ default: m.MapPage })));
const BudgetPage = lazy(() => import("@/features/budget/BudgetPage").then((m) => ({ default: m.BudgetPage })));
const AdminDashboardPage = lazy(() => import("@/features/admin/AdminDashboardPage").then((m) => ({ default: m.AdminDashboardPage })));
const UserManagementPage = lazy(() => import("@/features/admin/UserManagementPage").then((m) => ({ default: m.UserManagementPage })));
const AccommodationModerationPage = lazy(() => import("@/features/admin/AccommodationModerationPage").then((m) => ({ default: m.AccommodationModerationPage })));
const CommunityModerationPage = lazy(() => import("@/features/admin/CommunityModerationPage").then((m) => ({ default: m.CommunityModerationPage })));
const DiscoveryModerationPage = lazy(() => import("@/features/admin/DiscoveryModerationPage").then((m) => ({ default: m.DiscoveryModerationPage })));
const SafetyModerationPage = lazy(() => import("@/features/admin/SafetyModerationPage").then((m) => ({ default: m.SafetyModerationPage })));
const LocationManagementPage = lazy(() => import("@/features/admin/LocationManagementPage").then((m) => ({ default: m.LocationManagementPage })));
const InformationManagementPage = lazy(() => import("@/features/admin/InformationManagementPage").then((m) => ({ default: m.InformationManagementPage })));

export const router = createBrowserRouter([
  { path: "/", element: <FoundationPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/explore", element: <ExplorePage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/verify-email", element: <VerifyEmailPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  {
    element: <ProtectedRoute />,
    children: [{
      path: "/app",
      element: <StudentAppLayout />,
      errorElement: <RouteErrorPage />,
      children: [
        { path: "dashboard", element: <DashboardPage /> },
        { path: "timetable", element: <TimetablePage /> },
        { path: "reminders", element: <RemindersPage /> },
        { path: "accommodation", element: <AccommodationPage /> },
        { path: "budget", element: <BudgetPage /> },
        { path: "safety", element: <SafetyPage /> },
        { path: "community", element: <CommunityPage /> },
        { path: "events", element: <EventsPage /> },
        { path: "opportunities", element: <OpportunitiesPage /> },
        { path: "map", element: <MapPage /> },
        { path: "search", element: <SearchPage /> },
        { path: "notifications", element: <NotificationsPage /> },
        { path: "profile", element: <ProfilePage /> },
      ],
    }],
  },
  {
    element: <AdminRoute />,
    children: [{
      path: "/admin",
      element: <AdminLayout />,
      errorElement: <RouteErrorPage />,
      children: [
        { path: "dashboard", element: <AdminDashboardPage /> },
        { path: "users", element: <UserManagementPage /> },
        { path: "accommodation", element: <AccommodationModerationPage /> },
        { path: "community", element: <CommunityModerationPage /> },
        { path: "events", element: <DiscoveryModerationPage kind="events" /> },
        { path: "opportunities", element: <DiscoveryModerationPage kind="opportunities" /> },
        { path: "safety", element: <SafetyModerationPage /> },
        { path: "locations", element: <LocationManagementPage /> },
        { path: "information", element: <InformationManagementPage /> },
      ],
    }],
  },
  { path: "*", element: <NotFoundPage /> },
]);
