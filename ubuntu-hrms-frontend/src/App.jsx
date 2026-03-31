import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Providers
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'

// Components
import ProtectedRoute from './components/ProtectedRoute'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import Unauthorized from './pages/Unauthorized'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminEmployees from './pages/admin/Employees'

// Manager Pages
import ManagerDashboard from './pages/manager/Dashboard'

// Employee Pages
import EmployeeDashboard from './pages/employee/Dashboard'

// Shared Pages
import AttendancePage from './pages/shared/Attendance'


const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/employees"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminEmployees />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/attendance"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AttendancePage role="admin" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/leaves"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/payroll"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Manager Routes */}
            <Route
              path="/manager/dashboard"
              element={
                <ProtectedRoute allowedRoles={['manager', 'supervisor']}>
                  <ManagerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/attendance"
              element={
                <ProtectedRoute allowedRoles={['manager', 'supervisor']}>
                  <AttendancePage role="manager" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/leaves"
              element={
                <ProtectedRoute allowedRoles={['manager', 'supervisor']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/payroll"
              element={
                <ProtectedRoute allowedRoles={['manager', 'supervisor']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/team"
              element={
                <ProtectedRoute allowedRoles={['manager', 'supervisor']}>
                  <AdminEmployees />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/kpis"
              element={
                <ProtectedRoute allowedRoles={['manager', 'supervisor']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/reports"
              element={
                <ProtectedRoute allowedRoles={['manager', 'supervisor']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Employee Routes */}
            <Route
              path="/employee/dashboard"
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/attendance"
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <AttendancePage role="employee" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/leaves"
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/punch"
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/contracts"
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/profile"
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
