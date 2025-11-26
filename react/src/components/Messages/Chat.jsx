import React, { useState, useEffect, useRef } from 'react';
import { getMessages, sendMessage } from '../../api/messages';
import { getUser } from '../../api/users';
import MessageBubble from './MessageBubble';
import { useAuth } from '../../contexts/AuthContext';
import './Chat.css';

const Chat = ({ userId, onBack }) => {
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const previousScrollHeightRef = useRef(0);

  useEffect(() => {
    loadUserAndMessages();
  }, [userId]);

  useEffect(() => {
    if (messages.length > 0 && page === 1) {
      scrollToBottom();
    }
  }, [messages, page]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadUserAndMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const [userData, messagesData] = await Promise.all([
        getUser(userId),
        getMessages(userId, { page: 1, page_size: 50 })
      ]);
      setOtherUser(userData);
      setMessages(messagesData.results || []);
      setHasMore(!!messagesData.next);
      setPage(1);
    } catch (err) {
      console.error('Error loading chat:', err);
      setError('Ошибка загрузки чата');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!hasMore) return;

    try {
      const container = messagesContainerRef.current;
      previousScrollHeightRef.current = container.scrollHeight;

      const nextPage = page + 1;
      const messagesData = await getMessages(userId, { page: nextPage, page_size: 50 });
      setMessages(prev => [...(messagesData.results || []), ...prev]);
      setHasMore(!!messagesData.next);
      setPage(nextPage);

      setTimeout(() => {
        if (container) {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - previousScrollHeightRef.current;
        }
      }, 0);
    } catch (err) {
      console.error('Error loading more messages:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || sending) return;

    try {
      setSending(true);
      const newMessage = await sendMessage(userId, { content: messageText.trim() });
      setMessages(prev => [...prev, newMessage]);
      setMessageText('');
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Ошибка отправки сообщения');
    } finally {
      setSending(false);
    }
  };

  const getInitials = (user) => {
    if (!user) return '?';
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user.first_name) {
      return user.first_name[0].toUpperCase();
    }
    return user.username[0].toUpperCase();
  };

  const getDisplayName = (user) => {
    if (!user) return '';
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.first_name) {
      return user.first_name;
    }
    return user.username;
  };

  const getStatus = (user) => {
    if (!user) return '';
    if (user.is_online) return 'В сети';
    if (user.last_seen) {
      const date = new Date(user.last_seen);
      return `Был(а) ${date.toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`;
    }
    return 'Не в сети';
  };

  if (loading) {
    return (
      <div className="chat" data-easytag="id1-react/src/components/Messages/Chat.jsx">
        <div className="chat-messages-loading">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat" data-easytag="id1-react/src/components/Messages/Chat.jsx">
        <div className="chat-messages-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="chat" data-easytag="id1-react/src/components/Messages/Chat.jsx">
      <div className="chat-header">
        {onBack && (
          <button className="chat-back-button" onClick={onBack}>
            ←
          </button>
        )}
        <div className="chat-header-avatar">
          {getInitials(otherUser)}
        </div>
        <div className="chat-header-info">
          <div className="chat-header-name">{getDisplayName(otherUser)}</div>
          <div className="chat-header-status">{getStatus(otherUser)}</div>
        </div>
      </div>
      <div className="chat-messages" ref={messagesContainerRef}>
        {hasMore && (
          <button className="load-more-button" onClick={loadMoreMessages}>
            Загрузить предыдущие сообщения
          </button>
        )}
        {messages.length === 0 ? (
          <div className="chat-messages-empty">Нет сообщений</div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.sender === currentUser?.id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-form">
        <form onSubmit={handleSendMessage}>
          <div className="chat-input-wrapper">
            <input
              type="text"
              className="chat-input"
              placeholder="Введите сообщение..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              disabled={sending}
              maxLength={5000}
            />
            <button
              type="submit"
              className="chat-send-button"
              disabled={!messageText.trim() || sending}
            >
              {sending ? 'Отправка...' : 'Отправить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;
