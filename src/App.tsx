import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, Link, useNavigate } from 'react-router-dom'
import { AppBar, Toolbar, Typography, IconButton, Box, Button, Container, Avatar, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material'
import { Globe, LogOut, Moon, Settings2, Settings2Icon, Sun } from "lucide-react";
import MenuIcon from '@mui/icons-material/Menu'
import Dashboard from './pages/Dashboard'
import Tweets from './pages/Tweets'
import Scheduler from './pages/Scheduler'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Register from './pages/Register'
import OAuthCallback from './pages/OAuthCallback'
import { useAuthStore } from './store/auth'
import { useUiStore } from './store/ui'
import { SettingsAccessibility } from '@mui/icons-material';
import { BACKEND_BASE } from './api/client';

const Protected = ({ children }: { children: JSX.Element }) => {
  const token = useAuthStore(s => s.token)
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { token, restore } = useAuthStore()
  const user = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)
  const toggle = useUiStore(s => s.toggleMode)
  const mode = useUiStore(s => s.mode)
  const location = useLocation()
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  
  useEffect(() => { restore() }, [restore])
  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <IconButton size="large" edge="start" color="inherit" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Twitter Scheduler</Typography>
          <Button color="inherit" component={Link} to="/">Dashboard</Button>
          <Button color="inherit" component={Link} to="/tweets">Tweets</Button>
          <Button color="inherit" component={Link} to="/scheduler">Scheduler</Button>
          <Button color="inherit" href={`${BACKEND_BASE}/api/docs`} target="_blank">API Docs</Button>
          <Button color="inherit"
            onClick={e => setAnchorEl(e.currentTarget)}
            aria-controls={open ? 'settings-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
           ><Settings2 /></Button>
           <Menu
            id="settings-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={() => { setAnchorEl(null); navigate('/settings'); }}>
              <ListItemIcon><Globe size={18} /></ListItemIcon>
              <ListItemText>Time Zone</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { toggle(); setAnchorEl(null); }}>
              <ListItemIcon>{mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</ListItemIcon>
              <ListItemText>Theme: {mode === 'dark' ? 'Light' : 'Dark'}</ListItemText>
            </MenuItem>
          </Menu>
          {user && (
            <Box display="flex" alignItems="center" gap={1} ml={1} mr={1}>
              <Avatar sx={{ width: 28, height: 28 }} src={user.avatar}>{(user.name || user.email)?.charAt(0).toUpperCase()}</Avatar>
              <Typography variant="body2">{user.name || user.email}</Typography>
            </Box>
          )}
          {token && (
            <Button color="inherit" onClick={() => { logout(); navigate('/login', { replace: true }) }}><LogOut /></Button>
          )}
        </Toolbar>
      </AppBar>
      <Container sx={{ py: 2 }}>
        <Routes>
          <Route path="/" element={<Protected><Dashboard /></Protected>} />
          <Route path="/tweets" element={<Protected><Tweets /></Protected>} />
          <Route path="/scheduler" element={<Protected><Scheduler /></Protected>} />
          <Route path="/settings" element={<Protected><Settings /></Protected>} />
          <Route path="/login" element={token ? <Navigate to={location.state?.from || '/'} replace /> : <Login />} />
          <Route path="/register" element={token ? <Navigate to="/" replace /> : <Register />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
        </Routes>
      </Container>
    </Box>
  )
}


