import React, { useState, useEffect } from 'react';
import { getComments, createComment, deleteComment } from '../../api/comments';
import { useAuth } from '../../contexts/AuthContext';
import './CommentSection.css';

const CommentSection = ({ postId, onCommentAdded, onCommentDeleted }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const loadComments = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComments(postId, { page: pageNum, page_size: 10 });
      
      if (append) {
        setComments(prev => [...prev, ...data.results]);
      } else {
        setComments(data.results);
      }
      
      setHasMore(!!data.next);
    } catch (err) {
      setError('Не удалось загрузить комментарии');
      console.error('Error loading comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments(1, false);
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      return;
    }
    
    try {
      setSubmitLoading(true);
      setError(null);
      
      const comment = await createComment(postId, { content: newComment.trim() });
      
      setComments(prev => [comment, ...prev]);
      setNewComment('');
      
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Не удалось добавить комментарий');
      console.error('Error creating comment:', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Удалить комментарий?')) {
      return;
    }
    
    try {
      await deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      
      if (onCommentDeleted) {
        onCommentDeleted();
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Не удалось удалить комментарий');
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadComments(nextPage, true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин`;
    if (diffHours < 24) return `${diffHours} ч`;
    
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="comment-section" data-easytag="id1-react/src/components/Feed/CommentSection.jsx">
      <form onSubmit={handleSubmit} className="comment-form">
        <div className="comment-input-wrapper">
          <input
            type="text"
            className="comment-input"
            placeholder="Написать комментарий..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={submitLoading}
          />
          <button 
            type="submit" 
            className="comment-submit-button"
            disabled={submitLoading || !newComment.trim()}
          >
            {submitLoading ? '...' : '→'}
          </button>
        </div>
        
        {error && (
          <div className="comment-error">
            {error}
          </div>
        )}
      </form>
      
      <div className="comments-list">
        {comments.map(comment => {
          const isOwnComment = user && comment.author && user.id === comment.author.id;
          
          return (
            <div key={comment.id} className="comment-item">
              <div className="comment-avatar">
                {comment.author?.avatar ? (
                  <img src={comment.author.avatar} alt={comment.author.username} />
                ) : (
                  <div className="comment-avatar-placeholder">
                    {comment.author?.first_name?.[0] || comment.author?.username?.[0] || '?'}
                  </div>
                )}
              </div>
              
              <div className="comment-content-wrapper">
                <div className="comment-bubble">
                  <div className="comment-author">
                    {comment.author?.first_name && comment.author?.last_name 
                      ? `${comment.author.first_name} ${comment.author.last_name}`
                      : comment.author?.username || 'Аноним'}
                  </div>
                  <div className="comment-text">
                    {comment.content}
                  </div>
                </div>
                
                <div className="comment-meta">
                  <span className="comment-time">{formatDate(comment.created_at)}</span>
                  {isOwnComment && (
                    <button 
                      className="comment-delete"
                      onClick={() => handleDelete(comment.id)}
                    >
                      Удалить
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {loading && (
          <div className="comments-loading">
            <div className="loading-spinner-small"></div>
            Загрузка...
          </div>
        )}
        
        {hasMore && !loading && (
          <button className="load-more-comments" onClick={handleLoadMore}>
            Показать еще комментарии
          </button>
        )}
        
        {!loading && comments.length === 0 && (
          <div className="comments-empty">
            Пока нет комментариев. Будьте первым!
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
