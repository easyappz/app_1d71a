import React from 'react';
import './MessageBubble.css';

const MessageBubble = ({ message, isOwn }) => {
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`message-bubble ${isOwn ? 'own' : 'other'}`} data-easytag="id1-react/src/components/Messages/MessageBubble.jsx">
      <div className="message-content">
        <div className="message-text">{message.content}</div>
        <div className="message-time">{formatTime(message.created_at)}</div>
      </div>
    </div>
  );
};

export default MessageBubble;
