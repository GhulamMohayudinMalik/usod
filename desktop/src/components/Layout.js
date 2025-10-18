import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import apiService from '../services/api';

const Layout = ({ children, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        // Call backend logout endpoint
        await apiService.logout();
        console.log('✅ Logout completed successfully');
      } catch (error) {
        console.error('Logout error:', error);
        // Continue with logout even if backend call fails
      }
      
      // Clear local state and redirect
      onLogout();
      navigate('/login');
    }
  };

  return (
    <div className="layout">
      <Sidebar currentPath={location.pathname} onNavigate={navigate} />
      <div className="main-content">
        <Header user={user} onLogout={handleLogout} />
        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
