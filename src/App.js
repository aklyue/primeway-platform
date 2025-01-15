import React, { useContext, useState, useEffect } from "react";
import {
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
  BrowserRouter as Router,
  Navigate,
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
  Button,
  ListItemIcon,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthProvider, { AuthContext } from "./AuthContext";
import { OrganizationProvider } from "./components/Organization/OrganizationContext";
import AuthCallback from "./components/AuthCallback";
import Snowfall from "react-snowfall";
import snowflakeSvg from "./assets/snowflake.svg";
import Tasks from "./components/Tasks";
import Billing from "./components/Billing";
import ApiKeys from "./components/ApiKeys";
import Settings from "./components/Settings";
import OrganizationSettings from "./components/Organization/OrganizationSettings";
import { SubscriptionToCaptcha } from "./components/SubscriptionToCaptcha";
import YandexAuth from "./components/YandexAuth";
import OrganizationSwitcher from "./components/Organization/OrganizationSwitcher";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Docs from "./components/Docs"; // Компонент для документации
import HomeIcon from "@mui/icons-material/Home";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import WorkIcon from "@mui/icons-material/Work";
import SettingsIcon from "@mui/icons-material/Settings";
import LinearScaleIcon from "@mui/icons-material/LinearScale";
import CodeIcon from "@mui/icons-material/Code";

import { AnimatePresence, motion } from "framer-motion";
import GPUList from "./components/GPUList";

const drawerWidth = 240;

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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [mobileOpen, setMobileOpen] = useState(false);

  const snowflakeImage = new Image();
  snowflakeImage.src = snowflakeSvg;

  const checkCaptcha = () => {
    const lastCaptchaTime = localStorage.getItem("lastCaptchaTime");
    const currentTime = Date.now();
    const thirtyMinutes = 30 * 60 * 1000;

    if (
      !lastCaptchaTime ||
      currentTime - parseInt(lastCaptchaTime, 10) >= thirtyMinutes
    ) {
      return true;
    } else {
      return false;
    }
  };

  useEffect(() => {
    if (!loading) {
      const captchaRequired = checkCaptcha();

      setOpenCaptchaModal(captchaRequired);

      if (!isLoggedIn) {
        if (!captchaRequired) {
          setOpenRegistrationModal(true);
        } else {
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
    const currentTime = Date.now();
    localStorage.setItem("lastCaptchaTime", currentTime.toString());

    if (!isLoggedIn) {
      setOpenRegistrationModal(true);
    }
  };

  // Определяем, должен ли отображаться основной контент
  const shouldRenderContent =
    openCaptchaModal === false && openRegistrationModal === false && isLoggedIn;

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

  const isDocsPage = location.pathname.startsWith("/docs");

  // Создаем ключ для анимации переходов
  const groupKey = isDocsPage ? "docs" : "dashboard";

  // Содержимое Drawer
  const drawer = (
    <div>
      <Toolbar />
      <List>
        {!isDocsPage ? (
          <>
            {/* Список элементов меню для дашборда */}
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/gpu-list"
                selected={location.pathname === "/gpu-list"}
                onClick={isMobile ? handleDrawerToggle : undefined}
              >
                <ListItemText primary="GPU" />
              </ListItemButton>
            </ListItem>
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
                <ListItemText primary="Участники" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            {/* Список элементов меню для документации */}
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/docs/welcome"
                selected={location.pathname === "/docs/welcome"}
                onClick={isMobile ? handleDrawerToggle : undefined}
              >
                <ListItemIcon sx={{ minWidth: "0", mr: "5px" }}>
                  <HomeIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Welcome" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/docs/quickstart"
                selected={location.pathname === "/docs/quickstart"}
                onClick={isMobile ? handleDrawerToggle : undefined}
              >
                <ListItemIcon sx={{ minWidth: "0", mr: "5px" }}>
                  <FlashOnIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Quickstart" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/docs/jobs"
                selected={location.pathname === "/docs/jobs"}
                onClick={isMobile ? handleDrawerToggle : undefined}
              >
                <ListItemIcon sx={{ minWidth: "0", mr: "5px" }}>
                  <WorkIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Jobs" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/docs/configuration"
                selected={location.pathname === "/docs/configuration"}
                onClick={isMobile ? handleDrawerToggle : undefined}
              >
                <ListItemIcon sx={{ minWidth: "0", mr: "5px" }}>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Configuration" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/docs/pipelines"
                selected={location.pathname === "/docs/pipelines"}
                onClick={isMobile ? handleDrawerToggle : undefined}
              >
                <ListItemIcon sx={{ minWidth: "0", mr: "5px" }}>
                  <LinearScaleIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Pipelines" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to="/docs/cli"
                selected={location.pathname === "/docs/cli"}
                onClick={isMobile ? handleDrawerToggle : undefined}
              >
                <ListItemIcon sx={{ minWidth: "0", mr: "5px" }}>
                  <CodeIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Cli" />
              </ListItemButton>
            </ListItem>
            {/* Добавьте дополнительные разделы документации по необходимости */}
          </>
        )}
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
        backgroundColor: shouldRenderContent ? "#F5F5F5" : "#FFFFFF",
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
      {shouldRenderContent && (
        <>
          <AppBar
            position="fixed"
            sx={{
              zIndex: (theme) => theme.zIndex.drawer + 1,
              backgroundColor: "#F5F5F5",
            }}
          >
            <Toolbar style={{ paddingLeft: "16px" }}>
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

              {/* Растягивающий элемент */}
              <Box sx={{ flexGrow: 1 }} />

              {/* Кнопки переключения между дашбордом и документацией */}
              <Box
                sx={{ display: "flex", alignItems: "center", marginRight: 2 }}
              >
                <Button
                  component={Link}
                  to="/gpu-list"
                  color="inherit"
                  sx={{
                    textTransform: "none",
                    color: !location.pathname.startsWith("/docs")
                      ? "primary.main"
                      : "#acacbe",
                  }}
                >
                  Dashboard
                </Button>
                <Button
                  component={Link}
                  to="/docs"
                  color="inherit"
                  sx={{
                    textTransform: "none",
                    color: location.pathname.startsWith("/docs")
                      ? "primary.main"
                      : "#acacbe",
                  }}
                >
                  Docs
                </Button>
              </Box>

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

          {/* Drawer с отдельной анимацией */}
          <AnimatePresence mode="wait">
            {shouldRenderContent && (
              <motion.div
                key={groupKey}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16 }}
                style={{ display: "flex" }}
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Основной контент с отдельной анимацией */}

      <Box
        id="main-content"
        component="main"
        sx={{
          flexGrow: 1,
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
          overflowX: "none",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            style={{
              width: "100%",
              display: shouldRenderContent ? "block" : "none",
            }}
          >
            <Routes location={location}>
              <Route
                path="/gpu-list"
                element={
                  <ProtectedRoute>
                    <GPUList />
                  </ProtectedRoute>
                }
              />

              <Route path="/" element={<Navigate to="/gpu-list" replace />} />

              {/* Маршруты дашборда */}
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

              {/* Маршруты документации */}
              <Route
                path="/docs"
                element={<Navigate to="/docs/welcome" replace />}
              />
              <Route
                path="/docs/:docName"
                element={
                  <ProtectedRoute>
                    <Docs />
                  </ProtectedRoute>
                }
              />

              {/* Маршрут для обработки колбэка аутентификации */}
              <Route path="/auth/callback" element={<AuthCallback />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </Box>

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
          <Box
            sx={{
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
            }}
          >
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
