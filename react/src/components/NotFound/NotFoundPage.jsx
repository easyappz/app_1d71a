import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFoundPage.css';

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="not-found-page" data-easytag="id1-react/src/components/NotFound/NotFoundPage.jsx">
      <div className="not-found-content">
        <div className="not-found-code">404</div>
        <h1 className="not-found-title">Страница не найдена</h1>
        <p className="not-found-description">
          К сожалению, запрашиваемая страница не существует.
        </p>
        <button className="not-found-button" onClick={handleGoHome}>
          Вернуться на главную
        </button>
      </div>
      <div className="not-found-decoration">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
      </div>
    </div>
  );
};

export default NotFoundPage;
