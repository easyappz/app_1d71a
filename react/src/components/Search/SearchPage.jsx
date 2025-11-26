import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchUsers } from '../../api/users';
import { subscribe, unsubscribe } from '../../api/subscriptions';
import './SearchPage.css';

const SearchPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subscribing, setSubscribing] = useState({});
  const [searchPerformed, setSearchPerformed] = useState(false);

  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      setSearchPerformed(false);
      return;
    }

    const timer = setTimeout(() => {
      performSearch();
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setSearchPerformed(true);
      const data = await searchUsers({ q: query.trim(), page: 1, page_size: 50 });
      setResults(data.results || []);
    } catch (err) {
      console.error('Search error:', err);
      setError('Ошибка поиска');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (userId, isSubscribed) => {
    try {
      setSubscribing(prev => ({ ...prev, [userId]: true }));
      if (isSubscribed) {
        await unsubscribe(userId);
      } else {
        await subscribe(userId);
      }
      setResults(prev =>
        prev.map(user =>
          user.id === userId ? { ...user, is_subscribed: !isSubscribed } : user
        )
      );
    } catch (err) {
      console.error('Subscribe error:', err);
      alert('Ошибка при подписке');
    } finally {
      setSubscribing(prev => ({ ...prev, [userId]: false }));
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

  return (
    <div className="search-page" data-easytag="id1-react/src/components/Search/SearchPage.jsx">
      <div className="search-container">
        <div className="search-header">
          <h1>Поиск пользователей</h1>
          <div className="search-input-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Введите имя пользователя..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        {loading && <div className="search-loading">Поиск...</div>}

        {error && <div className="search-error">{error}</div>}

        {!loading && !error && searchPerformed && (
          <div className="search-results">
            {results.length === 0 ? (
              <div className="search-empty">Пользователи не найдены</div>
            ) : (
              <>
                <div className="search-results-header">
                  Найдено: {results.length}
                </div>
                {results.map((user) => (
                  <div key={user.id} className="search-user-item">
                    <div className="search-user-avatar">
                      {getInitials(user)}
                      {user.is_online && (
                        <div className="search-online-indicator"></div>
                      )}
                    </div>
                    <div className="search-user-info">
                      <div className="search-user-name">
                        {getDisplayName(user)}
                      </div>
                      <div className="search-user-username">@{user.username}</div>
                      {user.bio && (
                        <div className="search-user-bio">{user.bio}</div>
                      )}
                    </div>
                    <div className="search-user-actions">
                      <button
                        className={`search-subscribe-button ${user.is_subscribed ? 'subscribed' : ''}`}
                        onClick={() => handleSubscribe(user.id, user.is_subscribed)}
                        disabled={subscribing[user.id]}
                      >
                        {subscribing[user.id]
                          ? 'Загрузка...'
                          : user.is_subscribed
                          ? 'Отписаться'
                          : 'Подписаться'}
                      </button>
                      <button
                        className="search-message-button"
                        onClick={() => handleMessage(user.id)}
                      >
                        Сообщение
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
