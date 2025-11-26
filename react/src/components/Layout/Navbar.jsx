import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { logout as logoutApi } from '../../api/auth';
import './Navbar.css';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logoutApi();
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      logout();
      navigate('/login');
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="navbar" data-easytag="id1-react/src/components/Layout/Navbar.jsx">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="brand-logo">
            <span className="brand-icon">🌐</span>
            <span className="brand-text">Social</span>
          </Link>
        </div>

        <div className="navbar-menu">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Главная</span>
          </Link>

          <Link to="/friends" className={`nav-link ${isActive('/friends') ? 'active' : ''}`}>
            <span className="nav-icon">👥</span>
            <span className="nav-text">Друзья</span>
          </Link>

          <Link to="/messages" className={`nav-link ${isActive('/messages') ? 'active' : ''}`}>
            <span className="nav-icon">💬</span>
            <span className="nav-text">Сообщения</span>
          </Link>

          <Link to="/search" className={`nav-link ${isActive('/search') ? 'active' : ''}`}>
            <span className="nav-icon">🔍</span>
            <span className="nav-text">Поиск</span>
          </Link>

          <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
            <span className="nav-icon">👤</span>
            <span className="nav-text">Профиль</span>
          </Link>
        </div>

        <div className="navbar-user">
          <div className="user-info">
            <div className="user-avatar">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="avatar-image" />
              ) : (
                <div className="avatar-placeholder">
                  {user.first_name?.[0] || user.username[0]}
                </div>
              )}
              {user.is_online && <span className="online-badge"></span>}
            </div>
            <div className="user-details">
              <div className="user-name">
                {user.first_name} {user.last_name}
              </div>
              <div className="user-status">
                {user.is_online ? 'В сети' : 'Не в сети'}
              </div>
            </div>
          </div>

          <button onClick={handleLogout} className="logout-button">
            <span className="logout-icon">🚪</span>
            <span className="logout-text">Выход</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
