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
  Popover,
  Stack,
  Grid,
  Card,
  CardActionArea,
  CardContent,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ProtectedRoute from "./components/ProtectedRoute";
import ModelTrainingIcon from "@mui/icons-material/ModelTraining";
import DatasetIcon from "@mui/icons-material/Folder";
import AuthProvider, { AuthContext } from "./AuthContext";
import {
  OrganizationContext,
  OrganizationProvider,
} from "./components/Organization/OrganizationContext";
import AuthCallback from "./components/AuthCallback";
import Billing from "./components/Billing";
import ApiKeys from "./components/ApiKeys";
import Settings from "./components/Settings";
import OrganizationSettings from "./components/Organization/OrganizationSettings";
import { SubscriptionToCaptcha } from "./components/SubscriptionToCaptcha";
import YandexAuth from "./components/YandexAuth";
import OrganizationSwitcher from "./components/Organization/OrganizationSwitcher";
import { keyframes, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Docs from "./components/Docs";
import HomeIcon from "@mui/icons-material/Home";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import WorkIcon from "@mui/icons-material/Work";
import PriceChangeIcon from "@mui/icons-material/PriceChange";
import KeyIcon from "@mui/icons-material/Key";
import SettingsIcon from "@mui/icons-material/Settings";
import AssignmentIcon from "@mui/icons-material/Assignment";
import MemoryIcon from "@mui/icons-material/Memory";
import RecentActorsIcon from "@mui/icons-material/RecentActors";
import CodeIcon from "@mui/icons-material/Code";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { AnimatePresence, motion } from "framer-motion";
import GPUList from "./components/GPUList";
import Tasks from "./components/Tasks/Tasks";
import OrganizationEvents from "./components/Organization/OrganizationEvents";
import ModelsPage from "./components/ModelsPage";
import { ReactComponent as Logo } from "./assets/favicon2.svg";
import MenuItem from "./components/MenuItem";
import DatasetsPage from "./components/NoCode/DatasetsPage";
import TrainPage from "./components/NoCode/TrainPage";
import PsychologyIcon from "@mui/icons-material/Psychology";
import JupyterLabSessions from "./components/NoCode/JupyterLab";

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
  const { currentOrganization } = useContext(OrganizationContext);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const [authenticating, setAuthenticating] = useState(false);
  const isSmallDesktop = useMediaQuery(theme.breakpoints.down(1200));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isMinDesktop = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const drawerWidth = isTablet || isMinDesktop ? "8%" : "4%";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const pulse = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.15); }
    100% { transform: scale(1); }
  `;

  const checkCaptcha = () => {
    const lastCaptchaTime = localStorage.getItem("lastCaptchaTime");
    const currentTime = Date.now();
    const threeHours = 3 * 60 * 60 * 1000;

    if (
      !lastCaptchaTime ||
      currentTime - parseInt(lastCaptchaTime, 10) >= threeHours
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

      // Скрываем меню на главной странице
      setShowMenu(location.pathname !== "/");
    }
  }, [isLoggedIn, loading, location]);

  const handleAvatarClick = () => {
    navigate("/");
  };

  const handleCaptchaSuccess = () => {
    setOpenCaptchaModal(false);
    const currentTime = Date.now();
    localStorage.setItem("lastCaptchaTime", currentTime.toString());

    if (!isLoggedIn) {
      setOpenRegistrationModal(true);
    }
  };

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

  const groupKey = isDocsPage ? "docs" : "dashboard";

  const [eventsAnchorEl, setEventsAnchorEl] = useState(null);

  const handleEventsClick = (event) => {
    setEventsAnchorEl(event.currentTarget);
  };

  const handleEventsClose = () => {
    setEventsAnchorEl(null);
  };

  const isEventsOpen = Boolean(eventsAnchorEl);

  const dashboardMenuItems = [
    {
      name: "JupyterLab",
      to: "/jupyter",
      icon: <CodeIcon fontSize="medium" />,
      description: "Интерактивная среда разработки JupyterLab",
    },
    {
      name: "Задачи",
      to: "/tasks",
      icon: <AssignmentIcon fontSize="medium" />,
      description: "Просмотр и управление задачами",
    },
    {
      name: "Модели",
      to: "/models",
      icon: <ModelTrainingIcon />,
      description: "Работа с моделями машинного обучения",
    },
    {
      name: "Наборы Данных",
      to: "/datasets",
      icon: <DatasetIcon />,
      description: "Управление наборами данных",
    },
    {
      name: "Обучение",
      to: "/train",
      icon: <PsychologyIcon />,
      description: "Обучение моделей",
    },
    {
      name: "Биллинг",
      to: "/billing",
      icon: <PriceChangeIcon fontSize="medium" />,
      description: "Управление платежами и балансом",
    },
    {
      name: "API Ключи",
      to: "/api-keys",
      icon: <KeyIcon fontSize="medium" />,
      description: "Управление API ключами",
    },
    {
      name: "Настройки",
      to: "/settings",
      icon: <SettingsIcon fontSize="medium" />,
      description: "Настройки аккаунта",
    },
    {
      name: "Организации",
      to: "/organization-settings",
      icon: <RecentActorsIcon fontSize="medium" />,
      description: "Управление организациями",
    },
  ];

  const docsMenuItems = [
    {
      name: "Добро пожаловать",
      to: "/docs/welcome",
      icon: (
        <HomeIcon
          fontSize="medium"
          style={{ color: "rgba(255, 255, 255, 0.8)" }}
        />
      ),
    },
    {
      name: "Быстрый старт",
      to: "/docs/quickstart",
      icon: (
        <FlashOnIcon
          fontSize="medium"
          style={{ color: "rgba(255, 255, 255, 0.8)" }}
        />
      ),
    },
    {
      name: "Задачи",
      to: "/docs/jobs",
      icon: (
        <WorkIcon
          fontSize="medium"
          style={{ color: "rgba(255, 255, 255, 0.8)" }}
        />
      ),
    },
    {
      name: "Конфигурация",
      to: "/docs/configuration",
      icon: (
        <SettingsIcon
          fontSize="medium"
          style={{ color: "rgba(255, 255, 255, 0.8)" }}
        />
      ),
    },
    {
      name: "CLI",
      to: "/docs/cli",
      icon: (
        <CodeIcon
          fontSize="medium"
          style={{ color: "rgba(255, 255, 255, 0.8)" }}
        />
      ),
    },
  ];

  const menuItems = isDocsPage ? docsMenuItems : dashboardMenuItems;

  const drawer = (
    <div>
      <Toolbar />
      {isMobile && (
        <List sx={{ display: "flex" }}>
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/"
              selected={!location.pathname.startsWith("/docs")}
              onClick={handleDrawerToggle}
            >
              <ListItemText primary="Дашборд" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/docs"
              selected={location.pathname.startsWith("/docs")}
              onClick={handleDrawerToggle}
            >
              <ListItemText primary="Доки" />
            </ListItemButton>
          </ListItem>
        </List>
      )}
      <Stack
        spacing={1}
        sx={{
          alignItems: "center",
          mt: 2,
        }}
      >
        {menuItems.map((item) => (
          <MenuItem
            key={item.to}
            to={item.to}
            name={item.name}
            icon={item.icon}
            isMobile={isMobile}
            isSmallDesktop={isSmallDesktop}
            isTablet={isTablet}
            isDocsPage={isDocsPage}
            handleDrawerToggle={handleDrawerToggle}
          />
        ))}
      </Stack>
    </div>
  );

  const shouldRenderContent =
    openCaptchaModal === false && openRegistrationModal === false && isLoggedIn;

  if (loading) {
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

  const HomePage = () => {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Typography variant="h3" gutterBottom sx={{ mb: 5, mt: 2 }}>
          Добро пожаловать в PrimeWay
        </Typography>

        <Grid container spacing={4} sx={{ maxWidth: "1500px" }}>
          {dashboardMenuItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.to}>
              <Card
                component={Link}
                to={item.to}
                onClick={() => setShowMenu(true)}
                sx={{
                  height: "100%",
                  textDecoration: "none",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "scale(1.03)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardActionArea sx={{ height: "100%" }}>
                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      p: 4.5,
                      backgroundColor: "#F5F5F5",
                    }}
                  >
                    <Box sx={{ mb: 2, transform: "scale(1.3)" }}>
                      {item.icon}
                    </Box>
                    <Typography variant="h5" component="div" sx={{ mb: 1 }}>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>

      <AnimatePresence mode="wait">
        {shouldRenderContent && (
          <motion.div
            key={groupKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{
              width: "100%",
              display: shouldRenderContent ? "block" : "none",
            }}
          >
            <Box
              sx={{
                display: "flex",
                width: "100%",
                backgroundColor: isDocsPage ? "rgb(21 21 21)" : "#FFFFFF",
              }}
            >
              <CssBaseline />
              {shouldRenderContent && (
                <>
                  <header
                    style={{
                      position: "fixed",

                      left: "50%",
                      transform: "translateX(-50%)",
                      maxWidth: "1410px",
                      width: "100%",
                      top: "15px",
                      zIndex: 1,
                    }}
                  >
                    <Toolbar
                      style={{
                        borderRadius: "20px",
                        width: "100%",
                        backgroundColor: isDocsPage
                          ? "rgb(204 204 230)"
                          : "rgb(21 22 25)",
                      }}
                    >
                      {isMobile && (
                        <IconButton
                          color="#202123"
                          aria-label="open drawer"
                          edge="start"
                          onClick={handleDrawerToggle}
                          sx={{ mr: "4px", padding: "6px", color: "#F5F5F5" }}
                        >
                          <MenuIcon />
                        </IconButton>
                      )}

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          color: "#202123",
                        }}
                      >
                        <Typography
                          variant={"h5"}
                          noWrap
                          component={Link}
                          to="/"
                          sx={{
                            textDecoration: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: "7px",
                            color: isDocsPage ? "white" : "",
                          }}
                        >
                          <Logo width={32} height={32} />
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography
                            variant="h5"
                            noWrap
                            sx={{
                              textDecoration: "none",
                              ml: "8px",
                              color: "secondary.main",
                            }}
                          >
                            {isDocsPage ? (
                              "Документация"
                            ) : (
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <OrganizationSwitcher />
                                <Button
                                  component={Link}
                                  to="/gpu-list"
                                  variant="outlined"
                                  sx={{ ml: 2, padding: "3px 5px" }}
                                >
                                  GPU
                                </Button>
                              </Box>
                            )}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ flexGrow: 1 }} />

                      {!isMobile && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            marginRight: 2,
                          }}
                        >
                          <Button
                            component={Link}
                            to="/"
                            color="inherit"
                            sx={{
                              fontWeight: 700,
                              textTransform: "none",
                              backgroundColor: !isDocsPage
                                ? "primary.main"
                                : "transparent",
                              color: !isDocsPage ? "#FFFFFF" : "#acacbe",
                              borderRadius: "8px",
                              marginRight: "8px",
                              "&:hover": {
                                backgroundColor: !isDocsPage
                                  ? "primary.dark"
                                  : "transparent",
                              },
                            }}
                          >
                            Дашборд
                          </Button>
                          <Button
                            component={Link}
                            to="/docs"
                            color="inherit"
                            sx={{
                              fontWeight: 700,
                              textTransform: "none",
                              backgroundColor: isDocsPage
                                ? "primary.main"
                                : "transparent",
                              color: isDocsPage ? "#FFFFFF" : "#acacbe",
                              borderRadius: "8px",
                              marginRight: "8px",
                              "&:hover": {
                                backgroundColor: isDocsPage
                                  ? "primary.dark"
                                  : "transparent",
                              },
                            }}
                          >
                            Доки
                          </Button>

                          <IconButton
                            aria-label="Открыть события"
                            onClick={handleEventsClick}
                            sx={{
                              color: isEventsOpen
                                ? "secondary.main"
                                : "#F5F5F5",
                              backgroundColor: isDocsPage
                                ? "rgba(255, 255, 255, 0.04)"
                                : "rgba(0, 0, 0, 0.04);",
                            }}
                          >
                            <NotificationsNoneIcon
                              sx={{
                                color: isDocsPage
                                  ? "rgba(255, 255, 255, 0.8)"
                                  : "",
                                animation: isEventsOpen
                                  ? ""
                                  : `${pulse} 1.2s infinite ease-in-out`,
                              }}
                            />
                          </IconButton>
                        </Box>
                      )}

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
                                    backgroundColor: isDocsPage
                                      ? "rgb(204 204 230)"
                                      : "rgb(21 22 25)",
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
                  </header>

                  {/* Drawer - показываем только если не на главной странице или если showMenu=true */}
                  {(showMenu || location.pathname !== "/") && (
                    <Box component="nav" sx={{ flexShrink: { sm: 0 } }}>
                      {isMobile && (
                        <Drawer
                          variant="temporary"
                          open={mobileOpen}
                          onClose={handleDrawerToggle}
                          ModalProps={{
                            keepMounted: true,
                          }}
                          sx={{
                            "& .MuiDrawer-paper": {
                              width: "180px",
                              ackgroundColor: isDocsPage
                                ? "rgb(21 21 21)"
                                : "#F5F5F5",
                            },
                          }}
                        >
                          {drawer}
                        </Drawer>
                      )}
                      {!isMobile && (
                        <Drawer
                          variant="permanent"
                          sx={{
                            width: drawerWidth,
                            flexShrink: 0,
                            "& .MuiDrawer-paper": {
                              width: drawerWidth,
                              boxSizing: "border-box",
                              backgroundColor: isDocsPage
                                ? "rgb(21 21 21)"
                                : "#FFFFFF",
                              border: "none",
                            },
                          }}
                          open
                        >
                          {drawer}
                        </Drawer>
                      )}
                    </Box>
                  )}
                </>
              )}

              <Box
                id="main-content"
                component="main"
                sx={{
                  flexGrow: 1,

                  marginLeft: drawerWidth,
                  marginRight: drawerWidth,
                  minHeight: "90vh",
                  height: isDocsPage ? "calc(100vh - 64px)" : "",
                  backgroundColor: isDocsPage ? "#f9faff" : "#FFFFFF",
                  padding: { lg: "25px", xl: "35px", xs: "20px" },
                  marginTop: { xs: "56px", sm: "64px" },
                  borderRadius: { xs: "0px", sm: "20px" },
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
                    transition={{ duration: 0.14 }}
                    style={{
                      width: "100%",
                      display: shouldRenderContent ? "block" : "none",
                    }}
                  >
                    <Routes location={location}>
                      <Route path="/" element={<HomePage />} />
                      <Route
                        path="/gpu-list"
                        element={
                          <ProtectedRoute>
                            <GPUList />
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
                        path="/datasets"
                        element={
                          <ProtectedRoute>
                            <DatasetsPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/jupyter"
                        element={
                          <ProtectedRoute>
                            <JupyterLabSessions />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/train"
                        element={
                          <ProtectedRoute>
                            <TrainPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/models"
                        element={
                          <ProtectedRoute>
                            <ModelsPage />
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
                            <Settings setAuthenticating={setAuthenticating} />
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
                      <Route path="/auth/callback" element={<AuthCallback />} />
                    </Routes>
                  </motion.div>
                </AnimatePresence>
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

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
            {authenticating ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "200px",
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              <>
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
                  <YandexAuth setAuthenticating={setAuthenticating} />
                </Box>
              </>
            )}
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

      <Popover
        open={isEventsOpen}
        anchorEl={eventsAnchorEl}
        onClose={handleEventsClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          style: {
            maxHeight: "500px",
            width: "570px",
            padding: "12px",
            borderRadius: "10px",
          },
        }}
      >
        <Typography variant="h5" textAlign={"center"}>
          События
        </Typography>
        {currentOrganization ? (
          <OrganizationEvents
            organizationId={currentOrganization.id}
            amount={5}
          />
        ) : (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2">Организация не выбрана.</Typography>
          </Box>
        )}
      </Popover>
    </>
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
