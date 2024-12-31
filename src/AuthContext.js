// AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import api from './api.js'; // Ваш настроенный экземпляр axios

export const AuthContext = createContext();

// AuthProvider component to manage login state
const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  // Function to fetch user data
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const response = await api.get('/auth/me');
        console.log("fetchUserData response", response)
        setUser(response.data);
        setAuthToken(token);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setAuthToken(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Ошибка при получении данных пользователя:', error);
      // Если ошибка (например, токен недействителен), очищаем данные
      localStorage.removeItem('auth_token');
      setUser(null);
      setAuthToken(null);
      setIsLoggedIn(false);
    }
  };

  // Проверяем, авторизован ли пользователь при загрузке приложения
  useEffect(() => {
    fetchUserData();
  }, []);

  // Функция для входа пользователя (устанавливает токен и данные пользователя)
const login = (token, userData) => {
  setAuthToken(token);
  setUser(userData);
  setIsLoggedIn(true);
  localStorage.setItem('auth_token', token);
};

  // Функция для выхода пользователя (удаляет токен)
  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setAuthToken(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, authToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;