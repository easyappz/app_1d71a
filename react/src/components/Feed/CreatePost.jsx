import React, { useState } from 'react';
import { createPost } from '../../api/posts';
import './CreatePost.css';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Пожалуйста, введите текст поста');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const postData = {
        content: content.trim(),
        image: image.trim() || null
      };
      
      const newPost = await createPost(postData);
      
      setContent('');
      setImage('');
      
      if (onPostCreated) {
        onPostCreated(newPost);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Не удалось создать пост');
      console.error('Error creating post:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post" data-easytag="id1-react/src/components/Feed/CreatePost.jsx">
      <form onSubmit={handleSubmit} className="create-post-form">
        <div className="create-post-header">
          <h2>Создать пост</h2>
        </div>
        
        <div className="create-post-body">
          <textarea
            className="create-post-textarea"
            placeholder="Что у вас нового?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
            rows={4}
          />
          
          <input
            type="text"
            className="create-post-image-input"
            placeholder="URL изображения (необязательно)"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            disabled={loading}
          />
          
          {error && (
            <div className="create-post-error">
              {error}
            </div>
          )}
        </div>
        
        <div className="create-post-footer">
          <button 
            type="submit" 
            className="create-post-button"
            disabled={loading || !content.trim()}
          >
            {loading ? (
              <>
                <span className="button-spinner"></span>
                Публикация...
              </>
            ) : (
              'Опубликовать'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
