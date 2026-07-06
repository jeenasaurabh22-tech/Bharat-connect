import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import VisitorLayout from './components/layout/VisitorLayout.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import PublicRoute from './routes/PublicRoute.jsx';
import Landing from './features/Landing.jsx';
import Login from './features/auth/Login.jsx';
import Register from './features/auth/Register.jsx';
import VerifyEmail from './features/auth/VerifyEmail.jsx';
import ForgotPassword from './features/auth/ForgotPassword.jsx';
import ResetPassword from './features/auth/ResetPassword.jsx';
import DashboardOverview from './features/dashboard/DashboardOverview.jsx';
import UserProfile from './features/dashboard/UserProfile.jsx';
import SchemeFinder from './features/schemes/SchemeFinder.jsx';
import AiEligibility from './features/ai/AiEligibility.jsx';
import DocumentVault from './features/documents/DocumentVault.jsx';
import DigiLocker from './features/digilocker/DigiLocker.jsx';
import MyApplications from './features/applications/MyApplications.jsx';
import OfficerDashboard from './features/admin/OfficerDashboard.jsx';
import AdminPortal from './features/admin/AdminPortal.jsx';
import AdminSchemeManager from './features/admin/AdminSchemeManager.jsx';
import DocumentVerification from './features/admin/DocumentVerification.jsx';
function App() {
  return (
    <BrowserRouter>
      {}
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'dark:bg-slate-900 dark:text-slate-100 border dark:border-slate-800 text-sm font-semibold rounded-xl p-3.5',
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#1e293b',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          },
          success: {
            iconTheme: {
              primary: '#16a34a',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
      <Routes>
        {/* Public Visitor Routes */}
        <Route element={<VisitorLayout />}>
          <Route path="/" element={<Landing />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/verify-email"
            element={
              <PublicRoute>
                <VerifyEmail />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />
        </Route>
        {/* Protected Dashboard/Administrative Routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* General routes accessible to all authenticated roles */}
          <Route path="/dashboard" element={<DashboardOverview />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/schemes" element={<SchemeFinder />} />
          {/* Citizen-only modules */}
          <Route
            path="/ai-eligibility"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <AiEligibility />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <DocumentVault />
              </ProtectedRoute>
            }
          />
          <Route
            path="/digilocker"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <DigiLocker />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <MyApplications />
              </ProtectedRoute>
            }
          />
          {/* Officer-only and Admin-only modules */}
          <Route
            path="/officer"
            element={
              <ProtectedRoute allowedRoles={['officer', 'admin']}>
                <OfficerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/verify-documents"
            element={
              <ProtectedRoute allowedRoles={['officer', 'admin']}>
                <DocumentVerification />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/schemes"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminSchemeManager />
              </ProtectedRoute>
            }
          />
        </Route>
        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;