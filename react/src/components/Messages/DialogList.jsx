import React, { useState, useEffect } from 'react';
import { getDialogs } from '../../api/messages';
import './DialogList.css';

const DialogList = ({ onSelectDialog, selectedUserId }) => {
  const [dialogs, setDialogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDialogs();
  }, []);

  const loadDialogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDialogs({ page: 1, page_size: 50 });
      setDialogs(data.results || []);
    } catch (err) {
      console.error('Error loading dialogs:', err);
      setError('Ошибка загрузки диалогов');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин`;
    if (hours < 24) return `${hours} ч`;
    if (days < 7) return `${days} д`;
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
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

  if (loading) {
    return (
      <div className="dialog-list" data-easytag="id1-react/src/components/Messages/DialogList.jsx">
        <div className="dialog-list-header">
          <h2>Сообщения</h2>
        </div>
        <div className="dialog-list-loading">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dialog-list" data-easytag="id1-react/src/components/Messages/DialogList.jsx">
        <div className="dialog-list-header">
          <h2>Сообщения</h2>
        </div>
        <div className="dialog-list-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="dialog-list" data-easytag="id1-react/src/components/Messages/DialogList.jsx">
      <div className="dialog-list-header">
        <h2>Сообщения</h2>
      </div>
      <div className="dialog-list-content">
        {dialogs.length === 0 ? (
          <div className="dialog-list-empty">Нет диалогов</div>
        ) : (
          dialogs.map((dialog) => (
            <div
              key={dialog.id}
              className={`dialog-item ${selectedUserId === dialog.participant.id ? 'active' : ''}`}
              onClick={() => onSelectDialog(dialog.participant.id)}
            >
              <div className="dialog-avatar-wrapper">
                <div className="dialog-avatar">
                  {getInitials(dialog.participant)}
                </div>
                {dialog.participant.is_online && (
                  <div className="online-indicator"></div>
                )}
              </div>
              <div className="dialog-info">
                <div className="dialog-header">
                  <div className="dialog-name">
                    {getDisplayName(dialog.participant)}
                  </div>
                  {dialog.last_message && (
                    <div className="dialog-time">
                      {formatTime(dialog.last_message.created_at)}
                    </div>
                  )}
                </div>
                {dialog.last_message && (
                  <div className="dialog-last-message">
                    {dialog.last_message.content}
                  </div>
                )}
              </div>
              {dialog.unread_count > 0 && (
                <div className="unread-badge">{dialog.unread_count}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DialogList;
