import instance from './axiosInterceptor';

/**
 * Get comments for a post
 * @param {number} postId - Post ID
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.page_size - Page size (default: 20)
 * @returns {Promise} Paginated list of comments
 */
export const getComments = async (postId, params = {}) => {
  const response = await instance.get(`/api/posts/${postId}/comments`, { params });
  return response.data;
};

/**
 * Create a comment on a post
 * @param {number} postId - Post ID
 * @param {Object} data - Comment data
 * @param {string} data.content - Comment content (min 1 character)
 * @returns {Promise} Created comment data
 */
export const createComment = async (postId, data) => {
  const response = await instance.post(`/api/posts/${postId}/comments`, data);
  return response.data;
};

/**
 * Delete a comment
 * @param {number} commentId - Comment ID
 * @returns {Promise} void
 */
export const deleteComment = async (commentId) => {
  const response = await instance.delete(`/api/comments/${commentId}`);
  return response.data;
};
