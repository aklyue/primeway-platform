// Layout.js

import React, { useContext, useState, useEffect } from "react";
import {
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
  BrowserRouter as Router, // Добавлено здесь
} from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  CssBaseline,
  AppBar,
  Box,
  Typography,
  Modal,
} from "@mui/material";
import RunningJobs from "./components/RunningJobs";
import CompletedJobs from "./components/CompletedJobs";
import Billing from "./components/Billing";
import ApiKeys from "./components/ApiKeys";
import Settings from "./components/Settings";
import Register from "./components/Register";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthProvider, { AuthContext } from "./AuthContext";
import OrganizationSwitcher from "./components/Organization/OrganizationSwitcher";
import CreateOrganization from "./components/Organization/CreateOrganization";
import { SubscriptionToCaptcha } from "./components/SubscriptionToCaptcha";
import YandexAuth from "./components/YandexAuth";
import { OrganizationProvider } from "./components/Organization/OrganizationContext";
// Удалили ошибочный импорт:
// import { Router } from "express";

const drawerWidth = 240;

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "#1e1e1e",
  border: "2px solid #000",
  boxShadow: 24,
  borderRadius: "10px",
  p: 4,
};

export function Layout() {
  const { isLoggedIn, user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  // Состояния для управления модальными окнами
  const [openRegistrationModal, setOpenRegistrationModal] = useState(false);
  const [openCaptchaModal, setOpenCaptchaModal] = useState(false);

  // Определяем функцию `checkCaptcha` вне `useEffect`
  const checkCaptcha = () => {
    const lastCaptchaTime = localStorage.getItem("lastCaptchaTime");
    const currentTime = Date.now();
    const thirtyMinutes = 30 * 60 * 1000; // 30 минут в миллисекундах

    if (!lastCaptchaTime || currentTime - parseInt(lastCaptchaTime, 10) >= thirtyMinutes) {
      setOpenCaptchaModal(true);
      return true; // Капча требуется
    } else {
      setOpenCaptchaModal(false);
      return false; // Капча не требуется
    }
  };

  // Проверяем капчу и обновляем состояния при изменении маршрута или авторизации
  useEffect(() => {
    const captchaRequired = checkCaptcha();

    if (!isLoggedIn) {
      if (!captchaRequired) {
        // Если капча не требуется (уже пройдена недавно), открываем модальное окно регистрации
        setOpenRegistrationModal(true);
      } else {
        // Если капча требуется, закрываем модальное окно регистрации до прохождения капчи
        setOpenRegistrationModal(false);
      }
    } else {
      setOpenRegistrationModal(false);
    }
  }, [isLoggedIn, location]);

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate("/login");
    localStorage.removeItem("lastCaptchaTime");
    setOpenCaptchaModal(false);
    setOpenRegistrationModal(false);
  };

  // Обработчик успешного прохождения капчи
  const handleCaptchaSuccess = () => {
    setOpenCaptchaModal(false);
    // Сохраняем текущее время прохождения капчи
    const currentTime = Date.now();
    localStorage.setItem('lastCaptchaTime', currentTime.toString());

    if (!isLoggedIn) {
      // Если пользователь не авторизован, после капчи открываем модальное окно регистрации
      setOpenRegistrationModal(true);
    }
  };

  return (
    <Box sx={{ display: "flex", width: "100%", height: "100%" }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "#000000",
          borderBottom: "1px solid #353740",
        }}
      >
        <Toolbar>
          <Typography
            variant="h5"
            noWrap
            component={Link}
            to="/"
            sx={{ textDecoration: "none", color: "#FFFFFF" }}
          >
            Platform
          </Typography>
          <Box sx={{ flexGrow: 1 }} />

          {isLoggedIn && (
            <>
              <IconButton onClick={handleAvatarClick} color="inherit">
                <Avatar alt={user?.username} src={user?.avatarUrl} />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <MenuItem onClick={handleLogout}>Выйти</MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#000000",
          },
        }}
      >
        <Toolbar />
        <Divider />
        <List>
          {isLoggedIn && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 2,
                justifyContent: "space-between",
              }}
            >
              <OrganizationSwitcher />
              <CreateOrganization sx={{ marginLeft: 1 }} />
            </Box>
          )}
          {/* Список элементов меню */}
          <ListItem
            button
            component={Link}
            to="/running-jobs"
            selected={location.pathname === "/running-jobs"}
          >
            <ListItemText primary="Running Jobs" />
          </ListItem>
          <ListItem
            button
            component={Link}
            to="/completed-jobs"
            selected={location.pathname === "/completed-jobs"}
          >
            <ListItemText primary="Completed Jobs" />
          </ListItem>
          <ListItem
            button
            component={Link}
            to="/billing"
            selected={location.pathname === "/billing"}
          >
            <ListItemText primary="Billing" />
          </ListItem>
          <ListItem
            button
            component={Link}
            to="/api-keys"
            selected={location.pathname === "/api-keys"}
          >
            <ListItemText primary="API Keys" />
          </ListItem>
          <ListItem
            button
            component={Link}
            to="/settings"
            selected={location.pathname === "/settings"}
          >
            <ListItemText primary="Settings" />
          </ListItem>
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: "100%",
          maxHeight: "100vh",
          backgroundColor: "#202123",
        }}
      >
        <Toolbar />
        <Routes>
          {/* Ваши маршруты */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <RunningJobs />
              </ProtectedRoute>
            }
          />
          {/* ... другие маршруты */}
          <Route
            path="/running-jobs"
            element={
              <ProtectedRoute>
                <RunningJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/completed-jobs"
            element={
              <ProtectedRoute>
                <CompletedJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing"
            element={
              <ProtectedRoute>
                <Billing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/api-keys"
            element={
              <ProtectedRoute>
                <ApiKeys />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>

        {/* Модальное окно регистрации для незарегистрированных пользователей */}
        <Modal
          open={openRegistrationModal}
          onClose={(event, reason) => {
            if (
              reason &&
              (reason === "backdropClick" || reason === "escapeKeyDown")
            ) {
              return;
            }
            setOpenRegistrationModal(false);
          }}
          BackdropProps={{
            style: { backgroundColor: "rgba(0, 0, 0, 0.8)" },
          }}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <Box sx={modalStyle}>
            <Typography
              gutterBottom
              id="modal-title"
              variant="h5"
              component="h2"
              sx={{ textAlign: "center" }}
            >
              Добро пожаловать
            </Typography>

            <Box
              sx={{
                mt: 3,
                display: "flex",
                justifyContent: "center",
                zIndex: 2,
              }}
            >
              <YandexAuth />
            </Box>
          </Box>
        </Modal>

        {/* Модальное окно капчи */}
        <SubscriptionToCaptcha
          open={openCaptchaModal}
          onSuccess={handleCaptchaSuccess}
          onClose={() => setOpenCaptchaModal(false)}
        />
      </Box>
    </Box>
  );
}

function App() {
  return (
    <OrganizationProvider>
      <AuthProvider>
        <Router>
          <Layout />
        </Router>
      </AuthProvider>
    </OrganizationProvider>
  );
}

export default App;
