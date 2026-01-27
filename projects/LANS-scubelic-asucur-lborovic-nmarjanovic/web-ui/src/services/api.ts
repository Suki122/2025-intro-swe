import axios from 'axios';

const API_URL = 'http://localhost:8000'; // Adjust if your backend runs on a different port

const api = axios.create({
  baseURL: API_URL,
});

export const register = (email, password) => {
  return api.post('/register', { email, password });
};

export const login = (email, password) => {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);
  return api.post('/token', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
};

export const getCurrentUser = (token) => {
  return api.get('/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const storeApiKeys = (token, apiKeys) => {
  return api.post('/users/me/api_keys', apiKeys, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export default api;
