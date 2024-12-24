import React, { useContext, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
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
  Button,
  Typography,
} from "@mui/material";
import { green } from "@mui/material/colors";
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
import { OrganizationProvider } from "./components/Organization/OrganizationContext";

const drawerWidth = 240;

const HealthCheck = () => {
  React.useEffect(() => {
    console.log("Health check endpoint hit at:", new Date().toISOString());
  }, []);

  // Return a plain text response
  return Response.from(
    new Response("healthy", {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    })
  );
};

function Layout() {
  const { isLoggedIn, user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

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
          {isLoggedIn ? (
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
                <MenuItem onClick={handleLogout}>Log out</MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                variant="outlined"
                component={Link}
                to="/login"
                sx={{
                  color: "#FFFFFF",
                  borderColor: "#353740",
                  "&:hover": {
                    backgroundColor: "#353740",
                  },
                }}
              >
                Login
              </Button>
              <Button
                variant="contained"
                component={Link}
                to="/register"
                sx={{
                  backgroundColor: "#1A7F64",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: green[700],
                  },
                }}
              >
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {isLoggedIn && (
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
      )}

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
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <RunningJobs />
              </ProtectedRoute>
            }
          />
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
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Добавьте дополнительные маршруты, если необходимо */}
        </Routes>
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
