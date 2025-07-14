import React, { useState, useMemo } from "react";
import Tracker from "./Tracker";
import MapCanvas from "./MapCanvas";
import NetworkStatus from "./NetworkStatus";
import PreviousRuns from "./PreviousRuns";
import Dashboard from "./Dashboard";
import SessionSummaryModal from "./SessionSummaryModal";
import { Container, CssBaseline, Typography, Box, AppBar, Toolbar, IconButton, Switch, useMediaQuery, Snackbar, Alert } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import './App.css'

function App() {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState(prefersDark);
  const [path, setPath] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);
  const [runs, setRuns] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("jogger_runs") || "[]");
    } catch {
      return [];
    }
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showSummary, setShowSummary] = useState(false);
  const [summaryRun, setSummaryRun] = useState(null);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(s => ({ ...s, open: false }));
  };

  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#1976d2' },
      secondary: { main: '#ff9800' },
      background: {
        default: darkMode ? '#181c24' : '#f4f6fa',
        paper: darkMode ? '#232936' : '#fff',
      },
    },
    shape: { borderRadius: 16 },
    typography: { fontFamily: 'Inter, Roboto, Arial, sans-serif' },
    components: {
      MuiContainer: {
        styleOverrides: {
          root: {
            paddingLeft: 8,
            paddingRight: 8,
            '@media (min-width:600px)': { paddingLeft: 16, paddingRight: 16 },
            '@media (min-width:900px)': { paddingLeft: 24, paddingRight: 24 },
          },
        },
      },
    },
  }), [darkMode]);

  // Handler to show a previous run on the map
  const handleSelectRun = (run) => {
    setSelectedRun(run);
  };
  // Handler to show live tracking again
  const handleShowLive = () => {
    setSelectedRun(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="sticky" elevation={2} color="primary" sx={{ mb: { xs: 2, sm: 4 } }}>
        <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
          <DirectionsRunIcon sx={{ mr: 1 }} fontSize="large" />
          <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1, fontSize: { xs: 18, sm: 24 } }}>
            Smart Jogger’s Companion
          </Typography>
          <IconButton sx={{ ml: 1 }} color="inherit" onClick={() => setDarkMode((m) => !m)}>
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <Switch checked={darkMode} onChange={() => setDarkMode((m) => !m)} color="default" />
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm" sx={{ pb: { xs: 2, sm: 4 }, minHeight: '100vh' }}>
        <Box sx={{ my: { xs: 2, sm: 4 }, px: { xs: 0, sm: 2 } }}>
          <Dashboard runs={runs} />
          <NetworkStatus />
          <Tracker onPathUpdate={setPath} disabled={!!selectedRun} runs={runs} setRuns={setRuns} showSnackbar={showSnackbar} setShowSummary={setShowSummary} setSummaryRun={setSummaryRun} />
          <MapCanvas path={selectedRun ? selectedRun.path : path} run={selectedRun} onShowLive={handleShowLive} />
          <PreviousRuns onSelectRun={handleSelectRun} selectedRun={selectedRun} runs={runs} setRuns={setRuns} showSnackbar={showSnackbar} />
        </Box>
      </Container>
      <SessionSummaryModal open={showSummary} onClose={() => setShowSummary(false)} run={summaryRun} />
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;
