import React from 'react';

const Header = ({ user, onLogout }) => {
  const getUserInitials = (username) => {
    if (!username) return 'U';
    return username.charAt(0).toUpperCase();
  };

  const getUserRole = (username) => {
    if (username === 'admin') return 'Administrator';
    if (username === 'GhulamMohayudin') return 'Security Admin';
    if (username === 'Ali' || username === 'AliSami') return 'Security Analyst';
    if (username === 'Zuhaib' || username === 'ZuhaibIqbal') return 'Security Analyst';
    return 'User';
  };

  return (
    <div className="header">
      <div className="header-left">
        <h1 className="header-title">Security Operations Dashboard</h1>
      </div>
      
      <div className="header-right">
        <div className="user-info">
          <div className="user-avatar">
            {getUserInitials(user?.username)}
          </div>
          <div className="user-details">
            <div className="user-name">{user?.username || 'User'}</div>
            <div className="user-role">{getUserRole(user?.username)}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Header;
