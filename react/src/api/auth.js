import instance from './axiosInterceptor';

/**
 * Register a new user
 * @param {Object} data - Registration data
 * @param {string} data.username - Username (3-150 characters)
 * @param {string} data.email - Email address
 * @param {string} data.password - Password (min 8 characters)
 * @param {string} data.first_name - First name (max 150 characters)
 * @param {string} data.last_name - Last name (max 150 characters)
 * @returns {Promise} User data
 */
export const register = async (data) => {
  const response = await instance.post('/api/auth/register', data);
  return response.data;
};

/**
 * Login user
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.username - Username
 * @param {string} credentials.password - Password
 * @returns {Promise} User data
 */
export const login = async (credentials) => {
  const response = await instance.post('/api/auth/login', credentials);
  if (response.data.token) {
    localStorage.setItem('authToken', response.data.token);
  }
  return response.data;
};

/**
 * Logout user
 * @returns {Promise} Logout message
 */
export const logout = async () => {
  const response = await instance.post('/api/auth/logout');
  localStorage.removeItem('authToken');
  return response.data;
};

/**
 * Get current authenticated user
 * @returns {Promise} Current user data
 */
export const getMe = async () => {
  const response = await instance.get('/api/auth/me');
  return response.data;
};
