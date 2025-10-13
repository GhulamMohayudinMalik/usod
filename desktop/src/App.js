import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LogsPage from './pages/LogsPage';
import ThreatsPage from './pages/ThreatsPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/Layout';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated (from localStorage or session)
    const savedUser = localStorage.getItem('usod_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('usod_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('usod_user');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading USOD Desktop...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <LoginPage onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? 
                <Layout user={user} onLogout={handleLogout}>
                  <DashboardPage />
                </Layout> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/logs" 
            element={
              isAuthenticated ? 
                <Layout user={user} onLogout={handleLogout}>
                  <LogsPage />
                </Layout> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/threats" 
            element={
              isAuthenticated ? 
                <Layout user={user} onLogout={handleLogout}>
                  <ThreatsPage />
                </Layout> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/users" 
            element={
              isAuthenticated ? 
                <Layout user={user} onLogout={handleLogout}>
                  <UsersPage />
                </Layout> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/settings" 
            element={
              isAuthenticated ? 
                <Layout user={user} onLogout={handleLogout}>
                  <SettingsPage />
                </Layout> : 
                <Navigate to="/login" replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
