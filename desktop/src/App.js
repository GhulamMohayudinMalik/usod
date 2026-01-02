import React, { useState, useEffect } from 'react';
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
import NetworkMonitoringPage from './pages/NetworkMonitoringPage';
import PcapAnalyzerPage from './pages/PcapAnalyzerPage';
import BlockchainPage from './pages/BlockchainPage';
import IPTracerPage from './pages/IPTracerPage';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import apiService from './services/api';
import './App.css';

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on app start
  useEffect(() => {
    const checkAuth = async () => {
      if (apiService.isAuthenticated()) {
        try {
          // Validate the token and get user info from backend
          const response = await apiService.getSessionStatus();
          if (response.success) {
            setUser({
              username: response.data.user.username,
              email: response.data.user.email,
              role: response.data.user.role,
              loginTime: new Date().toISOString()
            });
            setIsAuthenticated(true);
          } else {
            // Token is invalid, clear it and redirect to login
            apiService.logout();
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Session validation failed:', error);
          // Clear invalid token and redirect to login
          apiService.logout();
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #000000 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            border: '3px solid #374151',
            borderTop: '3px solid #10b981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p>Loading...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

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
        <Route
          path="/network-monitoring"
          element={
            isAuthenticated ? (
              <Layout user={user} onLogout={handleLogout}>
                <NetworkMonitoringPage />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/pcap-analyzer"
          element={
            isAuthenticated ? (
              <Layout user={user} onLogout={handleLogout}>
                <PcapAnalyzerPage />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/blockchain"
          element={
            isAuthenticated ? (
              <Layout user={user} onLogout={handleLogout}>
                <BlockchainPage />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/ip-tracer"
          element={
            isAuthenticated ? (
              <Layout user={user} onLogout={handleLogout}>
                <IPTracerPage />
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
