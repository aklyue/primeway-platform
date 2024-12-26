// AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from './axios.js'; // Ваш настроенный экземпляр axios

export const AuthContext = createContext();

// AuthProvider component to manage login state
const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Переменная для переключения между бэкендом и моковыми данными
  const useMockData = true; // Установите в false, чтобы использовать реальные данные с бэкенда

  // Function to fetch user data
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('auth_token'); // Используем 'auth_token' вместо 'token'
      if (token) {
        if (useMockData) {
          const userData = await mockFetchUserData(token);
          setUser(userData);
          setIsLoggedIn(true);
        } else {
          // Запрос к бэкенду для получения данных пользователя
          const response = await axios.get('/user/profile', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUser(response.data.user); // Предполагается, что данные пользователя в response.data.user
          setIsLoggedIn(true);
        }
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Ошибка при получении данных пользователя:', error);
      // Если ошибка (например, токен недействителен), очищаем данные
      localStorage.removeItem('auth_token');
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  // Check if the user is logged in by checking the token in localStorage
  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Function to log in the user (set token and user data)
  const login = async (token, userData) => {
    localStorage.setItem('auth_token', token);
    if (useMockData) {
      // Используем моковую функцию для эмуляции логина
      const mockUserData = await mockLogin(token, userData);
      setUser(mockUserData);
      setIsLoggedIn(true);
    } else {
      setUser(userData);
      setIsLoggedIn(true);
    }
  };

  // Function to log out the user (remove token)
  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

// Моковая функция для получения данных пользователя
async function mockFetchUserData(token) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Моковые токены и соответствующие пользователи
      const mockUsers = {
        mock_token_user1: {
          id: '123456',
          username: 'user1',
          email: 'user1@example.com',
          avatarUrl:
            'https://img.freepik.com/premium-vector/avatar-icon0002_750950-43.jpg?semt=ais_hybrid',
        },
        mock_token_user2: {
          id: '654321',
          username: 'user2',
          email: 'user2@example.com',
          avatarUrl: '',
        },
      };

      const user = mockUsers[token];

      if (user) {
        // Возвращаем данные пользователя
        resolve(user);
      } else {
        // Эмулируем ошибку недействительного токена
        reject(new Error('Недействительный токен'));
      }
    }, 500); // Задержка в 0.5 секунды
  });
}

async function mockLogin(token, userData) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(userData);
    }, 500);
  });
}