import instance from './axiosInterceptor';

/**
 * Get posts feed
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.page_size - Page size (default: 20)
 * @returns {Promise} Paginated list of posts
 */
export const getPosts = async (params = {}) => {
  const response = await instance.get('/api/posts', { params });
  return response.data;
};

/**
 * Get post by ID
 * @param {number} id - Post ID
 * @returns {Promise} Post data
 */
export const getPost = async (id) => {
  const response = await instance.get(`/api/posts/${id}`);
  return response.data;
};

/**
 * Create a new post
 * @param {Object} data - Post data
 * @param {string} data.content - Post content (min 1 character)
 * @param {string} data.image - Image URL (optional)
 * @returns {Promise} Created post data
 */
export const createPost = async (data) => {
  const response = await instance.post('/api/posts', data);
  return response.data;
};

/**
 * Delete post by ID
 * @param {number} id - Post ID
 * @returns {Promise} void
 */
export const deletePost = async (id) => {
  const response = await instance.delete(`/api/posts/${id}`);
  return response.data;
};

/**
 * Get user posts
 * @param {number} userId - User ID
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.page_size - Page size (default: 20)
 * @returns {Promise} Paginated list of user posts
 */
export const getUserPosts = async (userId, params = {}) => {
  const response = await instance.get(`/api/users/${userId}/posts`, { params });
  return response.data;
};
