import { useState, useEffect } from "react";
import { Route, Routes } from "react-router";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";
import { ChatProvider } from "./contexts/ChatContext";
import { NotificationProvider } from "./contexts/NotificationContext";

import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ChangePasswordFirstTime from "./pages/ChangePasswordFirstTime";
import NotFoundPage from "./pages/NotFoundPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";

import Dashboard from "./pages/AdminDashboard";
import AssignmentsPage from "./pages/AdminAssignmentsPage";
import TicketsPage from "./pages/AdminTicketsPage";
import LostAndFoundPage from "./pages/AdminLostAndFoundPage";
import UsersPage from "./pages/AdminUsersPage";
import AdminInventoryPage from "./pages/AdminInventoryPage";

import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployeeTicketsPage from "./pages/EmployeeTicketsPage";
import EmployeeLostFound from "./pages/EmployeeLostAndFoundPage";
import EmployeeInventoryPage from "./pages/EmployeeInventoryPage";
import EmployeeAssignmentPage from "./pages/EmployeeAssignmentPage";
import SettingsPage from "./pages/SettingsPage";

const API_URL = import.meta.env.VITE_API_URL;

const App = () => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then((r) => r.json())
      .then((data) => {
        if (data.settings?.brandColor) {
          const color = data.settings.brandColor;
          document.documentElement.style.setProperty("--color-brand", color);
          localStorage.setItem("brandColor", color);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    setCurrentUser(null);
  };

  return (
    <ChatProvider currentUser={currentUser}>
      <NotificationProvider currentUser={currentUser}>
      <Toaster position="top-right" />
      <Routes>
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route path="/" element={<Login setCurrentUser={setCurrentUser} />} />
        <Route
          path="/login"
          element={<Login setCurrentUser={setCurrentUser} />}
        />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/change-password-first-time"
          element={<ChangePasswordFirstTime />}
        />
        <Route path="/profile" element={<ProfilePage onLogout={handleLogout} />} />
        <Route path="/chat" element={<ChatPage currentUser={currentUser} onLogout={handleLogout} />} />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <Dashboard onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assignments"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <AssignmentsPage onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <TicketsPage onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lost-found"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <LostAndFoundPage onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assets"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <AdminInventoryPage onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <UsersPage onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee-dashboard"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeeDashboard onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-assignments"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeeInventoryPage onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-tickets"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeeTicketsPage onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-lost-found"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeeLostFound onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-assets"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeeInventoryPage onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/request-asset"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeeAssignmentPage onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <SettingsPage onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
      </Routes>
      </NotificationProvider>
    </ChatProvider>
  );
};

export default App;
