import instance from './axiosInterceptor';

/**
 * Like a post
 * @param {number} postId - Post ID
 * @returns {Promise} Like confirmation with likes count
 */
export const likePost = async (postId) => {
  const response = await instance.post(`/api/posts/${postId}/like`);
  return response.data;
};

/**
 * Unlike a post
 * @param {number} postId - Post ID
 * @returns {Promise} Unlike confirmation with likes count
 */
export const unlikePost = async (postId) => {
  const response = await instance.delete(`/api/posts/${postId}/like`);
  return response.data;
};
