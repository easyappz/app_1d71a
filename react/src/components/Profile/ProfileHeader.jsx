import React from 'react';
import './ProfileHeader.css';

const ProfileHeader = ({
  user,
  isOwnProfile,
  isSubscribed,
  subscribersCount,
  subscriptionsCount,
  onSubscribe,
  onShowSubscribers,
  onShowSubscriptions,
  onEditProfile
}) => {
  const getFullName = () => {
    const parts = [];
    if (user.first_name) parts.push(user.first_name);
    if (user.last_name) parts.push(user.last_name);
    return parts.length > 0 ? parts.join(' ') : user.username;
  };

  const getInitials = () => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  return (
    <div className="profile-header" data-easytag="id1-react/src/components/Profile/ProfileHeader.jsx">
      <div className="profile-header-background">
        <div className="gradient-overlay"></div>
      </div>
      
      <div className="profile-header-content">
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            {user.avatar ? (
              <img src={user.avatar} alt={user.username} />
            ) : (
              <div className="avatar-placeholder">{getInitials()}</div>
            )}
            {user.is_online && <div className="online-indicator" title="Онлайн"></div>}
          </div>
        </div>

        <div className="profile-info">
          <div className="profile-name-section">
            <h1 className="profile-name">{getFullName()}</h1>
            <p className="profile-username">@{user.username}</p>
          </div>

          {user.bio && (
            <p className="profile-bio">{user.bio}</p>
          )}

          <div className="profile-stats">
            <button className="stat-item" onClick={onShowSubscribers}>
              <span className="stat-value">{subscribersCount}</span>
              <span className="stat-label">Подписчиков</span>
            </button>
            <button className="stat-item" onClick={onShowSubscriptions}>
              <span className="stat-value">{subscriptionsCount}</span>
              <span className="stat-label">Подписок</span>
            </button>
          </div>

          <div className="profile-actions">
            {isOwnProfile ? (
              <button className="btn-edit-profile" onClick={onEditProfile}>
                <span className="btn-icon">✏️</span>
                Редактировать профиль
              </button>
            ) : (
              <button
                className={`btn-subscribe ${isSubscribed ? 'subscribed' : ''}`}
                onClick={onSubscribe}
              >
                {isSubscribed ? (
                  <>
                    <span className="btn-icon">✓</span>
                    Вы подписаны
                  </>
                ) : (
                  <>
                    <span className="btn-icon">+</span>
                    Подписаться
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
