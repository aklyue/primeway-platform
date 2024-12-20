import React, { useState, useContext } from 'react';
import axios from '../axios'; // Используйте ваш настроенный экземпляр axios
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { TextField, Button, Typography, Box } from '@mui/material';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState(''); // Состояние для обработки ошибок

  // Переменная для переключения между бэкендом и моковыми данными
  const useMockData = true; // Установите в false, чтобы использовать реальные данные с бэкенда

  const handleLogin = async () => {
    try {
      if (useMockData) {
        // Используем моковую функцию для эмуляции запроса
        const response = await mockLogin(username, password);
        const { access_token, user } = response.data;
        await login(access_token, user); // Передаем данные пользователя в функцию login
        navigate('/running-jobs'); // Перенаправляем после успешного входа
      } else {
        // Отправляем реальный запрос к бэкенду
        const response = await axios.post('/login', { username, password });
        const { access_token, user } = response.data;
        await login(access_token, user); // Передаем данные пользователя в функцию login
        navigate('/running-jobs'); // Перенаправляем после успешного входа
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setError(error.response?.data?.message || 'An error occurred during login');
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8 }}>
      <Typography align='center' variant="h4" gutterBottom>
        Login
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <TextField
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        fullWidth
        margin="normal"
        
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" color="secondary" onClick={handleLogin} fullWidth>
        Login
      </Button>
    </Box>
  );
};

export default Login;

// Моковая функция для эмуляции запроса на вход в систему
async function mockLogin(username, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Моковые данные пользователей
      const mockUsers = [
        {
          username: 'user1',
          password: 'password1',
          access_token: 'mock_token_user1',
          user: {
            username: 'user1',
            avatarUrl: 'https://img.freepik.com/premium-vector/avatar-icon0002_750950-43.jpg?semt=ais_hybrid', // Укажите URL аватара, если нужно
          },
        },
        {
          username: 'user2',
          password: 'password2',
          access_token: 'mock_token_user2',
          user: {
            username: 'user2',
            avatarUrl: '', // Укажите URL аватара, если нужно
          },
        },
      ];

      // Проверяем, соответствует ли введённый пользователем логин и пароль моковым данным
      const user = mockUsers.find(
        (u) => u.username === username && u.password === password
      );

      if (user) {
        // Успешный вход
        resolve({ data: { access_token: user.access_token, user: user.user } });
      } else {
        // Эмуляция ошибки неверного логина или пароля
        reject(new Error('Invalid username or password'));
      }
    }, 1000); // Задержка в 1 секунду
  });
}