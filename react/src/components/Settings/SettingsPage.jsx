import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { updateUser } from '../../api/users';
import { changePassword } from '../../api/auth';
import './SettingsPage.css';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, updateUser: updateAuthUser } = useAuth();
  
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    avatar: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (profileData.first_name.length > 150) {
      setMessage({ type: 'error', text: 'Имя не должно превышать 150 символов' });
      return;
    }

    if (profileData.last_name.length > 150) {
      setMessage({ type: 'error', text: 'Фамилия не должна превышать 150 символов' });
      return;
    }

    try {
      setLoading(true);
      const updatedUser = await updateUser(user.id, profileData);
      updateAuthUser(updatedUser);
      setMessage({ type: 'success', text: 'Профиль успешно обновлен!' });
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Ошибка при обновлении профиля';
      setMessage({ type: 'error', text: errorMessage });
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (!passwordData.old_password || !passwordData.new_password || !passwordData.confirm_password) {
      setPasswordMessage({ type: 'error', text: 'Заполните все поля' });
      return;
    }

    if (passwordData.new_password.length < 8) {
      setPasswordMessage({ type: 'error', text: 'Новый пароль должен содержать минимум 8 символов' });
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordMessage({ type: 'error', text: 'Пароли не совпадают' });
      return;
    }

    try {
      setPasswordLoading(true);
      await changePassword({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password
      });
      setPasswordMessage({ type: 'success', text: 'Пароль успешно изменен!' });
      setPasswordData({
        old_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Ошибка при смене пароля';
      setPasswordMessage({ type: 'error', text: errorMessage });
      console.error('Error changing password:', err);
    } finally {
      setPasswordLoading(false);
    }
  };

  const getInitials = () => {
    if (profileData.first_name && profileData.last_name) {
      return `${profileData.first_name[0]}${profileData.last_name[0]}`.toUpperCase();
    }
    return user?.username.substring(0, 2).toUpperCase() || 'US';
  };

  return (
    <div className="settings-page" data-easytag="id1-react/src/components/Settings/SettingsPage.jsx">
      <div className="settings-header">
        <button className="back-button" onClick={() => navigate(`/profile/${user?.id}`)}>
          ← Назад к профилю
        </button>
        <h1>Настройки профиля</h1>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <div className="section-header">
            <h2>Личная информация</h2>
            <p>Обновите вашу личную информацию</p>
          </div>

          <div className="avatar-preview">
            <div className="preview-avatar">
              {profileData.avatar ? (
                <img src={profileData.avatar} alt="Avatar" />
              ) : (
                <div className="avatar-placeholder">{getInitials()}</div>
              )}
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="settings-form">
            <div className="form-group">
              <label htmlFor="first_name">Имя</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={profileData.first_name}
                onChange={handleProfileChange}
                maxLength={150}
                placeholder="Введите ваше имя"
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name">Фамилия</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={profileData.last_name}
                onChange={handleProfileChange}
                maxLength={150}
                placeholder="Введите вашу фамилию"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">О себе</label>
              <textarea
                id="bio"
                name="bio"
                value={profileData.bio}
                onChange={handleProfileChange}
                rows={4}
                placeholder="Расскажите о себе"
              />
            </div>

            <div className="form-group">
              <label htmlFor="avatar">URL аватара</label>
              <input
                type="text"
                id="avatar"
                name="avatar"
                value={profileData.avatar}
                onChange={handleProfileChange}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            {message.text && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}

            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </form>
        </div>

        <div className="settings-section">
          <div className="section-header">
            <h2>Смена пароля</h2>
            <p>Обновите ваш пароль для безопасности</p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="settings-form">
            <div className="form-group">
              <label htmlFor="old_password">Текущий пароль</label>
              <input
                type="password"
                id="old_password"
                name="old_password"
                value={passwordData.old_password}
                onChange={handlePasswordChange}
                placeholder="Введите текущий пароль"
              />
            </div>

            <div className="form-group">
              <label htmlFor="new_password">Новый пароль</label>
              <input
                type="password"
                id="new_password"
                name="new_password"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                placeholder="Введите новый пароль (минимум 8 символов)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm_password">Подтвердите новый пароль</label>
              <input
                type="password"
                id="confirm_password"
                name="confirm_password"
                value={passwordData.confirm_password}
                onChange={handlePasswordChange}
                placeholder="Повторите новый пароль"
              />
            </div>

            {passwordMessage.text && (
              <div className={`message ${passwordMessage.type}`}>
                {passwordMessage.text}
              </div>
            )}

            <button type="submit" className="btn-save" disabled={passwordLoading}>
              {passwordLoading ? 'Изменение...' : 'Изменить пароль'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
