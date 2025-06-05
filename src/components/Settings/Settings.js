import React, { useContext } from "react";
import { Box, Typography, Button, Divider, Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";

function Settings({ setAuthenticating }) {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
    localStorage.removeItem("lastCaptchaTime");
    setAuthenticating(false);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Настройки
      </Typography>

      {/* Информация о профиле */}
      <Box sx={{ marginBottom: "32px", marginTop: "16px" }}>
        <Typography variant="h6" gutterBottom>
          Информация о профиле
        </Typography>
        <Divider sx={{ marginBottom: "16px" }} />

        {/* Аватар пользователя */}
        <Box
          sx={{ display: "flex", alignItems: "center", marginBottom: "16px" }}
        >
          <Avatar
            alt={user?.name || user?.username}
            src={user?.avatar_url}
            sx={{ width: 64, height: 64, marginRight: "16px" }}
          />
          <Box>
            <Typography variant="h5">
              {user?.name || user?.username || "Пользователь"}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user?.email || "Email не указан"}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Button variant="outlined" onClick={handleLogout} sx={{ color: "red" }}>
        Выйти из аккаунта
      </Button>
    </Box>
  );
}

export default Settings;
