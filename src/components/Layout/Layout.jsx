import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Toolbar,
  Avatar,
  CssBaseline,
  Box,
  Typography,
  Modal,
  Tooltip,
  ButtonBase,
  CircularProgress,
  IconButton,
  Button,
  Popover,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import AuthCallback from "../AuthCallback";
import SubscriptionToCaptcha from "../SubscriptionToCaptcha";
import YandexAuth from "../YandexAuth";
import OrganizationSwitcher from "../Organization/OrganizationSwitcher";
import { keyframes, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { AnimatePresence, motion } from "framer-motion";
import OrganizationEvents from "../Organization/OrganizationEvents";
import { ReactComponent as Logo } from "../../assets/favicon2.svg";

import ResponsiveDrawer from "../../UI/ResponsiveDrawer";

import { useSelector, useDispatch } from "react-redux";
import {
  setOpenCaptchaModal,
  setOpenRegistrationModal,
} from "../../store/slices/authSlice";
import { selectCurrentOrganization } from "../../store/selectors/organizationsSelectors";
import { fetchUserData } from "../../store/slices/authSlice";
import { setOrganizations } from "../../store/slices/organizationSlice";
import { fetchWalletBalance } from "../../store/slices/organizationSlice";
import { restartHints } from "../../store/slices/hintsSlice";
import { getDashboardMenuItems } from "../../constants/getDashboardMenuItems";
import { getDocsMenuItems } from "../../constants/getDocsMenuItems";
import Router from "../../Router";
import { showIntroSlider } from "../../store/slices/introSliderSlice";
import { stepsMap } from "../../constants/stepsMap";
import { useTour } from "@reactour/tour";

export function Layout() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchUserData());
  }, [dispatch]);

  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (user && user.organizations) {
      dispatch(setOrganizations(user.organizations));
    }
  }, [user, dispatch]);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const openCaptchaModal = useSelector((state) => state.auth.openCaptchaModal);
  const openRegistrationModal = useSelector(
    (state) => state.auth.openRegistrationModal
  );
  const loading = useSelector((state) => state.auth.loading);

  const currentOrganization = useSelector(selectCurrentOrganization);

  const billingAccountId = useSelector(
    (state) => state.auth.user?.billing_account_id
  );

  useEffect(() => {
    if (!billingAccountId) return;
    dispatch(fetchWalletBalance(billingAccountId));
    const intervalId = setInterval(() => {
      dispatch(fetchWalletBalance(billingAccountId));
    }, 5000);
    return () => clearInterval(intervalId);
  }, [billingAccountId, dispatch]);

  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const [authenticating, setAuthenticating] = useState(false);
  const isSmallDesktop = useMediaQuery(theme.breakpoints.down(1200));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isMinDesktop = useMediaQuery(theme.breakpoints.between("md", "lg"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { setIsOpen, setSteps, setCurrentStep } = useTour();

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
      dispatch(setOpenCaptchaModal(captchaRequired));

      if (!isLoggedIn) {
        if (!captchaRequired) {
          dispatch(setOpenRegistrationModal(true));
        } else {
          dispatch(setOpenRegistrationModal(false));
        }
      } else {
        dispatch(setOpenRegistrationModal(false));
      }

      // Скрываем меню на главной странице и на странице доков
      setShowMenu(
        location.pathname !== "/" && !location.pathname.startsWith("/docs")
      );
    }
  }, [isLoggedIn, loading, location]);

  const handleAvatarClick = () => {
    navigate("/");
  };

  const handleCaptchaSuccess = () => {
    dispatch(setOpenCaptchaModal(false));
    const currentTime = Date.now();
    localStorage.setItem("lastCaptchaTime", currentTime.toString());

    if (!isLoggedIn) {
      dispatch(setOpenRegistrationModal(true));
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
  const isMainPage = location.pathname === "/";
  const dashboardMenuItems = getDashboardMenuItems(isMainPage);
  const docsMenuItems = getDocsMenuItems(isDocsPage);
  const drawerWidth =
    isTablet || isMinDesktop
      ? isDocsPage
        ? "25%"
        : "8%"
      : isDocsPage
      ? "17%"
      : "6%";

  const effectiveDrawerWidthPx = isDocsPage
    ? isTablet || isMinDesktop
      ? 0.25
      : 0.17
    : isTablet || isMinDesktop
    ? 0.08
    : 0.06;

  const screenWidth = window.innerWidth;
  const drawerWidthPx = Math.floor(screenWidth * effectiveDrawerWidthPx);

  const groupKey = isDocsPage ? "docs" : "dashboard";

  const [eventsAnchorEl, setEventsAnchorEl] = useState(null);

  const handleEventsClick = (event) => {
    setEventsAnchorEl(event.currentTarget);
  };

  const handleEventsClose = () => {
    setEventsAnchorEl(null);
  };

  const isEventsOpen = Boolean(eventsAnchorEl);

  let menuItems = isDocsPage ? docsMenuItems : dashboardMenuItems;

  let rightMenuItems;

  if (!isDocsPage && !isMobile) {
    const splitIndex = dashboardMenuItems.findIndex(
      (item) => item.name === "Биллинг"
    );

    menuItems = dashboardMenuItems.slice(0, splitIndex);

    rightMenuItems = dashboardMenuItems.slice(splitIndex);
  }

  const shouldRenderContent =
    openCaptchaModal === false && openRegistrationModal === false && isLoggedIn;

  const handleClick = () => {
    if (location.pathname === "/") {
      dispatch(showIntroSlider());
    } else {
      const steps = stepsMap[location.pathname];
      if (steps?.length) {
        setSteps(steps);
        setCurrentStep(0);
        setIsOpen(true);
      }
    }
  };

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

  const itemsInRow = 3;
  const total = dashboardMenuItems.length;
  const itemsInLastRow = total % itemsInRow || itemsInRow;

  return (
    <Box
      sx={{
        overflowX: "hidden",
        overflowY: "hidden",
        width: "100vw",
        height: "100vh",
      }}
    >
      {isMobile && (
        <>
          <IconButton
            aria-label="Показать подсказки"
            onClick={handleClick}
            sx={{
              color: "#5282ff",
              backgroundColor: "rgba(0, 0, 255, 0.04)",
              ml: 1,
              position: "absolute",
              right: "7%",
              bottom: "3%",
              zIndex: 1000,
            }}
          >
            <HelpOutlineIcon />
          </IconButton>
        </>
      )}
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
              height: "100%",
              display: shouldRenderContent ? "block" : "none",
            }}
          >
            <Box
              sx={{
                display: "flex",
                width: "100%",
                height: "100%",
                backgroundColor: "#FFFFFF",
              }}
            >
              <CssBaseline />
              {shouldRenderContent && (
                <>
                  <AnimatePresence mode="wait">
                    <motion.header
                      key={location.pathname === "/"}
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: 1,
                      }}
                      exit={{
                        opacity: 0,
                      }}
                      transition={{ duration: 0.1 }}
                      style={{
                        position: "fixed",
                        marginTop:
                          !isDocsPage && !isMobile && !isTablet ? "1%" : "",
                        width:
                          isDocsPage || isMainPage || isMobile || isTablet
                            ? "100%"
                            : `calc(100% - (2 * ${drawerWidth}))`,
                        zIndex: 1201,
                        padding:
                          isMobile || isTablet ? "0 0" : !isDocsPage && "0 1%",
                        marginLeft:
                          !isDocsPage && !isMainPage && !isMobile && !isTablet
                            ? drawerWidth
                            : "",
                        marginRight:
                          !isDocsPage && !isMainPage ? drawerWidth : "",
                        borderRadius:
                          isMobile || isTablet
                            ? "0"
                            : !isDocsPage
                            ? "50px"
                            : "0",
                      }}
                    >
                      <Toolbar
                        style={{
                          backgroundColor: isDocsPage
                            ? "white"
                            : "rgb(236, 247, 255)",
                          width: "100%",
                          borderBottom: isDocsPage && "1px solid lightgray",
                          borderRadius:
                            isMobile || isTablet
                              ? "0"
                              : !isDocsPage
                              ? "50px"
                              : "0",
                          boxShadow:
                            !isDocsPage && "0 2px 4px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        {isMobile && !isMainPage && (
                          <IconButton
                            color="#202123"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: "4px", padding: "6px", color: "#353740" }}
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
                              color: isDocsPage && "white",
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
                                  <OrganizationSwitcher
                                    isMainPage={isMainPage}
                                  />
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
                                  ? "#5282ff"
                                  : "transparent",
                                color: !isDocsPage ? "#FFFFFF" : "#5282ff",
                                borderRadius: "8px",
                                marginRight: "8px",
                                "&:hover": {
                                  backgroundColor: !isDocsPage
                                    ? "#86a7fc"
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
                                  ? "#5282ff"
                                  : "transparent",
                                color: isDocsPage ? "#FFFFFF" : "#5282ff",
                                borderRadius: "8px",
                                marginRight: "8px",
                                "&:hover": {
                                  backgroundColor: isDocsPage
                                    ? "#86a7fc"
                                    : "transparent",
                                },
                              }}
                            >
                              Доки
                            </Button>

                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                marginRight: 2,
                              }}
                            >
                              <IconButton
                                aria-label="Открыть события"
                                onClick={handleEventsClick}
                                sx={{
                                  color: isEventsOpen ? "#7097ff" : "#5282ff",
                                  backgroundColor: "rgba(0, 0, 255, 0.04);",
                                }}
                              >
                                <NotificationsNoneIcon
                                  sx={{
                                    color: "#5282ff",
                                    animation: isEventsOpen
                                      ? ""
                                      : `${pulse} 1.2s infinite ease-in-out`,
                                  }}
                                />
                              </IconButton>
                              <IconButton
                                aria-label="Показать подсказки"
                                onClick={handleClick}
                                sx={{
                                  color: "#5282ff",
                                  backgroundColor: "rgba(0, 0, 255, 0.04)",
                                  ml: 1,
                                }}
                              >
                                <HelpOutlineIcon />
                              </IconButton>
                            </Box>
                          </Box>
                        )}

                        {isLoggedIn && (
                          <>
                            <Tooltip
                              sx={{ borderRadius: "50%" }}
                              title={user?.username || "Пользователь"}
                            >
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
                                      backgroundColor: "rgb(204 204 230)",
                                      borderRadius: "50%",
                                      padding: "2.6px",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      borderRadius: "50%",
                                    }}
                                  >
                                    <Avatar
                                      alt={user?.username}
                                      src={user?.avatar_url}
                                      sx={{
                                        width: isMobile ? 32 : 40,
                                        height: isMobile ? 32 : 40,
                                        borderRadius: "50%",
                                      }}
                                    />
                                  </Box>
                                </Box>
                              </ButtonBase>
                            </Tooltip>
                          </>
                        )}
                      </Toolbar>
                    </motion.header>
                  </AnimatePresence>

                  {/* Drawer - показываем только если не на главной странице, или если showMenu=true */}
                  <AnimatePresence>
                    {(showMenu ||
                      (location.pathname !== "/" &&
                        location.pathname !== "/docs")) && (
                      <motion.div
                        key="left-drawer"
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -100, opacity: 0 }}
                        transition={{ duration: 0.1 }}
                      >
                        <Box component="nav" sx={{ flexShrink: { sm: 0 } }}>
                          {isMobile ? (
                            <ResponsiveDrawer
                              variant="temporary"
                              drawerWidth={isDocsPage ? 120 : 74}
                              open={mobileOpen}
                              onClose={handleDrawerToggle}
                              isMobile={isMobile}
                              isDocsPage={isDocsPage}
                              handleDrawerToggle={handleDrawerToggle}
                              isSmallDesktop={isSmallDesktop}
                              isTablet={isTablet}
                              menuItems={menuItems}
                              location={location}
                              anchor="left"
                            />
                          ) : (
                            <ResponsiveDrawer
                              variant="permanent"
                              drawerWidth={drawerWidth}
                              isMobile={isMobile}
                              isDocsPage={isDocsPage}
                              handleDrawerToggle={handleDrawerToggle}
                              isSmallDesktop={isSmallDesktop}
                              isTablet={isTablet}
                              menuItems={menuItems}
                              location={location}
                              anchor="left"
                            />
                          )}
                        </Box>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}

              <motion.main
                style={{
                  flexGrow: 1,
                  height: "100dvh",
                  overflowX: "hidden",
                  overflowY: "hidden",
                }}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  marginLeft: isMobile || isMainPage ? 0 : drawerWidthPx,
                  marginRight:
                    isMobile || isMainPage || isDocsPage ? 0 : drawerWidthPx,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
                <Box
                  id="main-content"
                  sx={{
                    minHeight: "90vh",
                    height: isDocsPage ? "calc(100vh - 64px)" : "",
                    backgroundColor: "#FFFFFF",
                    padding: { lg: "25px", xl: "35px", xs: "20px" },
                    marginTop: { xs: "56px", sm: "64px" },
                    borderRadius: { xs: "0px", sm: "20px" },
                    overflowY: "auto !important",
                    overflowX: "hidden",
                  }}
                >
                  <Router
                    isMobile={isMobile}
                    isTablet={isTablet}
                    shouldRenderContent={shouldRenderContent}
                    setAuthenticating={setAuthenticating}
                    dashboardMenuItems={dashboardMenuItems}
                    itemsInRow={itemsInRow}
                    itemsInLastRow={itemsInLastRow}
                    setShowMenu={setShowMenu}
                    total={total}
                  />
                </Box>
              </motion.main>

              <AnimatePresence>
                {(showMenu ||
                  (location.pathname !== "/" &&
                    !location.pathname.startsWith("/docs"))) && (
                  <motion.div
                    key="right-drawer"
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 100, opacity: 0 }}
                    transition={{ duration: 0.1 }}
                  >
                    <Box component="nav" sx={{ flexShrink: { sm: 0 } }}>
                      {!isMobile && (
                        <ResponsiveDrawer
                          variant="permanent"
                          drawerWidth={drawerWidth}
                          isMobile={isMobile}
                          isDocsPage={isDocsPage}
                          handleDrawerToggle={handleDrawerToggle}
                          isSmallDesktop={isSmallDesktop}
                          isTablet={isTablet}
                          menuItems={rightMenuItems}
                          location={location}
                          anchor="right"
                        />
                      )}
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>
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
          onClose={() => dispatch(setOpenCaptchaModal(false))}
        />
      )}

      <Popover
        open={isEventsOpen}
        anchorEl={eventsAnchorEl}
        onClick={handleEventsClose}
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
    </Box>
  );
}
