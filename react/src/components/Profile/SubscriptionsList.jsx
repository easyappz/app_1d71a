import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubscribers, getSubscriptions } from '../../api/subscriptions';
import './SubscriptionsList.css';

const SubscriptionsList = ({ userId, type, onClose }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const title = type === 'subscribers' ? 'Подписчики' : 'Подписки';

  useEffect(() => {
    loadUsers();
  }, [userId, type, page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const fetchFunction = type === 'subscribers' ? getSubscribers : getSubscriptions;
      const data = await fetchFunction(userId, { page, page_size: 20 });
      
      if (page === 1) {
        setUsers(data.results);
      } else {
        setUsers(prev => [...prev, ...data.results]);
      }
      
      setHasMore(!!data.next);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userId) => {
    onClose();
    navigate(`/profile/${userId}`);
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const getInitials = (user) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  const getFullName = (user) => {
    const parts = [];
    if (user.first_name) parts.push(user.first_name);
    if (user.last_name) parts.push(user.last_name);
    return parts.length > 0 ? parts.join(' ') : user.username;
  };

  return (
    <div className="subscriptions-modal-overlay" onClick={onClose} data-easytag="id1-react/src/components/Profile/SubscriptionsList.jsx">
      <div className="subscriptions-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-content">
          {loading && users.length === 0 ? (
            <div className="loading-state">Загрузка...</div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <p>Пока никого нет</p>
            </div>
          ) : (
            <>
              <div className="users-list">
                {users.map(user => (
                  <div
                    key={user.id}
                    className="user-item"
                    onClick={() => handleUserClick(user.id)}
                  >
                    <div className="user-avatar">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.username} />
                      ) : (
                        <div className="avatar-placeholder">{getInitials(user)}</div>
                      )}
                      {user.is_online && <div className="online-badge"></div>}
                    </div>
                    <div className="user-info">
                      <div className="user-name">{getFullName(user)}</div>
                      <div className="user-username">@{user.username}</div>
                      {user.bio && <div className="user-bio">{user.bio}</div>}
                    </div>
                  </div>
                ))}
              </div>
              
              {hasMore && (
                <button
                  className="load-more-button"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? 'Загрузка...' : 'Загрузить еще'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsList;
