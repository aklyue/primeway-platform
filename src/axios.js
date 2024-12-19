// axios.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8888', 
});

instance.interceptors.request.use(
  function (config) {
    // Добавляем токен в заголовки, если он есть
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    // Обработка ошибки запроса
    return Promise.reject(error);
  }
);

export default instance;