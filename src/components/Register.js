import React, { useState, useContext } from "react";
import YandexAuth from "./YandexAuth";
import { Box, Button, TextField, Typography, Alert } from "@mui/material";
import axios from "axios";
import { AuthContext } from "../AuthContext";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const useMockData = true; // Установите в false, чтобы использовать реальные данные с бэкенда

  const handleEmailRegisterClick = () => {
    setShowEmailForm(true);
  };

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    try {
      if (useMockData) {
        const { token, user } = await mockEmailRegister(email, password);
        // Сохраняем токен и обновляем состояние аутентификации
        localStorage.setItem("auth_token", token);
        login(token, user);
        navigate("/running-jobs");
      } else {
        const response = await axios.post("/api/register", { email, password });
        console.log("Регистрация успешна:", response.data);
        const { token, user } = response.data;
        localStorage.setItem("auth_token", token);
        login(token, user);
        navigate("/running-jobs");
      }
    } catch (error) {
      console.error("Ошибка при регистрации:", error);
      setError("Не удалось зарегистрироваться. Попробуйте снова.");
    }
  };

  return (
    <Box sx={{
      maxWidth: "500px",
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "70vh",
      textAlign: "center",
    }}>
      <Typography variant="h4" gutterBottom>
        Регистрация
      </Typography>
      <YandexAuth />
      {!showEmailForm ? (
        <Button
          variant="contained"
          color="primary"
          onClick={handleEmailRegisterClick}
          style={{ width: "450px", borderRadius: "20px", padding: "10px 13px" }}
        >
          Зарегистрироваться по электронной почте
        </Button>
      ) : (
        <form onSubmit={handleEmailRegister}>
          {error && (
            <Alert severity="error" onClose={() => setError("")}>
              {error}
            </Alert>
          )}
          <TextField
            label="Электронная почта"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <Box sx={{display:'flex', justifyContent:'center', gap:'15px'}}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              style={{ marginTop: "10px" }}
            >
              Зарегистрироваться
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={()=> setShowEmailForm(false)}
              style={{ marginTop: "10px" }}
            >
              Отмена
            </Button>
          </Box>
        </form>
      )}
    </Box>
  );
};

export default Register;

async function mockEmailRegister(email, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const token = "mock_auth_token";
      const user = {
        id: "mock_user_id",
        email: email,
        username: email.split("@")[0],
        avatarUrl: "https://example.com/avatar.png",
      };
      resolve({ token, user });
    }, 500); // Задержка в 0.5 секунды
  });
}