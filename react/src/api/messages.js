import instance from './axiosInterceptor';

/**
 * Get list of dialogs
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.page_size - Page size (default: 20)
 * @returns {Promise} Paginated list of dialogs
 */
export const getDialogs = async (params = {}) => {
  const response = await instance.get('/api/dialogs', { params });
  return response.data;
};

/**
 * Get messages from a dialog
 * @param {number} userId - ID of the other user in the dialog
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.page_size - Page size (default: 50)
 * @returns {Promise} Paginated list of messages
 */
export const getMessages = async (userId, params = {}) => {
  const response = await instance.get(`/api/dialogs/${userId}`, { params });
  return response.data;
};

/**
 * Send a message to a user
 * @param {number} userId - ID of the user to send message to
 * @param {Object} data - Message data
 * @param {string} data.content - Message content (1-5000 characters)
 * @returns {Promise} Sent message data
 */
export const sendMessage = async (userId, data) => {
  const response = await instance.post(`/api/dialogs/${userId}`, data);
  return response.data;
};

/**
 * Delete a message
 * @param {number} messageId - Message ID
 * @returns {Promise} void
 */
export const deleteMessage = async (messageId) => {
  const response = await instance.delete(`/api/messages/${messageId}`);
  return response.data;
};
