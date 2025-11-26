import instance from './axiosInterceptor';

/**
 * Subscribe to a user
 * @param {number} userId - User ID to subscribe to
 * @returns {Promise} Subscription confirmation
 */
export const subscribe = async (userId) => {
  const response = await instance.post(`/api/users/${userId}/subscribe`);
  return response.data;
};

/**
 * Unsubscribe from a user
 * @param {number} userId - User ID to unsubscribe from
 * @returns {Promise} Unsubscription confirmation
 */
export const unsubscribe = async (userId) => {
  const response = await instance.delete(`/api/users/${userId}/subscribe`);
  return response.data;
};

/**
 * Get user subscribers
 * @param {number} userId - User ID
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.page_size - Page size (default: 20)
 * @returns {Promise} Paginated list of subscribers
 */
export const getSubscribers = async (userId, params = {}) => {
  const response = await instance.get(`/api/users/${userId}/subscribers`, { params });
  return response.data;
};

/**
 * Get user subscriptions
 * @param {number} userId - User ID
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.page_size - Page size (default: 20)
 * @returns {Promise} Paginated list of subscriptions
 */
export const getSubscriptions = async (userId, params = {}) => {
  const response = await instance.get(`/api/users/${userId}/subscriptions`, { params });
  return response.data;
};
