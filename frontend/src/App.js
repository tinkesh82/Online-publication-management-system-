import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PublicationDetailPage from "./pages/PublicationDetailPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProfilePage from "./pages/ProfilePage";

// User Dashboard
import MyPublicationsPage from "./pages/Dashboard/MyPublicationsPage";
import SubmitPublicationPage from "./pages/Dashboard/SubmitPublicationPage";
import EditPublicationPage from "./pages/Dashboard/EditPublicationPage";

// Reviewer Dashboard
import ReviewQueuePage from "./pages/Dashboard/ReviewQueuePage";
// ReviewPublicationPage could be part of PublicationDetailPage with conditional UI

// Admin Dashboard
import AdminUserManagementPage from "./pages/Dashboard/AdminUserManagementPage";
import AdminPublicationManagementPage from "./pages/Dashboard/AdminPublicationManagementPage";
import AdminAddUserPage from "./pages/Dashboard/AdminAddUserPage";
import AdminEditUserPage from "./pages/Dashboard/AdminEditUserPage";

function App() {
  return (
    <>
      <Navbar />
      <div className="container">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/publications/:id" element={<PublicationDetailPage />} />
          <Route
            element={<ProtectedRoute roles={["user", "reviewer", "admin"]} />}
          >
            <Route
              path="/publications/review/:id"
              element={<PublicationDetailPage />}
            />
          </Route>

          <Route element={<ProtectedRoute roles={["reviewer", "admin"]} />} />
          <Route path="/dashboard/review-queue" element={<ReviewQueuePage />} />
          {/* User Routes */}
          <Route
            element={<ProtectedRoute roles={["user", "admin", "reviewer"]} />}
          >
            <Route path="/profile" element={<ProfilePage />} />
            <Route
              path="/dashboard/my-publications"
              element={<MyPublicationsPage />}
            />
            <Route
              path="/dashboard/submit-publication"
              element={<SubmitPublicationPage />}
            />
            <Route
              path="/dashboard/edit-publication/:id"
              element={<EditPublicationPage />}
            />
          </Route>

          {/* Reviewer Routes */}
          <Route element={<ProtectedRoute roles={["reviewer", "admin"]} />}>
            <Route
              path="/dashboard/review-queue"
              element={<ReviewQueuePage />}
            />
            {/* Individual review page might be part of PublicationDetailPage or a new one */}
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route path="/admin/users" element={<AdminUserManagementPage />} />
            <Route path="/admin/users/add" element={<AdminAddUserPage />} />
            <Route
              path="/admin/users/edit/:id"
              element={<AdminEditUserPage />}
            />
            <Route
              path="/admin/publications"
              element={<AdminPublicationManagementPage />}
            />
            {/* Admin can edit/delete publications through specific components or by enhancing existing ones */}
          </Route>

          <Route path="/not-found" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
