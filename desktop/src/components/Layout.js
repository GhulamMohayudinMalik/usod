import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
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
