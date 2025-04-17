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
  Popover,
  Stack,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ProtectedRoute from "./components/ProtectedRoute";
import ModelTrainingIcon from "@mui/icons-material/ModelTraining";
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
import Docs from "./components/Docs"; // Компонент для документации
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
import axiosInstance from "./api";
import Tasks from "./components/Tasks/Tasks";
import OrganizationEvents from "./components/Organization/OrganizationEvents";
import ModelsPage from "./components/ModelsPage";
import { ReactComponent as Logo } from "./assets/favicon2.svg";
import MenuItem from "./components/MenuItem";

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
  const { currentOrganization } = useContext(OrganizationContext); // Получаем текущую организацию из контекста
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const [authenticating, setAuthenticating] = useState(false);

  // Телефоны: до 600px
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Планшеты: от 600px до 960px
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  // Ноутбуки/Компьютеры: от 960px и выше
  const isMinDesktop = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const drawerWidth = isTablet || isMinDesktop ? "8%" : "4%";

  const [mobileOpen, setMobileOpen] = useState(false);

  const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
`;

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

  // Состояния для иконки и списка событий
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
      name: "GPU",
      to: "/gpu-list",
      icon: <MemoryIcon fontSize="medium" />,
    },
    {
      name: "Задачи",
      to: "/tasks",
      icon: <AssignmentIcon fontSize="medium" />,
    },
    {
      name: "Модели",
      to: "/models",
      icon: <ModelTrainingIcon fontSize="medium" />,
    },
    {
      name: "Биллинг",
      to: "/billing",
      icon: <PriceChangeIcon fontSize="medium" />,
    },
    {
      name: "API Ключи",
      to: "/api-keys",
      icon: <KeyIcon fontSize="medium" />,
    },
    {
      name: "Настройки",
      to: "/settings",
      icon: <SettingsIcon fontSize="medium" />,
    },
    {
      name: "Организации",
      to: "/organization-settings",
      icon: <RecentActorsIcon fontSize="medium" />,
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

  // Содержимое Drawer
  // const drawer = (
  //   <div>
  //     <Toolbar />
  //     <List>
  //       {isMobile && (
  //         <List sx={{ display: "flex" }}>
  //           <ListItem disablePadding>
  //             <ListItemButton
  //               component={Link}
  //               to="/gpu-list"
  //               selected={!location.pathname.startsWith("/docs")}
  //               onClick={handleDrawerToggle}
  //             >
  //               <ListItemText primary="Дашборд" />
  //             </ListItemButton>
  //           </ListItem>
  //           <ListItem disablePadding>
  //             <ListItemButton
  //               component={Link}
  //               to="/docs"
  //               selected={location.pathname.startsWith("/docs")}
  //               onClick={handleDrawerToggle}
  //             >
  //               <ListItemText primary="Доки" />
  //             </ListItemButton>
  //           </ListItem>
  //         </List>
  //       )}
  //       {!isDocsPage ? (
  //         <>
  //           {/* Список элементов меню для дашборда */}
  //           <Tooltip title="GPU" placement="right">
  //             <ListItem disablePadding>
  //               <ListItemButton
  //                 component={Link}
  //                 to="/gpu-list"
  //                 selected={location.pathname === "/gpu-list"}
  //                 onClick={isMobile ? handleDrawerToggle : undefined}
  //                 sx={{
  //                   justifyContent: "center",
  //                   padding: "10px 0",
  //                 }}
  //               >
  //                 <ListItemIcon sx={{ minWidth: 0 }}>
  //                   <MemoryIcon fontSize="medium" />
  //                 </ListItemIcon>
  //               </ListItemButton>
  //             </ListItem>
  //           </Tooltip>

  //           {/* Задачи */}
  //           <Tooltip title="Задачи" placement="right">
  //             <ListItem disablePadding>
  //               <ListItemButton
  //                 component={Link}
  //                 to="/tasks"
  //                 selected={location.pathname === "/tasks"}
  //                 onClick={isMobile ? handleDrawerToggle : undefined}
  //                 sx={{
  //                   justifyContent: "center",
  //                   padding: "10px 0",
  //                 }}
  //               >
  //                 <ListItemIcon sx={{ minWidth: 0 }}>
  //                   <AssignmentIcon fontSize="medium" />
  //                 </ListItemIcon>
  //               </ListItemButton>
  //             </ListItem>
  //           </Tooltip>

  //           {/* Модели */}
  //           <Tooltip title="Модели" placement="right">
  //             <ListItem disablePadding>
  //               <ListItemButton
  //                 component={Link}
  //                 to="/models"
  //                 selected={location.pathname === "/models"}
  //                 onClick={isMobile ? handleDrawerToggle : undefined}
  //                 sx={{
  //                   justifyContent: "center",
  //                   padding: "10px 0",
  //                 }}
  //               >
  //                 <ListItemIcon sx={{ minWidth: 0 }}>
  //                   <ModelTrainingIcon fontSize="medium" />
  //                 </ListItemIcon>
  //               </ListItemButton>
  //             </ListItem>
  //           </Tooltip>

  //           {/* Биллинг */}
  //           <Tooltip title="Биллинг" placement="right">
  //             <ListItem disablePadding>
  //               <ListItemButton
  //                 component={Link}
  //                 to="/billing"
  //                 selected={location.pathname === "/billing"}
  //                 onClick={isMobile ? handleDrawerToggle : undefined}
  //                 sx={{
  //                   justifyContent: "center",
  //                   padding: "10px 0",
  //                 }}
  //               >
  //                 <ListItemIcon sx={{ minWidth: 0 }}>
  //                   <PriceChangeIcon fontSize="medium" />
  //                 </ListItemIcon>
  //               </ListItemButton>
  //             </ListItem>
  //           </Tooltip>

  //           {/* API Ключи */}
  //           <Tooltip title="API Ключи" placement="right">
  //             <ListItem disablePadding>
  //               <ListItemButton
  //                 component={Link}
  //                 to="/api-keys"
  //                 selected={location.pathname === "/api-keys"}
  //                 onClick={isMobile ? handleDrawerToggle : undefined}
  //                 sx={{
  //                   justifyContent: "center",
  //                   padding: "10px 0",
  //                 }}
  //               >
  //                 <ListItemIcon sx={{ minWidth: 0 }}>
  //                   <KeyIcon fontSize="medium" />
  //                 </ListItemIcon>
  //               </ListItemButton>
  //             </ListItem>
  //           </Tooltip>

  //           {/* Настройки */}
  //           <Tooltip title="Настройки" placement="right">
  //             <ListItem disablePadding>
  //               <ListItemButton
  //                 component={Link}
  //                 to="/settings"
  //                 selected={location.pathname === "/settings"}
  //                 onClick={isMobile ? handleDrawerToggle : undefined}
  //                 sx={{
  //                   justifyContent: "center",
  //                   padding: "10px 0",
  //                 }}
  //               >
  //                 <ListItemIcon sx={{ minWidth: 0 }}>
  //                   <SettingsIcon fontSize="medium" />
  //                 </ListItemIcon>
  //               </ListItemButton>
  //             </ListItem>
  //           </Tooltip>

  //           {/* Организация */}
  //           <Tooltip title="Организация" placement="right">
  //             <ListItem disablePadding>
  //               <ListItemButton
  //                 component={Link}
  //                 to="/organization-settings"
  //                 selected={location.pathname === "/organization-settings"}
  //                 onClick={isMobile ? handleDrawerToggle : undefined}
  //                 sx={{
  //                   justifyContent: "center",
  //                   padding: "10px 0",
  //                 }}
  //               >
  //                 <ListItemIcon sx={{ minWidth: 0 }}>
  //                   <RecentActorsIcon fontSize="medium" />
  //                 </ListItemIcon>
  //               </ListItemButton>
  //             </ListItem>
  //           </Tooltip>
  //         </>
  //       ) : (
  //         <>
  //           {/* Список элементов меню для документации */}
  //           {/* Добро Пожаловать */}
  //           <Tooltip title="Добро Пожаловать" placement="right">
  //             <ListItem disablePadding>
  //               <ListItemButton
  //                 component={Link}
  //                 to="/docs/welcome"
  //                 selected={location.pathname === "/docs/welcome"}
  //                 onClick={isMobile ? handleDrawerToggle : undefined}
  //                 sx={{
  //                   justifyContent: "center",
  //                   padding: "10px 0",
  //                 }}
  //               >
  //                 <ListItemIcon sx={{ minWidth: 0 }}>
  //                   <HomeIcon
  //                     fontSize="medium"
  //                     style={{ color: "rgba(255, 255, 255, 0.8)" }}
  //                   />
  //                 </ListItemIcon>
  //               </ListItemButton>
  //             </ListItem>
  //           </Tooltip>

  //           {/* Начало работы */}
  //           <Tooltip title="Начало работы" placement="right">
  //             <ListItem disablePadding>
  //               <ListItemButton
  //                 component={Link}
  //                 to="/docs/quickstart"
  //                 selected={location.pathname === "/docs/quickstart"}
  //                 onClick={isMobile ? handleDrawerToggle : undefined}
  //                 sx={{
  //                   justifyContent: "center",
  //                   padding: "10px 0",
  //                 }}
  //               >
  //                 <ListItemIcon sx={{ minWidth: 0 }}>
  //                   <FlashOnIcon
  //                     fontSize="medium"
  //                     style={{ color: "rgba(255, 255, 255, 0.8)" }}
  //                   />
  //                 </ListItemIcon>
  //               </ListItemButton>
  //             </ListItem>
  //           </Tooltip>

  //           {/* Jobs */}
  //           <Tooltip title="Задачи" placement="right">
  //             <ListItem disablePadding>
  //               <ListItemButton
  //                 component={Link}
  //                 to="/docs/jobs"
  //                 selected={location.pathname === "/docs/jobs"}
  //                 onClick={isMobile ? handleDrawerToggle : undefined}
  //                 sx={{
  //                   justifyContent: "center",
  //                   padding: "10px 0",
  //                 }}
  //               >
  //                 <ListItemIcon sx={{ minWidth: 0 }}>
  //                   <WorkIcon
  //                     fontSize="medium"
  //                     style={{ color: "rgba(255, 255, 255, 0.8)" }}
  //                   />
  //                 </ListItemIcon>
  //               </ListItemButton>
  //             </ListItem>
  //           </Tooltip>

  //           {/* Configuration */}
  //           <Tooltip title="Конфигурация" placement="right">
  //             <ListItem disablePadding>
  //               <ListItemButton
  //                 component={Link}
  //                 to="/docs/configuration"
  //                 selected={location.pathname === "/docs/configuration"}
  //                 onClick={isMobile ? handleDrawerToggle : undefined}
  //                 sx={{
  //                   justifyContent: "center",
  //                   padding: "10px 0",
  //                 }}
  //               >
  //                 <ListItemIcon sx={{ minWidth: 0 }}>
  //                   <SettingsIcon
  //                     fontSize="medium"
  //                     style={{ color: "rgba(255, 255, 255, 0.8)" }}
  //                   />
  //                 </ListItemIcon>
  //               </ListItemButton>
  //             </ListItem>
  //           </Tooltip>

  //           {/* CLI */}
  //           <Tooltip title="CLI" placement="right">
  //             <ListItem disablePadding>
  //               <ListItemButton
  //                 component={Link}
  //                 to="/docs/cli"
  //                 selected={location.pathname === "/docs/cli"}
  //                 onClick={isMobile ? handleDrawerToggle : undefined}
  //                 sx={{
  //                   justifyContent: "center",
  //                   padding: "10px 0",
  //                 }}
  //               >
  //                 <ListItemIcon sx={{ minWidth: 0 }}>
  //                   <CodeIcon
  //                     fontSize="medium"
  //                     style={{ color: "rgba(255, 255, 255, 0.8)" }}
  //                   />
  //                 </ListItemIcon>
  //               </ListItemButton>
  //             </ListItem>
  //           </Tooltip>
  //         </>
  //       )}
  //     </List>
  //   </div>
  // );

  const drawer = (
    <div>
      <Toolbar />
      {isMobile && (
        <List sx={{ display: "flex" }}>
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/gpu-list"
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
        }}
      >
        {menuItems.map((item) => (
          <MenuItem
            key={item.to}
            to={item.to}
            name={item.name}
            icon={item.icon}
            isMobile={isMobile}
            handleDrawerToggle={handleDrawerToggle}
          />
        ))}
      </Stack>
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
                height: "100vh",
                backgroundColor: isDocsPage
                  ? "rgb(21 21 21)"
                  : !shouldRenderContent
                  ? "#FFFFFF"
                  : "#F5F5F5",
              }}
            >
              <CssBaseline />
              {shouldRenderContent && (
                <>
                  <AppBar
                    position="fixed"
                    sx={{
                      zIndex: (theme) => theme.zIndex.drawer + 1,
                      backgroundColor: isDocsPage
                        ? "rgb(21 21 21)"
                        : !shouldRenderContent
                        ? "#FFFFFF"
                        : "#F5F5F5",
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
                              <OrganizationSwitcher />
                            )}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Растягивающий элемент */}
                      <Box sx={{ flexGrow: 1 }} />

                      {/* Кнопки переключения между дашбордом и документацией */}
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
                            to="/gpu-list"
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

                          {/* Добавляем иконку событий */}
                          <IconButton
                            aria-label="Открыть события"
                            onClick={handleEventsClick}
                            sx={{
                              color: isEventsOpen
                                ? "secondary.main"
                                : "#202123",
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
                                      ? "rgb(21 21 21)"
                                      : "#F5F5F5",
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

                  {/* Drawer */}
                  <Box component="nav" sx={{ flexShrink: { sm: 0 } }}>
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
                            width: "150px",
                            ackgroundColor: isDocsPage
                              ? "rgb(21 21 21)"
                              : "#F5F5F5",
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
                            backgroundColor: isDocsPage
                              ? "rgb(21 21 21)"
                              : !shouldRenderContent
                              ? "#FFFFFF"
                              : "#F5F5F5",
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

              {/* Основной контент с отдельной анимацией */}

              <Box
                id="main-content"
                component="main"
                sx={{
                  flexGrow: 1,
                  width: "100%",
                  marginLeft: isMobile ? "" : drawerWidth,

                  minHeight: "90vh",
                  backgroundColor: isDocsPage ? "#f9faff" : "#FFFFFF",
                  padding: { lg: "25px", xl: "35px", xs: "20px" },
                  marginTop: { xs: "56px", sm: "64px" },
                  borderRadius: { xs: "0px", sm: "20px" },
                  border: "1px solid #ececf1",
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
                    transition={{ duration: 0.14 }}
                    style={{
                      width: "100%",
                      display: shouldRenderContent ? "block" : "none",
                    }}
                  >
                    <Routes location={location}>
                      <Route
                        path="/"
                        element={<Navigate to="/gpu-list" replace />}
                      />

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
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Модальные окна вынесены за пределы AnimatePresence и motion.div */}
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

      {/* Поповер для событий организации */}
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
            amount={5} // Передаем amount={5}
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
