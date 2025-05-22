import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx';

// Layouts
import AuthLayout from './layouts/AuthLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';

// Auth Pages
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';

// Manager Pages
import ManagerDashboard from './pages/manager/Dashboard.jsx';
import AssignTask from './pages/manager/AssignTask.jsx';
import ViewTimesheets from './pages/manager/ViewTimesheets.jsx';

// Associate Pages
import AssociateDashboard from './pages/associate/Dashboard.jsx';
import MyTasks from './pages/associate/MyTasks.jsx';
import MyTimesheets from './pages/associate/MyTimesheets.jsx';

// Shared
import Profile from './pages/shared/Profile.jsx';
import NotFound from './pages/shared/NotFound.jsx';

function App() {
  const { user, loading } = useAuth();

  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" replace />} />
      </Route>
      
      {/* Protected Routes */}
      <Route element={<DashboardLayout />}>
        {/* Redirect to appropriate dashboard based on role */}
        <Route path="/dashboard" element={
          user ? (
            user.role === 'manager' 
              ? <ManagerDashboard /> 
              : <AssociateDashboard />
          ) : <Navigate to="/login" replace />
        } />
        
        {/* Manager Routes */}
        <Route path="/assign-task" element={
          user && user.role === 'manager' 
            ? <AssignTask /> 
            : <Navigate to="/dashboard" replace />
        } />
        <Route path="/view-timesheets" element={
          user && user.role === 'manager' 
            ? <ViewTimesheets /> 
            : <Navigate to="/dashboard" replace />
        } />
        
        {/* Associate Routes */}
        <Route path="/my-tasks" element={
          user && user.role === 'associate' 
            ? <MyTasks /> 
            : <Navigate to="/dashboard" replace />
        } />
        <Route path="/my-timesheets" element={
          user && user.role === 'associate' 
            ? <MyTimesheets /> 
            : <Navigate to="/dashboard" replace />
        } />
        
        {/* Shared Routes */}
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" replace />} />
      </Route>
      
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;