import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8888', // Замените на ваш базовый URL
});

// Добавляем перехватчик для добавления токена в заголовки запросов
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;