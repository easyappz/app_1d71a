import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubscribers, getSubscriptions, subscribe, unsubscribe } from '../../api/subscriptions';
import { useAuth } from '../../contexts/AuthContext';
import './FriendsPage.css';

const FriendsPage = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('subscriptions');
  const [subscribers, setSubscribers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'subscribers') {
        const data = await getSubscribers(currentUser.id, { page: 1, page_size: 100 });
        setSubscribers(data.results || []);
      } else {
        const data = await getSubscriptions(currentUser.id, { page: 1, page_size: 100 });
        setSubscriptions(data.results || []);
      }
    } catch (err) {
      console.error('Error loading friends data:', err);
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (userId, isSubscribed) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      if (isSubscribed) {
        await unsubscribe(userId);
      } else {
        await subscribe(userId);
      }
      await loadData();
    } catch (err) {
      console.error('Subscribe error:', err);
      alert('Ошибка при подписке');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleMessage = (userId) => {
    navigate(`/messages/${userId}`);
  };

  const getInitials = (user) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user.first_name) {
      return user.first_name[0].toUpperCase();
    }
    return user.username[0].toUpperCase();
  };

  const getDisplayName = (user) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.first_name) {
      return user.first_name;
    }
    return user.username;
  };

  const renderUserList = (users, showUnsubscribe) => {
    if (loading) {
      return <div className="friends-loading">Загрузка...</div>;
    }

    if (error) {
      return <div className="friends-error">{error}</div>;
    }

    if (users.length === 0) {
      return (
        <div className="friends-empty">
          {activeTab === 'subscribers' ? 'Нет подписчиков' : 'Нет подписок'}
        </div>
      );
    }

    return users.map((user) => (
      <div key={user.id} className="friends-user-item">
        <div className="friends-user-avatar">
          {getInitials(user)}
          {user.is_online && <div className="friends-online-indicator"></div>}
        </div>
        <div className="friends-user-info">
          <div className="friends-user-name">{getDisplayName(user)}</div>
          <div className="friends-user-username">@{user.username}</div>
          {user.bio && <div className="friends-user-bio">{user.bio}</div>}
        </div>
        <div className="friends-user-actions">
          {showUnsubscribe ? (
            <button
              className="friends-unsubscribe-button"
              onClick={() => handleSubscribe(user.id, true)}
              disabled={actionLoading[user.id]}
            >
              {actionLoading[user.id] ? 'Загрузка...' : 'Отписаться'}
            </button>
          ) : (
            <button
              className="friends-subscribe-button"
              onClick={() => handleSubscribe(user.id, false)}
              disabled={actionLoading[user.id]}
            >
              {actionLoading[user.id] ? 'Загрузка...' : 'Подписаться'}
            </button>
          )}
          <button
            className="friends-message-button"
            onClick={() => handleMessage(user.id)}
          >
            Сообщение
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="friends-page" data-easytag="id1-react/src/components/Friends/FriendsPage.jsx">
      <div className="friends-container">
        <div className="friends-header">
          <h1>Друзья</h1>
        </div>
        <div className="friends-tabs">
          <button
            className={`friends-tab ${activeTab === 'subscriptions' ? 'active' : ''}`}
            onClick={() => setActiveTab('subscriptions')}
          >
            Подписки ({subscriptions.length})
          </button>
          <button
            className={`friends-tab ${activeTab === 'subscribers' ? 'active' : ''}`}
            onClick={() => setActiveTab('subscribers')}
          >
            Подписчики ({subscribers.length})
          </button>
        </div>
        <div className="friends-content">
          {activeTab === 'subscriptions'
            ? renderUserList(subscriptions, true)
            : renderUserList(subscribers, false)}
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;
