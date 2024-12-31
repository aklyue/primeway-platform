import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.primeway.io', 
});

// Interceptor to inject the token for every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
