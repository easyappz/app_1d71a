import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUser } from '../../api/users';
import { getUserPosts } from '../../api/posts';
import { subscribe, unsubscribe, getSubscribers, getSubscriptions } from '../../api/subscriptions';
import ProfileHeader from './ProfileHeader';
import SubscriptionsList from './SubscriptionsList';
import PostCard from '../Feed/PostCard';
import './ProfilePage.css';

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [subscriptionsCount, setSubscriptionsCount] = useState(0);
  const [showSubscribersModal, setShowSubscribersModal] = useState(false);
  const [showSubscriptionsModal, setShowSubscriptionsModal] = useState(false);
  const [postsPage, setPostsPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(false);

  const userId = id || currentUser?.id;
  const isOwnProfile = currentUser?.id === parseInt(userId);

  useEffect(() => {
    if (userId) {
      loadUserData();
      loadUserPosts();
      loadSubscriptionsData();
    }
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userData = await getUser(userId);
      setUser(userData);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить профиль пользователя');
      console.error('Error loading user:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPosts = async (page = 1) => {
    try {
      setPostsLoading(true);
      const data = await getUserPosts(userId, { page, page_size: 10 });
      if (page === 1) {
        setPosts(data.results);
      } else {
        setPosts(prev => [...prev, ...data.results]);
      }
      setHasMorePosts(!!data.next);
    } catch (err) {
      console.error('Error loading posts:', err);
    } finally {
      setPostsLoading(false);
    }
  };

  const loadSubscriptionsData = async () => {
    try {
      const [subscribersData, subscriptionsData] = await Promise.all([
        getSubscribers(userId, { page_size: 1 }),
        getSubscriptions(userId, { page_size: 1 })
      ]);
      setSubscribersCount(subscribersData.count);
      setSubscriptionsCount(subscriptionsData.count);
      
      if (!isOwnProfile && currentUser) {
        const isUserSubscribed = subscribersData.results.some(
          sub => sub.id === currentUser.id
        );
        setIsSubscribed(isUserSubscribed);
      }
    } catch (err) {
      console.error('Error loading subscriptions data:', err);
    }
  };

  const handleSubscribe = async () => {
    try {
      if (isSubscribed) {
        await unsubscribe(userId);
        setIsSubscribed(false);
        setSubscribersCount(prev => prev - 1);
      } else {
        await subscribe(userId);
        setIsSubscribed(true);
        setSubscribersCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error toggling subscription:', err);
      alert('Ошибка при изменении подписки');
    }
  };

  const handleLoadMorePosts = () => {
    const nextPage = postsPage + 1;
    setPostsPage(nextPage);
    loadUserPosts(nextPage);
  };

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  };

  const handlePostLiked = (postId, isLiked, newLikesCount) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, is_liked: isLiked, likes_count: newLikesCount }
        : post
    ));
  };

  if (loading) {
    return (
      <div className="profile-loading" data-easytag="id1-react/src/components/Profile/ProfilePage.jsx">
        <div className="loading-spinner">Загрузка профиля...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="profile-error" data-easytag="id2-react/src/components/Profile/ProfilePage.jsx">
        <h2>{error || 'Пользователь не найден'}</h2>
        <button onClick={() => navigate('/')} className="btn-primary">На главную</button>
      </div>
    );
  }

  return (
    <div className="profile-page" data-easytag="id3-react/src/components/Profile/ProfilePage.jsx">
      <ProfileHeader
        user={user}
        isOwnProfile={isOwnProfile}
        isSubscribed={isSubscribed}
        subscribersCount={subscribersCount}
        subscriptionsCount={subscriptionsCount}
        onSubscribe={handleSubscribe}
        onShowSubscribers={() => setShowSubscribersModal(true)}
        onShowSubscriptions={() => setShowSubscriptionsModal(true)}
        onEditProfile={() => navigate('/settings')}
      />

      <div className="profile-content">
        <h2 className="posts-title">Посты пользователя</h2>
        
        {postsLoading && posts.length === 0 ? (
          <div className="posts-loading">Загрузка постов...</div>
        ) : posts.length === 0 ? (
          <div className="no-posts">
            <p>Пока нет постов</p>
          </div>
        ) : (
          <>
            <div className="profile-posts">
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onDeleted={handlePostDeleted}
                  onLiked={handlePostLiked}
                />
              ))}
            </div>
            {hasMorePosts && (
              <button
                className="load-more-btn"
                onClick={handleLoadMorePosts}
                disabled={postsLoading}
              >
                {postsLoading ? 'Загрузка...' : 'Загрузить еще'}
              </button>
            )}
          </>
        )}
      </div>

      {showSubscribersModal && (
        <SubscriptionsList
          userId={userId}
          type="subscribers"
          onClose={() => setShowSubscribersModal(false)}
        />
      )}

      {showSubscriptionsModal && (
        <SubscriptionsList
          userId={userId}
          type="subscriptions"
          onClose={() => setShowSubscriptionsModal(false)}
        />
      )}
    </div>
  );
};

export default ProfilePage;
