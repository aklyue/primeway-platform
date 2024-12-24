import React, { useState, useContext } from "react";
import axios from "../axios"; // Используйте ваш настроенный экземпляр axios
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import { TextField, Button, Typography, Box, Alert } from "@mui/material";
import YandexAuth from "./YandexAuth"; // Импортируем компонент YandexAuth

const Login = () => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  // Переменная для переключения между бэкендом и моковыми данными
  const useMockData = true; // Установите в false, чтобы использовать реальные данные с бэкенда

  const handleShowEmailForm = () => {
    setShowEmailForm(true);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      if (useMockData) {
        // Используем моковую функцию для эмуляции запроса
        const response = await mockLogin(username, password);
        const { access_token, user } = response.data;

        // Передаем данные пользователя в функцию login
        await login(access_token, user);
        navigate("/running-jobs"); // Перенаправляем после успешного входа
      } else {
        // Отправляем реальный запрос к бэкенду
        const response = await axios.post("/login", { username, password });
        const { access_token, user } = response.data;
        await login(access_token, user); // Передаем данные пользователя в функцию login
        navigate("/running-jobs"); // Перенаправляем после успешного входа
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setError(
        error.response?.data?.message || "An error occurred during login"
      );
    }
  };

  return (
    <Box
      sx={{
        maxWidth: "500px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "70vh",
        textAlign: "center",
      }}
    >
      <Typography align="center" variant="h4" gutterBottom>
        Вход
      </Typography>
      {error && (
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {/* Компонент для входа через Яндекс */}
      <YandexAuth />
      {!showEmailForm ? (
        <>
          <Button
            variant="contained"
            color="primary"
            onClick={handleShowEmailForm}
            fullWidth
            style={{
              width: "450px",
              borderRadius: "20px",
              padding: "10px 13px",
            }}
          >
            Войти по электронной почте
          </Button>
          <Box
            sx={{
              display: "flex",
              gap: "5px",
              mt: "15px",
              justifyContent: "center",
            }}
          >
            <Typography>Нет аккаунта?</Typography>
            <Typography
              component={Link}
              to="/register"
              sx={{
                color: "secondary.main",
                "&:hover": {
                  color: "#1c8a6c",
                },
              }}
            >
              Создать
            </Typography>
          </Box>
        </>
      ) : (
        // Форма входа по электронной почте
        <form onSubmit={handleLogin}>
          <TextField
            label="Имя пользователя или email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <Button
            variant="contained"
            color="secondary"
            type="submit"
            fullWidth
            sx={{ mt: 2 }}
          >
            Войти
          </Button>
          <Box
            sx={{
              display: "flex",
              gap: "5px",
              mt: "15px",
              justifyContent: "center",
            }}
          >
            <Typography>Нет аккаунта?</Typography>
            <Typography
              component={Link}
              to="/register"
              sx={{
                color: "secondary.main",
                "&:hover": {
                  color: "#1c8a6c",
                },
              }}
            >
              Создать
            </Typography>
          </Box>
        </form>
      )}
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
          username: "user1",
          password: "password1",
          access_token: "mock_token_user1",
          user: {
            id: "123456",
            username: "user1",
            email: "user1@example.com",
            avatarUrl:
              "https://img.freepik.com/premium-vector/avatar-icon0002_750950-43.jpg?semt=ais_hybrid",
          },
        },
        {
          username: "user2",
          password: "password2",
          access_token: "mock_token_user2",
          user: {
            id: "654321",
            username: "user2",
            email: "user2@example.com",
            avatarUrl: "",
          },
        },
      ];

      const user = mockUsers.find(
        (u) => u.username === username && u.password === password
      );

      if (user) {
        resolve({ data: { access_token: user.access_token, user: user.user } });
      } else {
        reject(new Error("Неверное имя пользователя или пароль"));
      }
    }, 1000);
  });
}
