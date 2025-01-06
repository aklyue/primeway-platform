import React, { useContext, useState, useEffect } from "react";
import {
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
  BrowserRouter as Router,
} from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  Avatar,
  CssBaseline,
  AppBar,
  Box,
  Typography,
  Modal,
  Tooltip,
  ListItemButton,
  ButtonBase,
  CircularProgress,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
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
import Tasks from "./components/Tasks";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

const drawerWidth = 240;

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  maxWidth: "90%",
  bgcolor: "#FFFFFF",
  outline: "none",
  borderRadius: "15px",
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
    loading,
  } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Проверяем, является ли устройство мобильным

  const [mobileOpen, setMobileOpen] = useState(false); // Состояние для управления Drawer на мобильных устройствах

  const snowflakeImage = new Image();
  snowflakeImage.src = snowflakeSvg;

  const checkCaptcha = () => {
    const lastCaptchaTime = localStorage.getItem("lastCaptchaTime");
    const currentTime = Date.now();
    const thirtyMinutes = 30 * 60 * 1000; // 30 минут в миллисекундах

    if (
      !lastCaptchaTime ||
      currentTime - parseInt(lastCaptchaTime, 10) >= thirtyMinutes
    ) {
      return true; // Капча требуется
    } else {
      return false; // Капча не требуется
    }
  };

  useEffect(() => {
    if (!loading) {
      const captchaRequired = checkCaptcha();

      setOpenCaptchaModal(captchaRequired);

      if (!isLoggedIn) {
        if (!captchaRequired) {
          // Если капча не требуется, открываем модальное окно регистрации
          setOpenRegistrationModal(true);
        } else {
          // Если капча требуется, закрываем модальное окно регистрации
          setOpenRegistrationModal(false);
        }
      } else {
        setOpenRegistrationModal(false);
      }
    }
  }, [isLoggedIn, loading, location]);

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

  // Определяем, должен ли отображаться основной контент
  const shouldRenderContent =
    !openCaptchaModal && !openRegistrationModal && isLoggedIn;

  // Блокируем скроллинг при открытых модальных окнах
  useEffect(() => {
    if (openCaptchaModal || openRegistrationModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [openCaptchaModal, openRegistrationModal]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Содержимое Drawer
  const drawer = (
    <div>
      <Toolbar />
      <List>
        {/* Список элементов меню */}
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/tasks"
            selected={location.pathname === "/tasks"}
            onClick={isMobile ? handleDrawerToggle : undefined}
          >
            <ListItemText primary="Задачи" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/billing"
            selected={location.pathname === "/billing"}
            onClick={isMobile ? handleDrawerToggle : undefined}
          >
            <ListItemText primary="Платежи" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/api-keys"
            selected={location.pathname === "/api-keys"}
            onClick={isMobile ? handleDrawerToggle : undefined}
          >
            <ListItemText primary="API Ключи" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/settings"
            selected={location.pathname === "/settings"}
            onClick={isMobile ? handleDrawerToggle : undefined}
          >
            <ListItemText primary="Настройки" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/organization-settings"
            selected={location.pathname === "/organization-settings"}
            onClick={isMobile ? handleDrawerToggle : undefined}
          >
            <ListItemText primary="Настройки организации" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  if (loading) {
    // Отображаем плейсхолдер или спиннер на всю страницу
    return (
      <Box
        sx={{
          display: "flex",
          width: "100vw",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
          position: "fixed",
          top: 0,
          left: 0,
          backgroundColor: "#F5F5F5",
          zIndex: 9999,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        height: "100vh",
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

      {/* Отображаем AppBar и Drawer только если контент должен быть видим */}
      {shouldRenderContent && (
        <>
          <AppBar
            position="fixed"
            sx={{
              zIndex: (theme) => theme.zIndex.drawer + 1,
              backgroundColor: "#F5F5F5",
            }}
          >
            <Toolbar>
              {isMobile && (
                <IconButton
                  color="#202123"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: "4px", padding: "6px" }}
                >
                  <MenuIcon />
                </IconButton>
              )}

              <Box
                sx={{ display: "flex", alignItems: "center", color: "#202123" }}
              >
                <Typography
                  variant="h5"
                  noWrap
                  component={Link}
                  to="/"
                  sx={{
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  PrimeWay
                </Typography>
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

              <Box sx={{ flexGrow: 1 }} />

              {isLoggedIn && (
                <>
                  <Tooltip title={user?.username || "Пользователь"}>
                    <ButtonBase onClick={handleAvatarClick}>
                      <Box
                        sx={{
                          background:
                            "linear-gradient(to right top, blue, skyblue, orange)",
                          borderRadius: "51%",
                          padding: "2.4px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Box
                          sx={{
                            backgroundColor: "#FFFFFF",
                            borderRadius: "50%",
                            padding: "2.6px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Avatar
                            alt={user?.username}
                            src={user?.avatar_url}
                            sx={{
                              width: isMobile ? 32 : 40,
                              height: isMobile ? 32 : 40,
                            }}
                          />
                        </Box>
                      </Box>
                    </ButtonBase>
                  </Tooltip>
                </>
              )}
            </Toolbar>
          </AppBar>

          {/* Условно рендерим Drawer */}
          <Box
            component="nav"
            sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
          >
            {/* Мобильный Drawer */}
            {isMobile && (
              <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                  keepMounted: true, // Better open performance on mobile.
                }}
                sx={{
                  "& .MuiDrawer-paper": {
                    width: drawerWidth,
                    backgroundColor: "#F5F5F5",
                  },
                }}
              >
                {drawer}
              </Drawer>
            )}
            {/* Десктопный Drawer */}
            {!isMobile && (
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
                open
              >
                {drawer}
              </Drawer>
            )}
          </Box>
        </>
      )}

      {/* Основной контент */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: "100%",
          mr: { xs: 0, sm: "15px" },
          ml: { xs: 0, sm: "5px" },
          minHeight: "90vh",
          backgroundColor: "#FFFFFF",
          padding: { xs: "25px", sm: "35px" },
          marginTop: { xs: "56px", sm: "64px" },
          borderRadius: { xs: "0px", sm: "20px" },
          height: "calc(100vh - 64px)",
          overflowY: "auto",
        }}
      >
        {shouldRenderContent ? (
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Tasks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <Tasks />
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
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
        ) : null}

        {/* Модальные окна */}
        {!loading && (
          <Modal
            open={openRegistrationModal}
            onClose={() => {}}
            BackdropProps={{
              style: { backgroundColor: "#FFFFFF" },
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
        )}

        {!loading && (
          <SubscriptionToCaptcha
            open={openCaptchaModal}
            onSuccess={handleCaptchaSuccess}
            onClose={() => setOpenCaptchaModal(false)}
          />
        )}
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
