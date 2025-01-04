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
  Toolbar,
  IconButton,
  Avatar,
  CssBaseline,
  AppBar,
  Box,
  Typography,
  Modal,
  Tooltip,
  ListItemButton,
} from "@mui/material";
import RunningJobs from "./components/RunningJobs";
import CompletedJobs from "./components/CompletedJobs";
import Billing from "./components/Billing";
import ApiKeys from "./components/ApiKeys";
import Settings from "./components/Settings";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthProvider, { AuthContext } from "./AuthContext";
import OrganizationSwitcher from "./components/Organization/OrganizationSwitcher";
import { SubscriptionToCaptcha } from "./components/SubscriptionToCaptcha";
import YandexAuth from "./components/YandexAuth";
import { OrganizationProvider } from "./components/Organization/OrganizationContext";
import AuthCallback from "./components/AuthCallback";
import OrganizationSettings from "./components/Organization/OrganizationSettings";
import Snowfall from "react-snowfall";
import snowflakeSvg from "./assets/snowflake.svg";

const drawerWidth = 240;

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "#e3e3e3",
  border: "2px solid #000",
  boxShadow: 24,
  borderRadius: "10px",
  p: 4,
};

export function Layout() {
  const {
    isLoggedIn,
    user,
    openCaptchaModal,
    setOpenCaptchaModal,
    openRegistrationModal,
    setOpenRegistrationModal,
    loading, // Получаем состояние загрузки
  } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const snowflakeImage = new Image();
  snowflakeImage.src = snowflakeSvg;

  useEffect(() => {
    if (!loading) {
      setOpenRegistrationModal(!isLoggedIn);
    }
  }, [isLoggedIn]);

  const checkCaptcha = () => {
    const lastCaptchaTime = localStorage.getItem("lastCaptchaTime");
    const currentTime = Date.now();
    const thirtyMinutes = 30 * 60 * 1000; // 30 минут в миллисекундах

    if (
      !lastCaptchaTime ||
      currentTime - parseInt(lastCaptchaTime, 10) >= thirtyMinutes
    ) {
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
  if (loading) {
    // Отображаем плейсхолдер или спиннер
    return (
      <Box
        sx={{
          display: "flex",
          width: "100%",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Загрузка...</Typography>
      </Box>
    );
  }

  const handleAvatarClick = () => {
    navigate("/billing");
  };

  // Обработчик успешного прохождения капчи
  const handleCaptchaSuccess = () => {
    setOpenCaptchaModal(false);
    // Сохраняем текущее время прохождения капчи
    const currentTime = Date.now();
    localStorage.setItem("lastCaptchaTime", currentTime.toString());

    if (!isLoggedIn) {
      // Если пользователь не авторизован, после капчи открываем модальное окно регистрации
      setOpenRegistrationModal(true);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        height: "100%",
        backgroundColor: "#F5F5F5",
      }}
    >
      <CssBaseline />
      <Snowfall
        color="#d1d1dc"
        images={[snowflakeImage]}
        radius={[10, 12]}
        snowflakeCount={30}
        style={{ zIndex: 10000, opacity: "0.6" }}
      />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "#F5F5F5",
          // borderBottom: "1px solid #353740",
        }}
      >
        <Toolbar>
          <Typography
            variant="h5"
            noWrap
            component={Link}
            to="/"
            sx={{
              textDecoration: "none",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              PrimeWay
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <OrganizationSwitcher />
              </Box>
            </Box>
          </Typography>
          <Box sx={{ flexGrow: 1 }} />

          {isLoggedIn && (
            <>
              <Tooltip title={user?.username || "Пользователь"}>
                <Box
                  sx={{
                    background:
                      "linear-gradient(to right top, blue, skyblue, orange)", // Градиентный фон
                    borderRadius: "51%", // Круглая форма
                    padding: "2.4px", // Отступ для градиента
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: "#FFFFFF", // Белый фон для внутреннего слоя
                      borderRadius: "50%", // Круглая форма
                      padding: "2.6px", // Отступ для белой окантовки
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Avatar
                      alt={user?.username}
                      src={user?.avatar_url}
                      sx={{
                        width: 40, // Размер аватарки
                        height: 40, // Размер аватарки
                      }}
                    />
                  </Box>
                </Box>
              </Tooltip>
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
            backgroundColor: "#F5F5F5",
            border: "none",
          },
        }}
      >
        <Toolbar />

        <List>
          {/* {isLoggedIn && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 2,
                justifyContent: "space-between",
              }}
            >
              <OrganizationSwitcher />
            </Box>
          )} */}
          {/* Список элементов меню */}
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/running-jobs"
              selected={
                location.pathname === "/running-jobs" ||
                location.pathname === "/"
              }
            >
              <ListItemText primary="Running Jobs" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/completed-jobs"
              selected={location.pathname === "/completed-jobs"}
            >
              <ListItemText primary="Completed Jobs" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/billing"
              selected={location.pathname === "/billing"}
            >
              <ListItemText primary="Billing" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/api-keys"
              selected={location.pathname === "/api-keys"}
            >
              <ListItemText primary="API Keys" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/settings"
              selected={location.pathname === "/settings"}
            >
              <ListItemText primary="Settings" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/organization-settings"
              selected={location.pathname === "/organization-settings"}
            >
              <ListItemText primary="Organization Settings" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: "100%",
          mr: "15px",
          ml: "5px",
          minHeight: "90vh",
          backgroundColor: "#FFFFFF",
          padding: "40px",
          marginTop: "60px",
          borderRadius: "20px",
        }}
      >
        {/* <Toolbar /> */}
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
          <Route
            path="/organization-settings"
            element={
              <ProtectedRoute>
                <OrganizationSettings />
              </ProtectedRoute>
            }
          />
          {/* <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} /> */}
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>

        {/* Модальное окно регистрации для незарегистрированных пользователей */}
        <Modal
          open={openRegistrationModal}
          onClose={() => {}}
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
    <AuthProvider>
      <OrganizationProvider>
        <Router>
          <Layout />
        </Router>
      </OrganizationProvider>
    </AuthProvider>
  );
}

export default App;
