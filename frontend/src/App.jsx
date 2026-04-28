import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import NotesOverview from './pages/NotesOverview';
import NotesEditorPage from './pages/NotesEditorPage';
import CalendarPage from './pages/CalendarPage';
import TodoList from './pages/TodoList';
import Profile from './pages/Profile';
import Finance from './pages/Finance';
import GraphView from './pages/GraphView';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

import { initSound } from './utils/sound';
import GoogleCallback from './pages/GoogleCallback';
import usePushNotifications from './hooks/usePushNotifications';

function App() {
  usePushNotifications(); // Background notification setup

  React.useEffect(() => {
    initSound();
  }, []);

  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Public/Special Routes */}
      <Route path="/api/google/callback" element={<GoogleCallback />} />

      {/* Main App Routes (Protected) */}
      <Route 
        path="/*" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/notes" element={<NotesOverview />} />
                <Route path="/notes/:id" element={<NotesEditorPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/todo" element={<TodoList />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/finance" element={<Finance />} />
                <Route path="/graph" element={<GraphView />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;
