import React, { useState } from 'react';
import { likePost, unlikePost } from '../../api/likes';
import { deletePost } from '../../api/posts';
import { useAuth } from '../../contexts/AuthContext';
import CommentSection from './CommentSection';
import './PostCard.css';

const PostCard = ({ post, onPostDeleted, onPostUpdated }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [commentsCount, setCommentsCount] = useState(post.comments_count);
  const [showComments, setShowComments] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} д назад`;
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const handleLike = async () => {
    if (likeLoading) return;
    
    try {
      setLikeLoading(true);
      
      if (isLiked) {
        const response = await unlikePost(post.id);
        setLikesCount(response.likes_count);
        setIsLiked(false);
      } else {
        const response = await likePost(post.id);
        setLikesCount(response.likes_count);
        setIsLiked(true);
      }
      
      if (onPostUpdated) {
        onPostUpdated({ 
          id: post.id, 
          is_liked: !isLiked, 
          likes_count: isLiked ? likesCount - 1 : likesCount + 1 
        });
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить этот пост?')) {
      return;
    }
    
    try {
      setDeleteLoading(true);
      await deletePost(post.id);
      
      if (onPostDeleted) {
        onPostDeleted(post.id);
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Не удалось удалить пост');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCommentAdded = () => {
    setCommentsCount(prev => prev + 1);
    if (onPostUpdated) {
      onPostUpdated({ id: post.id, comments_count: commentsCount + 1 });
    }
  };

  const handleCommentDeleted = () => {
    setCommentsCount(prev => Math.max(0, prev - 1));
    if (onPostUpdated) {
      onPostUpdated({ id: post.id, comments_count: Math.max(0, commentsCount - 1) });
    }
  };

  const isOwnPost = user && post.author && user.id === post.author.id;

  return (
    <div className="post-card" data-easytag="id1-react/src/components/Feed/PostCard.jsx">
      <div className="post-card-header">
        <div className="post-author-info">
          <div className="post-author-avatar">
            {post.author?.avatar ? (
              <img src={post.author.avatar} alt={post.author.username} />
            ) : (
              <div className="post-author-avatar-placeholder">
                {post.author?.first_name?.[0] || post.author?.username?.[0] || '?'}
              </div>
            )}
          </div>
          <div className="post-author-details">
            <div className="post-author-name">
              {post.author?.first_name && post.author?.last_name 
                ? `${post.author.first_name} ${post.author.last_name}`
                : post.author?.username || 'Аноним'}
            </div>
            <div className="post-timestamp">
              {formatDate(post.created_at)}
            </div>
          </div>
        </div>
        
        {isOwnPost && (
          <button 
            className="post-delete-button"
            onClick={handleDelete}
            disabled={deleteLoading}
            title="Удалить пост"
          >
            {deleteLoading ? '...' : '×'}
          </button>
        )}
      </div>
      
      <div className="post-card-content">
        <p>{post.content}</p>
      </div>
      
      {post.image && (
        <div className="post-card-image">
          <img src={post.image} alt="Post" />
        </div>
      )}
      
      <div className="post-card-stats">
        <span>{likesCount} {likesCount === 1 ? 'лайк' : 'лайков'}</span>
        <span>{commentsCount} {commentsCount === 1 ? 'комментарий' : 'комментариев'}</span>
      </div>
      
      <div className="post-card-actions">
        <button 
          className={`post-action-button ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
          disabled={likeLoading}
        >
          <span className="action-icon">{isLiked ? '❤️' : '🤍'}</span>
          <span>Нравится</span>
        </button>
        
        <button 
          className="post-action-button"
          onClick={() => setShowComments(!showComments)}
        >
          <span className="action-icon">💬</span>
          <span>Комментировать</span>
        </button>
      </div>
      
      {showComments && (
        <CommentSection 
          postId={post.id} 
          onCommentAdded={handleCommentAdded}
          onCommentDeleted={handleCommentDeleted}
        />
      )}
    </div>
  );
};

export default PostCard;
