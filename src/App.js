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
import { AuthContext } from './AuthContext';

const drawerWidth = 240;


const HealthCheck = () => {
  React.useEffect(() => {
    console.log('Health check endpoint hit at:', new Date().toISOString());
  }, []);
  
  // Return a plain text response
  return Response.from(new Response('healthy', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain'
    }
  }));
};


function Layout() {
  const { isLoggedIn } = useContext(AuthContext); // Access login state via useContext
  const location = useLocation(); // Access current location

  return (
    <Box sx={{ display: 'flex', padding: 0, margin: 0, width: '100%', height: '100%' }}>
      <CssBaseline />

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

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          background: 'inherit',
          margin: 0,
          width: '100%',
          minHeight: '100vh',
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
          <Route path="/healthz" element={<HealthCheck />} />
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