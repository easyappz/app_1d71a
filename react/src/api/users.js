import instance from './axiosInterceptor';

/**
 * Get list of users
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.page_size - Page size (default: 20)
 * @returns {Promise} Paginated list of users
 */
export const getUsers = async (params = {}) => {
  const response = await instance.get('/api/users', { params });
  return response.data;
};

/**
 * Get user profile by ID
 * @param {number} id - User ID
 * @returns {Promise} User profile data
 */
export const getUser = async (id) => {
  const response = await instance.get(`/api/users/${id}`);
  return response.data;
};

/**
 * Update user profile
 * @param {number} id - User ID
 * @param {Object} data - Update data
 * @param {string} data.first_name - First name (max 150 characters)
 * @param {string} data.last_name - Last name (max 150 characters)
 * @param {string} data.avatar - Avatar URL
 * @param {string} data.bio - Bio text
 * @returns {Promise} Updated user data
 */
export const updateUser = async (id, data) => {
  const response = await instance.patch(`/api/users/${id}`, data);
  return response.data;
};

/**
 * Search users
 * @param {Object} params - Search parameters
 * @param {string} params.q - Search query (min 1 character)
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.page_size - Page size (default: 20)
 * @returns {Promise} Search results
 */
export const searchUsers = async (params) => {
  const response = await instance.get('/api/users/search', { params });
  return response.data;
};
