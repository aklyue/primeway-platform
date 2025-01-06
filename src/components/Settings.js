import React, { useState, useContext } from "react";
import { Box, Typography, Button, TextField, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";

function Settings() {
  const { user } = useContext(AuthContext);
  const [userData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
  });
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handlePasswordChange = () => {
    // Reset messages
    setErrorMessage("");
    setSuccessMessage("");

    // Validate password match
    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirmation password do not match.");
      return;
    }

    // Mock API call to change password
    console.log("Password change request:", { currentPassword, newPassword });

    // Mock success message
    setSuccessMessage("Password successfully changed.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    localStorage.removeItem("lastCaptchaTime");
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Настройки
      </Typography>

      {/* Display User Information */}
      <Box sx={{ marginBottom: "16px" }}>
        <Typography variant="h6" gutterBottom>
          Информация о профиле
        </Typography>
        <TextField
          fullWidth
          label="Имя"
          value={user.name || "Пусто"}
          InputProps={{
            readOnly: true,
          }}
          sx={{ marginBottom: "16px" }}
        />
        <TextField
          fullWidth
          label="Email"
          value={user.email || "Пусто"}
          InputProps={{
            readOnly: true,
          }}
          sx={{ marginBottom: "16px" }}
        />
      </Box>

      {/* <Box>
        <Typography variant="h6" gutterBottom>
          Смена пароля
        </Typography>
        <TextField
          fullWidth
          type="password"
          label="Текущий пароль"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          sx={{ marginBottom: "16px" }}
        />
        <TextField
          fullWidth
          type="password"
          label="Новый пароль"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          sx={{ marginBottom: "16px" }}
        />
        <TextField
          fullWidth
          type="password"
          label="Подтвердите пароль"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          sx={{ marginBottom: "16px" }}
        />
        {errorMessage && (
          <Alert severity="error" sx={{ marginBottom: "16px" }}>
            {errorMessage}
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success" sx={{ marginBottom: "16px" }}>
            {successMessage}
          </Alert>
        )}
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={handlePasswordChange}
          >
            Изменить пароль
          </Button>
          
        </Box>
      </Box> */}
      <Button variant="outlined" onClick={handleLogout} sx={{ color: "red" }}>
        Выйти из аккаунта
      </Button>
    </Box>
  );
}

export default Settings;
