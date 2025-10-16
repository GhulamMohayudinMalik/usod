import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import LogsPage from './pages/LogsPage';
import ThreatsPage from './pages/ThreatsPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import AiInsightsPage from './pages/AiInsightsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import BackupPage from './pages/BackupPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import SecurityPage from './pages/SecurityPage';
import SecurityLabPage from './pages/SecurityLabPage';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import './App.css';

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <div className="App">
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          } 
        />
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <Layout user={user} onLogout={handleLogout}>
                <DashboardPage />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? (
              <Layout user={user} onLogout={handleLogout}>
                <DashboardPage />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/logs" 
          element={
            isAuthenticated ? (
              <Layout user={user} onLogout={handleLogout}>
                <LogsPage />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/threats" 
          element={
            isAuthenticated ? (
              <Layout user={user} onLogout={handleLogout}>
                <ThreatsPage />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/users" 
          element={
            isAuthenticated ? (
              <Layout user={user} onLogout={handleLogout}>
                <UsersPage />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/settings" 
          element={
            isAuthenticated ? (
              <Layout user={user} onLogout={handleLogout}>
                <SettingsPage />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/ai-insights" 
          element={
            isAuthenticated ? (
              <Layout user={user} onLogout={handleLogout}>
                <AiInsightsPage />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/analytics" 
          element={
            isAuthenticated ? (
              <Layout user={user} onLogout={handleLogout}>
                <AnalyticsPage />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/backup" 
          element={
            isAuthenticated ? (
              <Layout user={user} onLogout={handleLogout}>
                <BackupPage />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/change-password" 
          element={
            isAuthenticated ? (
              <Layout user={user} onLogout={handleLogout}>
                <ChangePasswordPage />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/security" 
          element={
            isAuthenticated ? (
              <Layout user={user} onLogout={handleLogout}>
                <SecurityPage />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/security-lab" 
          element={
            isAuthenticated ? (
              <Layout user={user} onLogout={handleLogout}>
                <SecurityLabPage />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
