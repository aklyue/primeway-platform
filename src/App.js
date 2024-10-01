import React, { useContext } from 'react';
import {
  BrowserRouter as Router,
  Routes, Route, Link, useLocation,
} from 'react-router-dom';
import {
  Drawer, List, ListItem, ListItemText, Divider, Toolbar,
  CssBaseline, AppBar, Box, Button,
} from '@mui/material';
import RunningJobs from './components/RunningJobs';
import CompletedJobs from './components/CompletedJobs';
import Billing from './components/Billing';
import ApiKeys from './components/ApiKeys';
import Settings from './components/Settings';
import Register from './components/Register';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import LogoutButton from './components/LogoutButton';
import LandingPage from './landing-new/LandingPage'; // Import LandingPage
import { AuthContext } from './AuthContext'; // Import AuthContext
import Cursor from './landing-new/Cursor';

const drawerWidth = 240;

function Layout() {
  const { isLoggedIn } = useContext(AuthContext); // Access login state via useContext
  const location = useLocation(); // Access current location

  const isLandingPage = location.pathname === '/'; // Check if current route is the landing page

  return (
    <Box sx={{ display: 'flex', padding: 0, margin: 0, width: '100%', height: isLandingPage ? 'auto' : '100%' }}>
      <Cursor />
      <CssBaseline />

      {!isLandingPage && (
        <>
          <AppBar 
            position="fixed" 
            sx={{ padding: 0, zIndex: (theme) => theme.zIndex.drawer + 1 }}
          >
            <Toolbar>
              <Box sx={{ flexGrow: 1 }} />
              {isLoggedIn ? (
                <LogoutButton />
              ) : (
                <>
                  <Button color="inherit" component={Link} to="/login">Login</Button>
                  <Button color="inherit" component={Link} to="/register">Register</Button>
                </>
              )}
            </Toolbar>
          </AppBar>

          <Drawer
            variant="permanent"
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
              }
            }}
          >
            <Toolbar />
            <Divider />
            <List>
              {isLoggedIn && (
                <>
                  <ListItem button component={Link} to="/running-jobs">
                    <ListItemText primary="Running Jobs" />
                  </ListItem>
                  <ListItem button component={Link} to="/completed-jobs">
                    <ListItemText primary="Completed Jobs" />
                  </ListItem>
                  <ListItem button component={Link} to="/billing">
                    <ListItemText primary="Billing" />
                  </ListItem>
                  <ListItem button component={Link} to="/api-keys">
                    <ListItemText primary="API Keys" />
                  </ListItem>
                  <ListItem button component={Link} to="/settings">
                    <ListItemText primary="Settings" />
                  </ListItem>
                </>
              )}
            </List>
          </Drawer>
        </>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: isLandingPage ? 0 : 3, // Conditional padding
          background: isLandingPage ? 'radial-gradient(circle, #7816EF, #140729);' : 'inherit', // Background color for the landing page
          margin: 0,
          width: '100%',
          minHeight: '100vh',
        }}
      >
        {!isLandingPage && <Toolbar />}
        <Routes>
          <Route path="/" element={<LandingPage />} /> {/* Add LandingPage as the default route */}
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
        </Routes>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;