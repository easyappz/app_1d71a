import React, { useState, useEffect } from 'react';
import { getPosts } from '../../api/posts';
import CreatePost from './CreatePost';
import PostCard from './PostCard';
import './FeedPage.css';

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPosts = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPosts({ page: pageNum, page_size: 10 });
      
      if (append) {
        setPosts(prev => [...prev, ...data.results]);
      } else {
        setPosts(data.results);
      }
      
      setHasMore(!!data.next);
    } catch (err) {
      setError('Не удалось загрузить посты');
      console.error('Error loading posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(1, false);
  }, []);

  const handleScroll = () => {
    if (loading || !hasMore) return;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    
    if (scrollTop + clientHeight >= scrollHeight - 200) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadPosts(nextPage, true);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore, page]);

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts(prev => prev.map(post => 
      post.id === updatedPost.id ? { ...post, ...updatedPost } : post
    ));
  };

  return (
    <div className="feed-page" data-easytag="id1-react/src/components/Feed/FeedPage.jsx">
      <div className="feed-container">
        <CreatePost onPostCreated={handlePostCreated} />
        
        {error && (
          <div className="feed-error">
            {error}
          </div>
        )}
        
        <div className="posts-list">
          {posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              onPostDeleted={handlePostDeleted}
              onPostUpdated={handlePostUpdated}
            />
          ))}
        </div>
        
        {loading && (
          <div className="feed-loading">
            <div className="loading-spinner"></div>
            <p>Загрузка...</p>
          </div>
        )}
        
        {!loading && !hasMore && posts.length > 0 && (
          <div className="feed-end">
            Вы просмотрели все посты
          </div>
        )}
        
        {!loading && posts.length === 0 && (
          <div className="feed-empty">
            <p>Пока нет постов</p>
            <p>Создайте первый пост!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedPage;
