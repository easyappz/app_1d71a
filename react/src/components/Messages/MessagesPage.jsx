import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DialogList from './DialogList';
import Chat from './Chat';
import './MessagesPage.css';

const MessagesPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (userId) {
      setSelectedUserId(parseInt(userId));
    }
  }, [userId]);

  const handleSelectDialog = (userId) => {
    setSelectedUserId(userId);
    navigate(`/messages/${userId}`);
  };

  const handleBackToList = () => {
    setSelectedUserId(null);
    navigate('/messages');
  };

  const showList = !isMobile || !selectedUserId;
  const showChat = !isMobile || selectedUserId;

  return (
    <div className="messages-page" data-easytag="id1-react/src/components/Messages/MessagesPage.jsx">
      <div className="messages-container">
        {showList && (
          <div className="messages-left">
            <DialogList
              onSelectDialog={handleSelectDialog}
              selectedUserId={selectedUserId}
            />
          </div>
        )}
        {showChat && (
          <div className="messages-right">
            {selectedUserId ? (
              <Chat
                userId={selectedUserId}
                onBack={isMobile ? handleBackToList : null}
              />
            ) : (
              <div className="messages-empty">
                Выберите диалог для начала общения
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
