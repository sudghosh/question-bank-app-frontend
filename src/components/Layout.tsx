import React from 'react';
import { AppBar, Box, CssBaseline, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography, Tooltip } from '@mui/material';
import { 
  Menu as MenuIcon, 
  Home, 
  Description, 
  Assignment, 
  Person, 
  ExitToApp, 
  Brightness4, 
  Brightness7,
  Assessment,
  VpnKey,
  Quiz,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

const drawerWidth = 240;

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { user, isAdmin, logout } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };  const menuItems = [
    { text: 'Home', icon: <Home />, path: '/' },
    { text: 'Tests', icon: <Assignment />, path: '/practice-test' },
    { text: 'Full Mock Test', icon: <Quiz />, path: '/mock-test' },
    { text: 'Results', icon: <Description />, path: '/results' },
    { text: 'Performance Dashboard', icon: <Assessment />, path: '/performance-dashboard' },
    ...(isAdmin ? [
      { text: 'Question Bank', icon: <Description />, path: '/questions' },
      { text: 'Papers & Sections', icon: <Description />, path: '/papers' },
      { text: 'API Key Management', icon: <VpnKey />, path: '/admin/api-keys' },
      { text: 'Users', icon: <Person />, path: '/manage/users' },
    ] : []),
  ];

  const drawer = (
    <div>      <Toolbar>
        <Typography variant="h6" noWrap>
          CBT
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem button key={item.text} onClick={() => navigate(item.path)}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        <ListItem button onClick={logout}>
          <ListItemIcon><ExitToApp /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {user?.first_name ? `Welcome, ${user.first_name}` : 'Welcome'}
          </Typography>
          <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton onClick={toggleTheme} color="inherit">
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};
