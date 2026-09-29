import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Container,
  CssBaseline,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  DashboardRounded as DashboardIcon,
  DescriptionRounded as DescriptionIcon,
  ManageSearchRounded as ManageSearchIcon,
  WorkRounded as WorkIcon,
  SendRounded as SendIcon,
  RateReviewRounded as RateReviewIcon,
  SettingsRounded as SettingsIcon,
  StorageRounded as StorageIcon,
  LanguageRounded as LanguageIcon,
  CheckCircleRounded as CheckCircleIcon,
  ErrorOutlineRounded as ErrorOutlineIcon,
  BoltRounded as BoltIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useDice } from '../context/DiceContext';

const DRAWER_WIDTH = 265;

interface NavItem {
  text: string;
  path: string;
  icon: React.ReactElement;
  badge?: string;
}

const navItems: NavItem[] = [
  { text: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { text: 'Resume Library', path: '/resumes', icon: <DescriptionIcon />, badge: '~40 Files' },
  { text: 'Search Profiles', path: '/search-profiles', icon: <ManageSearchIcon /> },
  { text: 'Jobs Explorer', path: '/jobs', icon: <WorkIcon /> },
  { text: 'Applications', path: '/applications', icon: <SendIcon /> },
  { text: 'Review Queue', path: '/review', icon: <RateReviewIcon /> },
  { text: 'Settings', path: '/settings', icon: <SettingsIcon /> },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState<'connected' | 'error' | 'checking'>('checking');
  const { diceStatus } = useDice();

  useEffect(() => {
    api.getHealth()
      .then((data) => {
        setDbStatus(data.database === 'connected' ? 'connected' : 'error');
      })
      .catch(() => setDbStatus('error'));


  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const currentNav = navItems.find((n) => n.path === location.pathname);

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#090d16',
        color: '#f8fafc',
        borderRight: '1px solid rgba(255, 255, 255, 0.07)',
      }}
    >
      {/* Brand Header */}
      <Box sx={{ p: 2.75, display: 'flex', alignItems: 'center', gap: 1.75 }}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.45)',
          }}
        >
          <WorkIcon sx={{ color: '#fff', fontSize: 24 }} />
        </Box>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#ffffff', lineHeight: 1.15, letterSpacing: '-0.02em', fontSize: '1.05rem' }}>
              DiceAuto
            </Typography>
            <Chip
              label="PRO"
              size="small"
              sx={{
                height: 18,
                fontSize: '0.62rem',
                fontWeight: 800,
                bgcolor: 'rgba(99, 102, 241, 0.25)',
                color: '#a5b4fc',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                px: 0.25,
              }}
            />
          </Box>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.74rem' }}>
            Job Automation Engine
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.06)', mx: 2 }} />

      {/* Nav List */}
      <List sx={{ px: 1.75, py: 2, flex: 1 }}>
        {navItems.map((item) => {
          const selected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.75 }}>
              <ListItemButton
                selected={selected}
                onClick={() => {
                  navigate(item.path);
                  if (mobileOpen) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: '10px',
                  py: 1.1,
                  px: 1.5,
                  color: selected ? '#ffffff' : '#94a3b8',
                  bgcolor: selected
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(139, 92, 246, 0.08) 100%) !important'
                    : 'transparent',
                  borderLeft: selected ? '3.5px solid #6366f1' : '3.5px solid transparent',
                  transition: 'all 0.18s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    color: '#f8fafc',
                    transform: 'translateX(2px)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: selected ? '#818cf8' : '#64748b',
                    minWidth: 36,
                    transition: 'color 0.18s ease',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '0.88rem',
                      fontWeight: selected ? 700 : 500,
                      letterSpacing: '-0.01em',
                    },
                  }}
                />
                {item.badge && (
                  <Chip
                    label={item.badge}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.64rem',
                      fontWeight: 700,
                      bgcolor: 'rgba(16, 185, 129, 0.12)',
                      color: '#34d399',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.06)', mx: 2 }} />

      {/* System Status Footer */}
      <Box sx={{ p: 2, m: 1.5, borderRadius: '12px', bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StorageIcon sx={{ fontSize: 16, color: '#64748b' }} />
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
              MongoDB
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box
              className={dbStatus === 'connected' ? 'radar-dot-active' : ''}
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: dbStatus === 'connected' ? '#10b981' : '#f43f5e',
                boxShadow: dbStatus === 'connected' ? '0 0 8px #10b981' : 'none',
              }}
            />
            <Typography variant="caption" sx={{ color: dbStatus === 'connected' ? '#34d399' : '#fb7185', fontWeight: 700, fontSize: '0.72rem' }}>
              {dbStatus === 'connected' ? 'Online' : 'Offline'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LanguageIcon sx={{ fontSize: 16, color: '#64748b' }} />
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
              Dice Session
            </Typography>
          </Box>
          <Tooltip title={diceStatus?.is_connected ? `Active account: ${diceStatus.username || 'Connected'}` : 'Click Settings to log into Dice'}>
            <Box
              onClick={() => navigate('/settings')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                cursor: 'pointer',
                p: '2px 6px',
                borderRadius: '6px',
                bgcolor: diceStatus?.is_connected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                transition: 'all 0.15s ease',
                '&:hover': { bgcolor: diceStatus?.is_connected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)' },
              }}
            >
              <Box
                className={diceStatus?.is_connected ? 'radar-dot-active' : ''}
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  bgcolor: diceStatus?.is_connected ? '#10b981' : '#f59e0b',
                  boxShadow: diceStatus?.is_connected ? '0 0 8px #10b981' : 'none',
                }}
              />
              <Typography variant="caption" sx={{ color: diceStatus?.is_connected ? '#34d399' : '#fbbf24', fontWeight: 700, fontSize: '0.72rem' }}>
                {diceStatus?.is_connected ? 'Live' : 'Sign In'}
              </Typography>
            </Box>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <CssBaseline />

      {/* Top Glassmorphic AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          bgcolor: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          color: '#0f172a',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1.5, sm: 3 }, minHeight: { xs: 58, sm: 64 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, minWidth: 0 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 0.5, display: { sm: 'none' } }}
              aria-label="open navigation drawer"
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 800,
                  color: '#0f172a',
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  letterSpacing: '-0.02em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: { xs: 170, sm: 320, md: 'none' },
                }}
              >
                {currentNav?.text || 'Dice Application Automation'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', display: { xs: 'none', md: 'block' }, lineHeight: 1 }}>
                Automated matching & protected Playwright submission
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 1.25 }, shrink: 0 }}>
            <Tooltip title={diceStatus?.is_connected ? `Connected as ${diceStatus.username || 'Dice User'}` : 'Dice disconnected. Click to sign in.'}>
              <Chip
                icon={diceStatus?.is_connected ? <CheckCircleIcon sx={{ fontSize: '13px !important', color: '#10b981' }} /> : <ErrorOutlineIcon sx={{ fontSize: '13px !important', color: '#f59e0b' }} />}
                label={
                  diceStatus?.is_connected
                    ? (diceStatus.username || 'Dice: Connected')
                    : 'Dice: Sign In'
                }
                onClick={() => navigate('/settings')}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  bgcolor: diceStatus?.is_connected ? '#ecfdf5' : '#fffbeb',
                  color: diceStatus?.is_connected ? '#065f46' : '#92400e',
                  border: '1px solid',
                  borderColor: diceStatus?.is_connected ? '#a7f3d0' : '#fde68a',
                  transition: 'all 0.15s ease',
                  '&:hover': { bgcolor: diceStatus?.is_connected ? '#d1fae5' : '#fef3c7' },
                }}
              />
            </Tooltip>

            <Chip
              icon={<BoltIcon sx={{ fontSize: '14px !important', color: '#6366f1' }} />}
              label="Playwright Agent Ready"
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.72rem',
                display: { xs: 'none', lg: 'inline-flex' },
                bgcolor: '#eef2ff',
                color: '#3730a3',
                border: '1px solid #c7d2fe',
              }}
            />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Navigation */}
      <Box component="nav" sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          slotProps={{
            paper: {
              sx: { boxSizing: 'border-box', width: DRAWER_WIDTH, border: 'none' },
            },
          }}
          sx={{ display: { xs: 'block', sm: 'none' } }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          slotProps={{
            paper: {
              sx: { boxSizing: 'border-box', width: DRAWER_WIDTH, border: 'none' },
            },
          }}
          sx={{ display: { xs: 'none', sm: 'block' } }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 3.5 },
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8.5,
          bgcolor: '#f8fafc',
          minHeight: 'calc(100vh - 68px)',
        }}
      >
        <Container maxWidth="xl" disableGutters sx={{ maxWidth: '1600px !important' }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};
